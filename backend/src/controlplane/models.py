"""
# How this works:
# This module defines the complete set of Pydantic data contracts for ControlPlane.ai.
# Each stage of the pipeline (Protect, Prepare, Agent, Validate, Respond) communicates
# using strict, strongly-typed data structures.
# These models ensure that sensitive information is tracked safely, risk scores are validated,
# query rewrites are structured, and validation outcomes are recorded without silent failures.
"""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class RiskTier(str, Enum):
    """
    Enumeration of risk tiers for input classification.
    
    LOW: Normal operation, query proceeds directly.
    MEDIUM: Elevated caution, stricter sampling or extra validation.
    HIGH: Immediate block, request is rejected before reaching the agent.
    """
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class UserRequest(BaseModel):
    """
    Data model representing a raw user query entering the ControlPlane.
    """
    request_id: str = Field(description="Unique identifier for tracking the request through the pipeline.")
    raw_query: str = Field(description="The unprocessed input string entered by the user.")
    session_id: Optional[str] = Field(default=None, description="Optional conversation session identifier.")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp of when the request arrived.")


class MaskedRequest(BaseModel):
    """
    Data model representing a query after PII and secret tokenization.
    """
    request_id: str = Field(description="Identifier matching the original UserRequest.")
    original_query: str = Field(description="The raw query before masking (kept secure in memory).")
    masked_query: str = Field(description="The sanitized query with tokens replacing sensitive data.")
    token_map: Dict[str, str] = Field(default_factory=dict, description="Dictionary mapping replacement tokens back to original plaintext values.")
    detected_entities: List[str] = Field(default_factory=list, description="List of detected sensitive entity types (e.g. EMAIL, API_KEY, PHONE).")


class RiskAssessment(BaseModel):
    """
    Data model capturing the outcome of the risk classification stage.
    """
    request_id: str = Field(description="Identifier matching the UserRequest.")
    risk_tier: RiskTier = Field(description="Assigned risk tier: LOW, MEDIUM, or HIGH.")
    risk_score: float = Field(default=0.0, description="Numerical risk confidence score between 0.0 and 1.0.")
    categories_detected: List[str] = Field(default_factory=list, description="List of risk categories detected, such as financial, legal, or harmful.")
    is_blocked: bool = Field(default=False, description="Flag indicating if the query must be blocked immediately.")
    reason: str = Field(default="", description="Human-readable explanation of the risk assessment verdict.")

class ToolDefinition(BaseModel):
    """
    Data model representing a discovered tool provided by the enterprise agent.
    """
    name: str = Field(description="Unique name identifier for the tool.")
    description: str = Field(description="Summary of what the tool does and when to call it.")
    parameters: Dict[str, str] = Field(default_factory=dict, description="Dictionary mapping parameter names to parameter type descriptions.")


class ToolDiscoveryResult(BaseModel):
    """
    Data model capturing the outcome of the Input 0 tool introspection discovery step.
    """
    tools: List[ToolDefinition] = Field(default_factory=list, description="List of tools available to the enterprise agent.")
    discovery_timestamp: Optional[str] = Field(default=None, description="Timestamp when tools were discovered.")
    source_endpoint: Optional[str] = Field(default=None, description="Endpoint from which tools were introspected.")


class ContextAssessment(BaseModel):
    """
    Data model representing the assessment of query context sufficiency.
    """
    is_sufficient: bool = Field(description="True if the query has sufficient context for the agent to answer, False if clarification is needed.")
    missing_info_reason: Optional[str] = Field(default=None, description="Explanation of what crucial details are missing from the query.")
    suggested_followup: Optional[str] = Field(default=None, description="Suggested question to prompt the user or human operator for more detail.")


class RewrittenQuery(BaseModel):
    """
    Data model representing the query after optimization, context check, and tool awareness.
    """
    request_id: str = Field(description="Identifier matching the UserRequest.")
    original_masked_query: str = Field(description="The masked query before rewriting.")
    rewritten_query: str = Field(description="The compressed, structured, tool-aware query string.")
    context_assessment: ContextAssessment = Field(description="Sufficiency evaluation of the query context.")
    tools_referenced: List[str] = Field(default_factory=list, description="List of tools from the agent tool list matched to this query.")
    compression_ratio: float = Field(default=1.0, description="Ratio of rewritten length to original length.")


