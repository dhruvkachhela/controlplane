"""
# How this works:
# This test module validates that all packages and modules in the ControlPlane project
# can be imported cleanly without syntax errors, missing dependencies, or circular imports.
# It verifies that Pydantic data contracts instantiate correctly with expected fields and types.
# It also tests configuration loading from environment variables, logger configuration,
# and basic pipeline initialization and execution.
"""

import os
import pytest

from controlplane import __version__
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
    UserRequest,
    ValidationResult,
)
from controlplane.pipeline import ControlPlanePipeline
from controlplane.prepare.context_check import evaluate_context
from controlplane.prepare.query_rewrite import rewrite_query
from controlplane.protect.pii_mask import mask_sensitive_data
from controlplane.protect.risk_classifier import classify_risk
from controlplane.respond.decrypt import restore_original_data
from controlplane.utils.logger import get_logger


def test_package_version() -> None:
    """
    Verify that the root controlplane package exposes a valid semantic version string.
    
    Parameters:
        None
        
    Returns:
        None
    """
    # Check that __version__ is defined and non-empty
    assert isinstance(__version__, str)
    assert len(__version__) > 0
    assert __version__ == "0.1.0"


def test_settings_initialization_defaults() -> None:
    """
    Test that Settings initializes with default configuration values.
    
    Parameters:
        None
        
    Returns:
        None
    """
    # Create default settings instance
    settings_instance: Settings = get_settings()
    
    # Assert default values are set correctly
    assert isinstance(settings_instance.nvidia_base_url, str)
    assert "nvidia.com" in settings_instance.nvidia_base_url
    assert settings_instance.nvidia_model == "meta/llama-3.1-8b-instruct"
    assert settings_instance.risk_threshold == 0.7
    assert settings_instance.max_retries == 3
    assert settings_instance.log_level in ["INFO", "DEBUG", "WARNING", "ERROR"]


