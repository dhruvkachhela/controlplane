"""
# How this works:
# This module implements the Tool-Aware Query Rewrite component of ControlPlane.ai.
# It compresses raw conversational queries by removing conversational fluff and filler words
# while strictly preserving all sensitive tokens (<PII_...>, <SECRET_...>) and core user intent.
# It matches the user's intent against available tools discovered in Input 0 and injects
# structured tool annotations to guide downstream agent execution with minimal token overhead.
"""

import re
from typing import List, Optional
from controlplane.models import (
    ContextAssessment,
    MaskedRequest,
    RewrittenQuery,
    ToolDefinition,
)

# Common conversational filler phrases that can be stripped without losing intent
FILLER_PATTERNS: List[str] = [
    r"(?i)\b(?:hello|hey|hi\s+there|good\s+morning|good\s+afternoon)\b[,!\.]?",
    r"(?i)\b(?:i\s+was\s+wondering\s+if\s+you\s+could\s+(?:please\s+)?(?:kindly\s+)?)\b",
    r"(?i)\b(?:i\s+would\s+like\s+to\s+(?:kindly\s+)?ask\s+you\s+to\s+)\b",
    r"(?i)\b(?:could\s+you\s+(?:please\s+)?(?:kindly\s+)?)\b",
    r"(?i)\b(?:can\s+you\s+(?:please\s+)?(?:kindly\s+)?)\b",
    r"(?i)\b(?:please\s+kindly\s+|kindly\s+|please\s+)\b",
    r"(?i)\b(?:tell\s+me\s+)\b",
]

# Keywords mapped to tool names for deterministic tool matching
TOOL_KEYWORD_MAP: dict[str, List[str]] = {
    "search_customer_records": ["customer", "client", "account", "user", "profile", "email", "<pii_email_"],
    "calculate_loan_amortization": ["loan", "amortization", "principal", "interest", "apr", "mortgage", "payment schedule"],
    "generate_invoice_pdf": ["invoice", "pdf", "receipt", "billing document", "bill"],
    "lookup_system_status": ["system status", "uptime", "server", "gateway", "operational status", "health check"],
    "query_knowledge_base": ["policy", "documentation", "guideline", "handbook", "standard operating procedure"],
}


def compress_query_text(raw_text: str) -> str:
    """
    Remove conversational filler phrases and redundancy to produce a concise query string.
    
    This function applies regex substitution to strip conversational fluff while keeping
    domain nouns, numerical values, and token placeholders strictly intact.
    
    Parameters:
        raw_text (str): The input query string to compress.
        
    Returns:
        str: Compressed and trimmed query string.
    """
    processed_text: str = raw_text

    # Strip filler expressions sequentially
    for filler_regex in FILLER_PATTERNS:
        processed_text = re.sub(filler_regex, "", processed_text)

    # Clean up any leftover multiple whitespace characters
    cleaned_text: str = re.sub(r"\s+", " ", processed_text).strip()
    
    # Capitalize the first character of the resulting cleaned string if non-empty
    if cleaned_text:
        cleaned_text = cleaned_text[0].upper() + cleaned_text[1:]

    return cleaned_text


def match_relevant_tools(query_text: str, available_tools: List[ToolDefinition]) -> List[str]:
    """
    Match available tools against query semantics and keywords.
    
    This function analyzes the query text to identify which discovered tools are needed
    to satisfy the user request.
    
    Parameters:
        query_text (str): The query string to analyze.
        available_tools (List[ToolDefinition]): The list of discovered tools.
        
    Returns:
        List[str]: List of matched tool names.
    """
    matched_tools: List[str] = []
    normalized_query: str = query_text.lower()

    # Check keyword associations for each available tool
    for single_tool in available_tools:
        tool_name: str = single_tool.name
        keywords_for_tool: List[str] = TOOL_KEYWORD_MAP.get(tool_name, [tool_name.replace("_", " ")])
        
        # If any keyword matches the query, include the tool
        for keyword in keywords_for_tool:
            if keyword in normalized_query:
                if tool_name not in matched_tools:
                    matched_tools.append(tool_name)
                break

    return matched_tools


def rewrite_query(
    masked_request: MaskedRequest,
    context_assessment: ContextAssessment,
    available_tools: Optional[List[ToolDefinition]] = None,
) -> RewrittenQuery:
    """
    Rewrite, compress, and inject required tools into the query payload.
    
    This function optimizes the query for the downstream enterprise agent.
    If context is insufficient, it leaves the query un-rewritten and preserves
    the context assessment flags. If sufficient, it compresses fluff and injects
    matched tool requirements while strictly preserving all sensitive tokens.
    
    Parameters:
        masked_request (MaskedRequest): The sanitized input query object.
        context_assessment (ContextAssessment): The outcome of the context check.
        available_tools (Optional[List[ToolDefinition]]): The list of available tools.
        
    Returns:
        RewrittenQuery: Object containing the optimized query, matched tools, and compression ratio.
    """
    original_text: str = masked_request.masked_query
    tools_list: List[ToolDefinition] = available_tools if available_tools is not None else []

    # If context is insufficient, do not synthesize agent rewrite
    if not context_assessment.is_sufficient:
        return RewrittenQuery(
            request_id=masked_request.request_id,
            original_masked_query=original_text,
            rewritten_query=original_text,
            context_assessment=context_assessment,
            tools_referenced=[],
            compression_ratio=1.0,
        )

    # 1. Compress fluff and redundant phrasing
    compressed_body: str = compress_query_text(original_text)

    # 2. Match tools required for the task
    matched_tool_names: List[str] = match_relevant_tools(original_text, tools_list)

    # 3. Inject tool hints if any matching tools were identified
    if matched_tool_names:
        tools_annotation: str = f"[TOOLS: {', '.join(matched_tool_names)}]"
        structured_rewritten_query: str = f"{tools_annotation} {compressed_body}"
    else:
        structured_rewritten_query = compressed_body

    # 4. Calculate compression ratio
    raw_length: int = max(len(original_text), 1)
    compressed_length: int = len(compressed_body)
    computed_ratio: float = round(compressed_length / raw_length, 3)

    result: RewrittenQuery = RewrittenQuery(
        request_id=masked_request.request_id,
        original_masked_query=original_text,
        rewritten_query=structured_rewritten_query,
        context_assessment=context_assessment,
        tools_referenced=matched_tool_names,
        compression_ratio=computed_ratio,
    )
    return result
