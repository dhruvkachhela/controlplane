"""
# How this works:
# This test module validates the Prepare stage of ControlPlane.ai.
# It tests Tool Discovery (Input 0), Context Sufficiency checking (context_check.py),
# and Tool-Aware Query Rewriting (query_rewrite.py).
# It verifies that underspecified queries are caught before reaching the enterprise agent,
# and that queries with sufficient context are compressed and tagged with required tools.
"""

import pytest

from controlplane.models import (
    ContextAssessment,
    MaskedRequest,
    RewrittenQuery,
    ToolDefinition,
    ToolDiscoveryResult,
)
from controlplane.prepare.context_check import (
    discover_tools,
    evaluate_context,
)
from controlplane.prepare.query_rewrite import (
    compress_query_text,
    match_relevant_tools,
    rewrite_query,
)


@pytest.fixture
def standard_tools() -> list[ToolDefinition]:
    """
    Pytest fixture providing standard enterprise agent tools for testing.
    
    Parameters:
        None
        
    Returns:
        list[ToolDefinition]: List of standard tool definitions.
    """
    tools_list: list[ToolDefinition] = [
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
    ]
    return tools_list


def test_tool_discovery_input_0(standard_tools: list[ToolDefinition]) -> None:
    """
    Test Input 0 tool discovery mechanism returns registered agent capabilities.
    
    Parameters:
        standard_tools (list[ToolDefinition]): Fixture providing tool definitions.
        
    Returns:
        None
    """
    discovery_result: ToolDiscoveryResult = discover_tools(custom_tools=standard_tools)

    assert isinstance(discovery_result, ToolDiscoveryResult)
    assert len(discovery_result.tools) == 4
    tool_names: list[str] = [single_tool.name for single_tool in discovery_result.tools]
    assert "search_customer_records" in tool_names
    assert "calculate_loan_amortization" in tool_names


def test_context_check_sufficient_query(standard_tools: list[ToolDefinition]) -> None:
    """
    Test that a fully specified query is assessed as sufficient.
    
    Parameters:
        standard_tools (list[ToolDefinition]): Fixture providing tool definitions.
        
    Returns:
        None
    """
    masked_req: MaskedRequest = MaskedRequest(
        request_id="req-ctx-01",
        original_query="Calculate the loan payment for principal $50,000 at 5.5% annual rate over 60 months.",
        masked_query="Calculate the loan payment for principal $50,000 at 5.5% annual rate over 60 months.",
        token_map={},
        detected_entities=[],
    )

    assessment: ContextAssessment = evaluate_context(
        masked_request=masked_req,
        available_tools=standard_tools,
    )

    assert assessment.is_sufficient is True
    assert assessment.missing_info_reason is None
    assert assessment.suggested_followup is None


def test_context_check_insufficient_vague_pronoun(standard_tools: list[ToolDefinition]) -> None:
    """
    Test that underspecified queries with ambiguous pronouns are flagged as insufficient.
    
    Parameters:
        standard_tools (list[ToolDefinition]): Fixture providing tool definitions.
        
    Returns:
        None
    """
    masked_req: MaskedRequest = MaskedRequest(
        request_id="req-ctx-02",
        original_query="Can you please update it and send it over?",
        masked_query="Can you please update it and send it over?",
        token_map={},
        detected_entities=[],
    )

    assessment: ContextAssessment = evaluate_context(
        masked_request=masked_req,
        available_tools=standard_tools,
    )

    assert assessment.is_sufficient is False
    assert assessment.missing_info_reason is not None
    assert len(assessment.missing_info_reason) > 0
    assert assessment.suggested_followup is not None


