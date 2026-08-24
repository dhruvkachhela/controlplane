"""
# How this works:
# This module implements the Context Check and Tool Discovery (Input 0) components.
# Tool discovery queries or registers available agent capabilities once at startup.
# The context evaluation engine inspects incoming masked queries to determine whether
# sufficient parameters and nouns exist for the enterprise agent to fulfill the request.
# If a query is ambiguous, missing required IDs, or composed of vague pronouns,
# it flags the query as insufficient and provides suggested clarifying follow-up questions.
"""

import datetime
import re
from typing import List, Optional
from controlplane.models import (
    ContextAssessment,
    MaskedRequest,
    ToolDefinition,
    ToolDiscoveryResult,
)

# Standard default tool catalog for simulated enterprise agent
DEFAULT_ENTERPRISE_TOOLS: List[ToolDefinition] = [
    ToolDefinition(
        name="search_customer_records",
        description="Search customer accounts by customer_id or email address.",
        parameters={"customer_id": "string", "email": "string"},
    ),
    ToolDefinition(
        name="calculate_loan_amortization",
        description="Calculate loan payments, principal, and interest schedule.",
        parameters={"principal": "float", "annual_rate": "float", "term_months": "int"},
    ),
    ToolDefinition(
        name="generate_invoice_pdf",
        description="Generate and download a PDF invoice for a given invoice_id.",
        parameters={"invoice_id": "string"},
    ),
    ToolDefinition(
        name="lookup_system_status",
        description="Check operational uptime and service status across enterprise servers.",
        parameters={"service_name": "string"},
    ),
    ToolDefinition(
        name="query_knowledge_base",
        description="Query enterprise policy and operational documentation.",
        parameters={"query_topic": "string"},
    ),
]

# Patterns representing vague actions without explicit subjects
VAGUE_PRONOUN_PATTERNS: List[str] = [
    r"(?i)\b(?:update|delete|cancel|send|process|do|fix|run|change)\s+(?:it|that|this|them|those)\b",
    r"(?i)\b(?:can\s+you\s+)?(?:check|verify|lookup)\s+(?:it|that|this)\b",
]

# Specific operational patterns that require mandatory identifiers
PARAMETER_REQUISITES: List[dict] = [
    {
        "trigger": r"(?i)\b(?:generate|download|view|fetch)\s+(?:the\s+)?invoice\b",
        "missing_check": r"(?i)\b(?:inv-\d+|invoice[_\s]?id|\d{4,})\b",
        "reason": "Query requests invoice generation but is missing a specific invoice identifier (e.g. INV-XXXX).",
        "followup": "Could you please provide the specific Invoice ID for the invoice you want to generate?",
    },
    {
        "trigger": r"(?i)\b(?:check|view|get)\s+(?:the\s+)?(?:account\s+)?balance\b",
        "missing_check": r"(?i)\b(?:acc-\d+|account[_\s]?id|<PII_|<SECRET_|\d{4,})\b",
        "reason": "Query requests account balance without providing an account number or customer identifier.",
        "followup": "Please provide the account number or customer ID to check the balance.",
    },
    {
        "trigger": r"(?i)\b(?:transfer|send)\s+(?:funds|money|cash)\b",
        "missing_check": r"(?i)\b(?:\$\d+|\d+\s*dollars|to\s+[a-z0-9_]+)\b",
        "reason": "Query requests money transfer without specifying the transfer amount or destination recipient.",
        "followup": "Please specify the transfer amount and the destination account details.",
    },
]


def discover_tools(custom_tools: Optional[List[ToolDefinition]] = None) -> ToolDiscoveryResult:
    """
    Perform Input 0 tool introspection to discover what tools the enterprise agent possesses.
    
    This function initializes and returns the tool registry available to the agent.
    If custom tools are supplied, it registers them; otherwise, it loads the default enterprise tool set.
    
    Parameters:
        custom_tools (Optional[List[ToolDefinition]]): Optional list of custom tool definitions.
        
    Returns:
        ToolDiscoveryResult: Object containing the list of discovered tools and metadata.
    """
    active_tools: List[ToolDefinition] = custom_tools if custom_tools is not None else list(DEFAULT_ENTERPRISE_TOOLS)
    current_time_iso: str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    result: ToolDiscoveryResult = ToolDiscoveryResult(
        tools=active_tools,
        discovery_timestamp=current_time_iso,
        source_endpoint="enterprise_agent://introspect/tools",
    )
    return result


def evaluate_context(
    masked_request: MaskedRequest,
    available_tools: Optional[List[ToolDefinition]] = None,
) -> ContextAssessment:
    """
    Evaluate whether a masked query contains sufficient context for the agent to answer.
    
    This function analyzes the query text against ambiguity patterns, vague pronouns,
    and missing prerequisite parameters. If insufficient information is detected,
    it returns an assessment flagging the query for human escalation.
    
    Parameters:
        masked_request (MaskedRequest): The sanitized input query object to evaluate.
        available_tools (Optional[List[ToolDefinition]]): List of tools known to the agent.
        
    Returns:
        ContextAssessment: Object with sufficiency status, missing reason, and suggested followup.
    """
    query_text: str = masked_request.masked_query.strip()
    
    # Check 1: Extremely short or empty query lacking substance
    word_tokens: List[str] = query_text.split()
    if len(word_tokens) < 3 and not any(tag in query_text for tag in ["<PII_", "<SECRET_"]):
        return ContextAssessment(
            is_sufficient=False,
            missing_info_reason="The query is too brief and does not contain enough detail to process.",
            suggested_followup="Could you provide more context or describe what specific task you need help with?",
        )

    # Check 2: Vague pronoun usage without preceding context
    for vague_pattern in VAGUE_PRONOUN_PATTERNS:
        if re.search(vague_pattern, query_text):
            return ContextAssessment(
                is_sufficient=False,
                missing_info_reason="Query uses vague references ('it', 'that', 'this') without specifying the target object.",
                suggested_followup="Could you clarify which specific record, item, or document you are referring to?",
            )

    # Check 3: Domain-specific missing parameters
    for requisite in PARAMETER_REQUISITES:
        trigger_regex: str = requisite["trigger"]
        missing_regex: str = requisite["missing_check"]
        
        # If the trigger action is present but the mandatory identifier is missing
        if re.search(trigger_regex, query_text):
            if not re.search(missing_regex, query_text):
                return ContextAssessment(
                    is_sufficient=False,
                    missing_info_reason=requisite["reason"],
                    suggested_followup=requisite["followup"],
                )

    # Query contains sufficient context
    return ContextAssessment(
        is_sufficient=True,
        missing_info_reason=None,
        suggested_followup=None,
    )