class AgentResponse(BaseModel):
    """
    Data model capturing the raw response returned by the enterprise agent.
    """
    request_id: str = Field(description="Identifier matching the UserRequest.")
    query_sent: str = Field(description="The exact rewritten query string sent to the agent.")
    raw_response: str = Field(description="The raw output text returned by the enterprise model.")
    model_name: str = Field(default="poolside/laguna-xs-2.1", description="Name of the model that generated the response.")
    execution_time_seconds: float = Field(default=0.0, description="Time taken for the agent call to execute.")
    prompt_tokens: int = Field(default=0, description="Estimated or actual input token count.")
    completion_tokens: int = Field(default=0, description="Estimated or actual output token count.")
    total_tokens: int = Field(default=0, description="Total tokens consumed by this inference step.")
    cost_estimate: float = Field(default=0.0, description="Estimated computational cost for this inference step in USD.")
    is_simulated: bool = Field(default=False, description="Flag indicating if the response was generated via local simulation.")



class CriticResult(BaseModel):
    """
    Data model for the factual correctness and hallucination evaluation.
    """
    is_factual: bool = Field(default=True, description="True if claims are verified and grounded, False if hallucination is detected.")
    confidence_score: float = Field(default=1.0, description="Confidence score for the factual assessment.")
    explanation: str = Field(default="", description="Detailed rationale for the critic decision.")
    sources_checked: List[str] = Field(default_factory=list, description="List of source URLs or references checked during verification.")


class BiasResult(BaseModel):
    """
    Data model for bias, stereotyping, and fairness evaluation.
    """
    is_unbiased: bool = Field(default=True, description="True if no unfair bias or stereotyping is found, False otherwise.")
    bias_category: Optional[str] = Field(default=None, description="Category of bias detected, if any (e.g. demographic, ideological).")
    confidence_score: float = Field(default=1.0, description="Confidence score for the bias evaluation.")
    explanation: str = Field(default="", description="Detailed explanation of the bias check findings.")


class ValidationResult(BaseModel):
    """
    Combined validation outcome from the Critic and Bias Checker stages.
    """
    request_id: str = Field(description="Identifier matching the UserRequest.")
    is_valid: bool = Field(description="True if the response passes both factual and fairness checks.")
    critic_result: CriticResult = Field(description="Outcome of the factual accuracy evaluation.")
    bias_result: BiasResult = Field(description="Outcome of the bias and policy evaluation.")
    should_retry: bool = Field(default=False, description="Flag indicating if the agent should retry generating a response.")
    retry_guidance: Optional[str] = Field(default=None, description="Constructive feedback or constraints to inject into the retry pass.")
    retry_count: int = Field(default=0, description="The number of retry attempts executed so far.")



class FinalOutput(BaseModel):
    """
    The final output payload returned by ControlPlane to the user or UI.
    """
    request_id: str = Field(description="Identifier matching the UserRequest.")
    final_text: str = Field(description="The final safe, decrypted text presented to the user.")
    is_blocked: bool = Field(default=False, description="Indicates if the request was blocked by guardrails.")
    block_reason: Optional[str] = Field(default=None, description="Reason for blocking if the request was blocked.")
    original_query: str = Field(description="The original user query text.")
    masked_query: str = Field(description="The masked query text used internally.")
    rewritten_query: Optional[str] = Field(default=None, description="The tool-aware compressed and enhanced query text produced in Stage 2.")
    risk_assessment: RiskAssessment = Field(description="The risk evaluation performed on the input.")
    latency_seconds: float = Field(default=0.0, description="Total end-to-end processing latency.")
    prompt_tokens: int = Field(default=0, description="Input prompt tokens count.")
    completion_tokens: int = Field(default=0, description="Generated output tokens count.")
    total_tokens: int = Field(default=0, description="Total tokens consumed across all steps.")
    actual_cost_usd: float = Field(default=0.0, description="Actual SLM inference cost for this execution in USD.")
    frontier_cost_usd: float = Field(default=0.0, description="Estimated inference cost if run on an unconstrained frontier model in USD.")
    net_dollar_savings: float = Field(default=0.0, description="Total dollar savings achieved for this specific query in USD.")
    cost_savings_pct: float = Field(default=38.0, description="Percentage cost reduction achieved compared to un-guarded frontier models.")
    audit_trail: Dict[str, str] = Field(default_factory=dict, description="Audit log mapping each pipeline stage to its status summary.")