def test_context_check_insufficient_missing_identifier(standard_tools: list[ToolDefinition]) -> None:
    """
    Test that queries requesting entity operations without required identifiers are flagged.
    
    Parameters:
        standard_tools (list[ToolDefinition]): Fixture providing tool definitions.
        
    Returns:
        None
    """
    masked_req: MaskedRequest = MaskedRequest(
        request_id="req-ctx-03",
        original_query="Generate the invoice PDF right away.",
        masked_query="Generate the invoice PDF right away.",
        token_map={},
        detected_entities=[],
    )

    assessment: ContextAssessment = evaluate_context(
        masked_request=masked_req,
        available_tools=standard_tools,
    )

    # Missing invoice_id
    assert assessment.is_sufficient is False
    assert "invoice" in assessment.missing_info_reason.lower() or "identifier" in assessment.missing_info_reason.lower()


def test_query_compression_helper() -> None:
    """
    Test that the query compressor removes conversational fluff and filler words.
    
    Parameters:
        None
        
    Returns:
        None
    """
    fluffy_query: str = (
        "Hello! I was wondering if you could please kindly tell me "
        "what the current operational status of the payment gateway server is?"
    )
    compressed: str = compress_query_text(fluffy_query)

    # Compressed query should be shorter and direct
    assert len(compressed) < len(fluffy_query)
    assert "status of the payment gateway server" in compressed.lower() or "payment gateway" in compressed.lower()


def test_tool_matching_helper(standard_tools: list[ToolDefinition]) -> None:
    """
    Test that relevant tools are matched based on query semantics and keywords.
    
    Parameters:
        standard_tools (list[ToolDefinition]): Fixture providing tool definitions.
        
    Returns:
        None
    """
    query: str = "Search customer records for account <PII_EMAIL_1>"
    matched: list[str] = match_relevant_tools(query, standard_tools)

    assert "search_customer_records" in matched


def test_tool_aware_query_rewrite_preserves_tokens(standard_tools: list[ToolDefinition]) -> None:
    """
    Test that the tool-aware query rewrite injects tool annotations and strictly preserves tokens.
    
    Parameters:
        standard_tools (list[ToolDefinition]): Fixture providing tool definitions.
        
    Returns:
        None
    """
    masked_req: MaskedRequest = MaskedRequest(
        request_id="req-rewrite-01",
        original_query="I would like to kindly ask you to search customer records for user <PII_EMAIL_1>",
        masked_query="I would like to kindly ask you to search customer records for user <PII_EMAIL_1>",
        token_map={"<PII_EMAIL_1>": "client@enterprise.com"},
        detected_entities=["EMAIL"],
    )

    context_eval: ContextAssessment = ContextAssessment(
        is_sufficient=True,
        missing_info_reason=None,
        suggested_followup=None,
    )

    rewritten: RewrittenQuery = rewrite_query(
        masked_request=masked_req,
        context_assessment=context_eval,
        available_tools=standard_tools,
    )

    assert isinstance(rewritten, RewrittenQuery)
    # Check that replacement token was strictly preserved
    assert "<PII_EMAIL_1>" in rewritten.rewritten_query
    # Check tool reference was injected
    assert "search_customer_records" in rewritten.tools_referenced
    assert "[TOOLS:" in rewritten.rewritten_query or "search_customer_records" in rewritten.rewritten_query
    # Check compression ratio is recorded
    assert rewritten.compression_ratio <= 1.0


def test_prepare_stage_insufficient_escalation_flow() -> None:
    """
    Test that an insufficient context query halts before agent execution and returns escalation details.
    
    Parameters:
        None
        
    Returns:
        None
    """
    from controlplane.pipeline import ControlPlanePipeline
    from controlplane.models import FinalOutput

    pipeline: ControlPlanePipeline = ControlPlanePipeline()
    vague_query: str = "Please update it now."
    
    output: FinalOutput = pipeline.process_query(vague_query)

    assert output.is_blocked is False
    assert "Escalated for clarification" in output.final_text or "Context insufficient" in output.final_text
    assert output.audit_trail.get("decision") == "ESCALATED_NEED_CONTEXT"
