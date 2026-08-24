"""
# How this works:
# This module orchestrates the complete ControlPlane guardrail flow.
# It defines the ControlPlanePipeline class that coordinates:
# 1. Protect stage: PII/secret masking and risk classification (HIGH risk hard blocks).
# 2. Prepare stage: Context sufficiency check (insufficient context escalates) and Tool-Aware Query Rewriting.
# 3. Agent execution & Governed Validate Loop: Invokes enterprise model, runs Critic (factuality)
#    and Bias Checker (fairness). If flagged, executes a controlled retry loop capped by MAX_RETRIES.
#    If retries are exhausted without passing validation, it safely escalates to human review.
# 4. Respond stage: Token decryption and final payload delivery.
"""

import time
import uuid
from typing import Dict, List, Optional

from controlplane.agent_interface import AgentInterface
from controlplane.config import Settings, get_settings
from controlplane.models import (
    AgentResponse,
    BiasResult,
    ContextAssessment,
    CriticResult,
    FinalOutput,
    MaskedRequest,
    RewrittenQuery,
    RiskAssessment,
    RiskTier,
    ToolDefinition,
    ToolDiscoveryResult,
    UserRequest,
    ValidationResult,
)
from controlplane.prepare.context_check import discover_tools, evaluate_context
from controlplane.prepare.query_rewrite import rewrite_query
from controlplane.protect.pii_mask import mask_sensitive_data
from controlplane.protect.risk_classifier import classify_risk
from controlplane.respond.decrypt import restore_original_data
from controlplane.utils.logger import get_logger
from controlplane.validate.bias_checker import check_bias_and_fairness
from controlplane.validate.critic import check_factual_accuracy

logger = get_logger(__name__)