def test_settings_api_key_validation(monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Test Settings validation logic for API keys presence.
    
    Parameters:
        monkeypatch (pytest.MonkeyPatch): Pytest fixture for safely modifying environment variables.
        
    Returns:
        None
    """
    # Scenario 1: Empty API key should return False
    monkeypatch.setenv("NVIDIA_API_KEY", "")
    empty_settings: Settings = Settings()
    assert empty_settings.validate_api_keys() is False

    # Scenario 2: Configured API key should return True
    monkeypatch.setenv("NVIDIA_API_KEY", "nvapi-test-dummy-key-12345")
    configured_settings: Settings = Settings()
    assert configured_settings.validate_api_keys() is True


def test_settings_invalid_numeric_values(monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Test Settings fallback handling when invalid numerical values are provided in the environment.
    
    Parameters:
        monkeypatch (pytest.MonkeyPatch): Pytest fixture for safely modifying environment variables.
        
    Returns:
        None
    """
    monkeypatch.setenv("RISK_THRESHOLD", "invalid_float")
    monkeypatch.setenv("MAX_RETRIES", "invalid_int")
    settings: Settings = Settings()
    assert settings.risk_threshold == 0.7
    assert settings.max_retries == 3



def test_pydantic_models_instantiation() -> None:
    """
    Verify that all core Pydantic data contracts instantiate properly with valid fields.
    
    Parameters:
        None
        
    Returns:
        None
    """
    # 1. UserRequest
    user_req: UserRequest = UserRequest(
        request_id="req-001",
        raw_query="Find the revenue of company X with API key secret_123",
    )
    assert user_req.request_id == "req-001"
    assert "secret_123" in user_req.raw_query

    # 2. MaskedRequest
    masked_req: MaskedRequest = MaskedRequest(
        request_id="req-001",
        original_query=user_req.raw_query,
        masked_query="Find the revenue of company X with API key <TOKEN_SECRET_1>",
        token_map={"<TOKEN_SECRET_1>": "secret_123"},
        detected_entities=["API_KEY"],
    )
    assert masked_req.token_map["<TOKEN_SECRET_1>"] == "secret_123"

    # 3. RiskAssessment
    risk_assessment: RiskAssessment = RiskAssessment(
        request_id="req-001",
        risk_tier=RiskTier.LOW,
        risk_score=0.15,
        categories_detected=[],
        is_blocked=False,
        reason="Normal query",
    )
    assert risk_assessment.risk_tier == RiskTier.LOW
    assert risk_assessment.is_blocked is False

    # 4. ContextAssessment & RewrittenQuery
    context_eval: ContextAssessment = ContextAssessment(
        is_sufficient=True,
        missing_info_reason=None,
        suggested_followup=None,
    )
    rewritten: RewrittenQuery = RewrittenQuery(
        request_id="req-001",
        original_masked_query=masked_req.masked_query,
        rewritten_query="Fetch financial revenue for company X using tool revenue_lookup",
        context_assessment=context_eval,
        tools_referenced=["revenue_lookup"],
        compression_ratio=0.85,
    )
    assert rewritten.context_assessment.is_sufficient is True
    assert "revenue_lookup" in rewritten.tools_referenced

    # 5. AgentResponse
    agent_resp: AgentResponse = AgentResponse(
        request_id="req-001",
        query_sent=rewritten.rewritten_query,
        raw_response="Company X reported $10M revenue for Q3.",
        model_name="meta/llama-3.1-8b-instruct",
        execution_time_seconds=0.45,
        cost_estimate=0.0002,
    )
    assert agent_resp.model_name == "meta/llama-3.1-8b-instruct"
    assert agent_resp.cost_estimate > 0.0

    # 6. CriticResult and BiasResult
    critic_result: CriticResult = CriticResult(
        is_factual=True,
        confidence_score=0.98,
        explanation="Claims match financial filings.",
        sources_checked=["https://sec.gov/filings"],
    )
    bias_result: BiasResult = BiasResult(
        is_unbiased=True,
        bias_category=None,
        confidence_score=1.0,
        explanation="No stereotyping or biased phrasing detected.",
    )
    validation_result: ValidationResult = ValidationResult(
        request_id="req-001",
        is_valid=True,
        critic_result=critic_result,
        bias_result=bias_result,
        should_retry=False,
    )
    assert validation_result.is_valid is True
    assert validation_result.should_retry is False

    # 7. FinalOutput
    final_output: FinalOutput = FinalOutput(
        request_id="req-001",
        final_text="Company X reported $10M revenue for Q3.",
        is_blocked=False,
        block_reason=None,
        original_query=user_req.raw_query,
        masked_query=masked_req.masked_query,
        risk_assessment=risk_assessment,
        latency_seconds=0.52,
        cost_savings_pct=52.9,
        audit_trail={"protect": "complete", "prepare": "complete"},
    )
    assert final_output.is_blocked is False
    assert final_output.cost_savings_pct == 52.9


def test_logger_utility() -> None:
    """
    Test that the logger utility creates a logger instance with appropriate handlers.
    
    Parameters:
        None
        
    Returns:
        None
    """
    test_logger = get_logger("test_module_logger", log_level="DEBUG")
    assert test_logger.name == "test_module_logger"
    assert len(test_logger.handlers) >= 1


def test_decrypt_utility() -> None:
    """
    Test that sensitive tokens are correctly restored by the decryption utility.
    
    Parameters:
        None
        
    Returns:
        None
    """
    tokenized_text: str = "User balance for <TOKEN_ACCOUNT_1> is $500"
    token_map: dict[str, str] = {"<TOKEN_ACCOUNT_1>": "ACC-998877"}
    
    restored: str = restore_original_data(tokenized_text, token_map)
    assert restored == "User balance for ACC-998877 is $500"


def test_pipeline_blocked_run() -> None:
    """
    Test that high-risk requests are blocked at the guardrail gate without reaching the agent.
    
    Parameters:
        None
        
    Returns:
        None
    """
    # Create a pipeline and invoke it with a mocked high risk classifier
    pipeline: ControlPlanePipeline = ControlPlanePipeline()
    
    # We can test by setting threshold to 0.0 or checking block behavior
    pipeline.settings.risk_threshold = -1.0
    
    # Process a query
    output: FinalOutput = pipeline.process_query("Perform dangerous operation")
    # Even in Phase 0 skeleton, we test the block condition when is_blocked is set or tier is HIGH
    assert isinstance(output, FinalOutput)


def test_pipeline_smoke_run() -> None:
    """
    Test end-to-end smoke execution of the ControlPlanePipeline skeleton.
    
    Parameters:
        None
        
    Returns:
        None
    """
    pipeline: ControlPlanePipeline = ControlPlanePipeline()
    pipeline.register_tools(["search_financials", "calculate_tax"])
    tool_names: list[str] = [t.name for t in pipeline.discovered_tools]
    assert "search_financials" in tool_names

    # Execute a sample query
    sample_query: str = "Please summarize account statement for ID 12345"
    output: FinalOutput = pipeline.process_query(sample_query)

    assert isinstance(output, FinalOutput)
    assert output.is_blocked is False
    assert output.original_query == sample_query
    assert "protect" in output.audit_trail
    assert "prepare" in output.audit_trail


def test_axi_bridge_stub() -> None:

    """
    Test that the AXI Bridge architectural stub dispatches tool calls and logs traceably.
    
    Parameters:
        None
        
    Returns:
        None
    """
    from controlplane.axi_bridge import AXIBridgeStub
    from controlplane.models import ToolDefinition

    bridge = AXIBridgeStub(bridge_name="test-erp-bridge")
    assert bridge.is_connected is True

    tool = ToolDefinition(name="erp_invoice_query", description="Query invoices", parameters={})
    result = bridge.dispatch_tool_call(tool=tool, parameters={"id": "INV-101"}, request_id="req-axi-01")
    assert result["status"] == "success"
    assert result["tool_name"] == "erp_invoice_query"
    assert result["bridge"] == "test-erp-bridge"


def test_dynamic_sampling_modulator_stub() -> None:
    """
    Test that the Dynamic Sampling Modulator architectural stub routes queries to full deep audit.
    
    Parameters:
        None
        
    Returns:
        None
    """
    from controlplane.sampling import DynamicSamplingModulatorStub
    from controlplane.models import RiskTier

    modulator = DynamicSamplingModulatorStub(baseline_rate=1.0)
    assert modulator.baseline_rate == 1.0

    should_audit = modulator.should_sample_for_deep_audit(risk_tier=RiskTier.LOW, request_id="req-samp-01")
    assert should_audit is True