class ControlPlanePipeline:
    """
    Main orchestration engine for ControlPlane.ai guardrails.
    """

    def __init__(self, settings: Optional[Settings] = None) -> None:
        """
        Initialize the pipeline with application configuration, agent interface, and tool discovery.
        
        Parameters:
            settings (Optional[Settings]): Settings instance or None to load from environment.
            
        Returns:
            None
        """
        self.settings: Settings = settings if settings is not None else get_settings()
        self.agent_interface: AgentInterface = AgentInterface(self.settings)
        
        # Input 0: Discovers available enterprise agent tools at startup
        discovery_outcome: ToolDiscoveryResult = discover_tools()
        self.discovered_tools: List[ToolDefinition] = discovery_outcome.tools
        logger.info(f"Initialized ControlPlane with {len(self.discovered_tools)} discovered tools.")

    def register_tools(self, tools: List[ToolDefinition | str]) -> None:
        """
        Register or override the list of tools discovered from the enterprise agent.
        
        Parameters:
            tools (List[ToolDefinition | str]): List of ToolDefinition instances or tool name strings.
            
        Returns:
            None
        """
        normalized_tools: List[ToolDefinition] = []
        for tool_item in tools:
            if isinstance(tool_item, ToolDefinition):
                normalized_tools.append(tool_item)
            elif isinstance(tool_item, str):
                normalized_tools.append(
                    ToolDefinition(
                        name=tool_item,
                        description=f"Enterprise tool {tool_item}",
                        parameters={},
                    )
                )
        self.discovered_tools = normalized_tools
        logger.info(f"Registered {len(self.discovered_tools)} enterprise agent tools.")

    def process_query(self, raw_query: str, request_id: Optional[str] = None) -> FinalOutput:
        """
        Execute the full ControlPlane guardrail pipeline for an incoming user query.
        
        Steps executed:
        1. Protect: Mask PII/Secrets + Classify Risk.
        2. High Risk Guard: Immediately hard-block if HIGH risk tier.
        3. Prepare: Evaluate context sufficiency. If insufficient -> Escalate without agent call.
                    If sufficient -> Compress & inject discovered tools.
        4. Agent Call & Validate Loop: Invokes agent and evaluates with Critic + Bias Checker.
           If flagged -> Executes controlled retry loop capped by MAX_RETRIES.
           If retries exhausted -> Escalates safely.
        5. Respond: Decrypt tokenized text and format safe output.
        
        Parameters:
            raw_query (str): The raw text query submitted by the user.
            request_id (Optional[str]): Optional custom ID or auto-generated UUID.
            
        Returns:
            FinalOutput: The complete validated and decrypted response payload.
        """
        start_time: float = time.time()
        
        # Generate unique request identifier if not provided
        active_request_id: str = request_id if request_id is not None else str(uuid.uuid4())
        
        user_request: UserRequest = UserRequest(
            request_id=active_request_id,
            raw_query=raw_query,
        )
        
        audit_trail: Dict[str, str] = {}

        # 1. Protect Stage (PII Masking + Risk Classification)
        masked_request: MaskedRequest = mask_sensitive_data(user_request)
        risk_assessment: RiskAssessment = classify_risk(
            user_request,
            risk_threshold=self.settings.risk_threshold,
        )
        audit_trail["protect"] = f"Masked {len(masked_request.token_map)} items; Risk: {risk_assessment.risk_tier.value}"

        # 2. Risk Evaluation Guard: High risk blocks immediately
        if risk_assessment.is_blocked or risk_assessment.risk_tier == RiskTier.HIGH:
            total_duration: float = time.time() - start_time
            audit_trail["decision"] = "BLOCKED_HIGH_RISK"
            return FinalOutput(
                request_id=active_request_id,
                final_text=f"Request blocked by ControlPlane: {risk_assessment.reason}",
                is_blocked=True,
                block_reason=risk_assessment.reason,
                original_query=raw_query,
                masked_query=masked_request.masked_query,
                risk_assessment=risk_assessment,
                latency_seconds=total_duration,
                audit_trail=audit_trail,
            )

        # 3. Prepare Stage (Context Check + Query Rewrite)
        context_eval: ContextAssessment = evaluate_context(
            masked_request,
            available_tools=self.discovered_tools,
        )

        # If context is insufficient -> Escalate for clarification without calling agent
        if not context_eval.is_sufficient:
            total_duration = time.time() - start_time
            audit_trail["decision"] = "ESCALATED_NEED_CONTEXT"
            audit_trail["prepare"] = f"Context insufficient: {context_eval.missing_info_reason}"
            escalation_message: str = (
                f"Escalated for clarification: {context_eval.missing_info_reason} "
                f"Suggested follow-up: {context_eval.suggested_followup}"
            )
            return FinalOutput(
                request_id=active_request_id,
                final_text=escalation_message,
                is_blocked=False,
                block_reason=None,
                original_query=raw_query,
                masked_query=masked_request.masked_query,
                risk_assessment=risk_assessment,
                latency_seconds=total_duration,
                audit_trail=audit_trail,
            )

        rewritten: RewrittenQuery = rewrite_query(
            masked_request,
            context_assessment=context_eval,
            available_tools=self.discovered_tools,
        )
        audit_trail["prepare"] = f"Context sufficient; Tools: {rewritten.tools_referenced}; Ratio: {rewritten.compression_ratio}"

        # 4. Agent Interface Call + Governed Validate Retry Loop
        max_allowed_retries: int = self.settings.max_retries
        retry_attempt: int = 0
        active_query_payload: str = rewritten.rewritten_query
        
        last_agent_response: Optional[AgentResponse] = None
        last_critic_result: Optional[CriticResult] = None
        last_bias_result: Optional[BiasResult] = None
        validation_passed: bool = False

        while retry_attempt <= max_allowed_retries:
            # Invoke the enterprise agent
            agent_resp: AgentResponse = self.agent_interface.invoke_agent(
                request_id=active_request_id,
                formatted_query=active_query_payload,
            )
            last_agent_response = agent_resp

            # Run Validate stage: Critic (factual accuracy) + Bias Checker (fairness)
            critic_eval: CriticResult = check_factual_accuracy(agent_resp, settings=self.settings)
            bias_eval: BiasResult = check_bias_and_fairness(agent_resp, settings=self.settings)
            
            last_critic_result = critic_eval
            last_bias_result = bias_eval

            # Check if response passed all validation checks
            if critic_eval.is_factual and bias_eval.is_unbiased:
                validation_passed = True
                audit_trail["validate"] = (
                    f"Passed (Retries: {retry_attempt}); Factual: {critic_eval.is_factual}; Unbiased: {bias_eval.is_unbiased}"
                )
                break
            else:
                retry_attempt += 1
                if retry_attempt <= max_allowed_retries:
                    logger.info(
                        f"Validation flagged on attempt {retry_attempt}/{max_allowed_retries}. Triggering controlled retry."
                    )
                    # Formulate controlled feedback guidance to inject into retry pass
                    feedback_items: List[str] = []
                    if not critic_eval.is_factual:
                        feedback_items.append(f"Ensure factual correctness: {critic_eval.explanation}")
                    if not bias_eval.is_unbiased:
                        feedback_items.append(f"Ensure neutrality: {bias_eval.explanation}")
                    
                    retry_guidance: str = "; ".join(feedback_items)
                    active_query_payload = f"[RETRY GUIDANCE: {retry_guidance}] {rewritten.rewritten_query}"

        # If retries exhausted and validation still failing -> Escalate
        if not validation_passed:
            total_duration = time.time() - start_time
            audit_trail["decision"] = "ESCALATED_VALIDATION_FAILED"
            audit_trail["validate"] = (
                f"Failed after {max_allowed_retries} retries: Critic={last_critic_result.explanation if last_critic_result else 'N/A'}; "
                f"Bias={last_bias_result.explanation if last_bias_result else 'N/A'}"
            )
            escalation_message = (
                f"Escalated: Response failed validation after retries. "
                f"Critic: {last_critic_result.explanation if last_critic_result else 'None'}. "
                f"Bias Checker: {last_bias_result.explanation if last_bias_result else 'None'}."
            )
            return FinalOutput(
                request_id=active_request_id,
                final_text=escalation_message,
                is_blocked=False,
                block_reason=None,
                original_query=raw_query,
                masked_query=masked_request.masked_query,
                risk_assessment=risk_assessment,
                latency_seconds=total_duration,
                audit_trail=audit_trail,
            )

        audit_trail["agent"] = f"Model {last_agent_response.model_name} responded in {last_agent_response.execution_time_seconds:.3f}s"

        # 5. Respond Stage (Decrypt tokens back to original data)
        decrypted_response: str = restore_original_data(
            last_agent_response.raw_response,
            masked_request.token_map,
        )
        audit_trail["respond"] = "Data decrypted and finalized"

        total_duration = time.time() - start_time

        final_result: FinalOutput = FinalOutput(
            request_id=active_request_id,
            final_text=decrypted_response,
            is_blocked=False,
            block_reason=None,
            original_query=raw_query,
            masked_query=masked_request.masked_query,
            risk_assessment=risk_assessment,
            latency_seconds=total_duration,
            audit_trail=audit_trail,
        )
        return final_result
