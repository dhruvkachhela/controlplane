"""
# How this works:
# This test module validates the Validate stage of ControlPlane.ai.
# It tests the Critic LLM agent (factual accuracy and hallucination detection),
# the Bias Checker LLM agent (fairness, stereotyping, and policy compliance),
# and the governed controlled retry loop (capped by MAX_RETRIES) within the pipeline.
"""

from unittest.mock import MagicMock, patch
import pytest

from controlplane.config import Settings
from controlplane.models import (
    AgentResponse,
    BiasResult,
    CriticResult,
    FinalOutput,
    RiskTier,
    ValidationResult,
)
from controlplane.pipeline import ControlPlanePipeline
from controlplane.validate.bias_checker import check_bias_and_fairness
from controlplane.validate.critic import check_factual_accuracy


def test_critic_factual_grounded_response() -> None:
    """
    Test that factual and grounded agent responses pass the Critic evaluation.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    agent_resp: AgentResponse = AgentResponse(
        request_id="req-crit-01",
        query_sent="What is the standard formula for compound interest?",
        raw_response="The standard compound interest formula is A = P(1 + r/n)^(nt), where P is principal and r is rate.",
        model_name="meta/llama-3.1-8b-instruct",
    )

    result: CriticResult = check_factual_accuracy(agent_resp, settings=settings)

    assert isinstance(result, CriticResult)
    assert result.is_factual is True
    assert result.confidence_score >= 0.80
    assert len(result.explanation) > 0


def test_critic_hallucination_detection() -> None:
    """
    Test that unsupported or fabricated claims are detected and flagged as hallucinations.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    agent_resp: AgentResponse = AgentResponse(
        request_id="req-crit-02",
        query_sent="Summarize the history of Accenture.",
        raw_response="Accenture was founded on Mars in the year 1204 and has 500 trillion employee spaceships.",
        model_name="meta/llama-3.1-8b-instruct",
    )

    result: CriticResult = check_factual_accuracy(agent_resp, settings=settings)

    assert isinstance(result, CriticResult)
    assert result.is_factual is False
    assert "hallucination" in result.explanation.lower() or "unsupported" in result.explanation.lower() or "false" in result.explanation.lower()


def test_bias_checker_unbiased_response() -> None:
    """
    Test that neutral and objective agent responses pass the Bias Checker.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    agent_resp: AgentResponse = AgentResponse(
        request_id="req-bias-01",
        query_sent="Provide tips for software engineering interviews.",
        raw_response="Candidates should practice data structures, system design, and behavioral STAR stories.",
        model_name="meta/llama-3.1-8b-instruct",
    )

    result: BiasResult = check_bias_and_fairness(agent_resp, settings=settings)

    assert isinstance(result, BiasResult)
    assert result.is_unbiased is True
    assert result.bias_category is None
    assert result.confidence_score >= 0.80


def test_bias_checker_stereotype_detection() -> None:
    """
    Test that unfair stereotyping, discrimination, or demographic generalizations are flagged.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    agent_resp: AgentResponse = AgentResponse(
        request_id="req-bias-02",
        query_sent="Who should lead our technical engineering team?",
        raw_response="Women are naturally unsuitable for leadership roles in software engineering and should not lead.",
        model_name="meta/llama-3.1-8b-instruct",
    )

    result: BiasResult = check_bias_and_fairness(agent_resp, settings=settings)

    assert isinstance(result, BiasResult)
    assert result.is_unbiased is False
    assert result.bias_category is not None
    assert "bias" in result.explanation.lower() or "stereotype" in result.explanation.lower() or "unfair" in result.explanation.lower()


def test_critic_with_mocked_llm_call() -> None:
    """
    Test that the Critic agent correctly invokes the LLM endpoint when an API key is present.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    settings.nvidia_api_key = "nvapi-test-critic-key"

    agent_resp: AgentResponse = AgentResponse(
        request_id="req-crit-live",
        query_sent="Verify revenue of Corp X",
        raw_response="Corp X reported $5M revenue.",
    )

    mock_llm_json = {
        "choices": [
            {
                "message": {
                    "content": '{"is_factual": true, "confidence_score": 0.95, "explanation": "Factually consistent with query."}'
                }
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_llm_json

    with patch("requests.post", return_value=mock_resp):
        critic_res: CriticResult = check_factual_accuracy(agent_resp, settings=settings)
        assert critic_res.is_factual is True
        assert critic_res.confidence_score == 0.95


def test_bias_checker_with_mocked_llm_call() -> None:
    """
    Test that the Bias Checker agent correctly invokes the LLM endpoint when an API key is present.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    settings.nvidia_api_key = "nvapi-test-bias-key"

    agent_resp: AgentResponse = AgentResponse(
        request_id="req-bias-live",
        query_sent="Evaluate hiring candidates",
        raw_response="Hire candidate based purely on merit.",
    )

    mock_llm_json = {
        "choices": [
            {
                "message": {
                    "content": '{"is_unbiased": true, "bias_category": null, "confidence_score": 0.98, "explanation": "Fair evaluation."}'
                }
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_llm_json

    with patch("requests.post", return_value=mock_resp):
        bias_res: BiasResult = check_bias_and_fairness(agent_resp, settings=settings)
        assert bias_res.is_unbiased is True
        assert bias_res.confidence_score == 0.98


def test_pipeline_controlled_retry_on_flagged_output() -> None:
    """
    Test that a flagged response initiates a controlled retry loop up to MAX_RETRIES.
    
    Parameters:
        None
        
    Returns:
        None
    """
    pipeline: ControlPlanePipeline = ControlPlanePipeline()
    pipeline.settings.max_retries = 2

    # Query that is valid on input but triggers hallucination on the simulated first pass
    query: str = "Search customer records for account holder <PII_EMAIL_1>"

    # Process query
    output: FinalOutput = pipeline.process_query(query)

    assert isinstance(output, FinalOutput)
    assert output.is_blocked is False
    assert "validate" in output.audit_trail
    assert "protect" in output.audit_trail


def test_critic_llm_call_failure_fallback() -> None:
    """
    Test that Critic falls back to heuristic evaluation if the LLM call raises an exception.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    settings.nvidia_api_key = "nvapi-faulty-key"

    agent_resp: AgentResponse = AgentResponse(
        request_id="req-crit-fail",
        query_sent="Check facts",
        raw_response="Standard factual reply.",
    )

    with patch("requests.post", side_effect=Exception("API connection timeout")):
        result: CriticResult = check_factual_accuracy(agent_resp, settings=settings)
        assert isinstance(result, CriticResult)
        assert result.is_factual is True


def test_bias_checker_llm_call_failure_fallback() -> None:
    """
    Test that Bias Checker falls back to heuristic evaluation if the LLM call raises an exception.
    
    Parameters:
        None
        
    Returns:
        None
    """
    settings: Settings = Settings()
    settings.nvidia_api_key = "nvapi-faulty-key"

    agent_resp: AgentResponse = AgentResponse(
        request_id="req-bias-fail",
        query_sent="Check bias",
        raw_response="Fair objective reply.",
    )

    with patch("requests.post", side_effect=Exception("API connection timeout")):
        result: BiasResult = check_bias_and_fairness(agent_resp, settings=settings)
        assert isinstance(result, BiasResult)
        assert result.is_unbiased is True


def test_pipeline_controlled_retry_exhaustion_escalates() -> None:
    """
    Test that if retries are exhausted without a clean verdict, the pipeline safely escalates without infinite loops.
    
    Parameters:
        None
        
    Returns:
        None
    """
    pipeline: ControlPlanePipeline = ControlPlanePipeline()
    pipeline.settings.max_retries = 2

    # Force critic to always fail to test retry cap exhaustion
    failing_critic = CriticResult(
        is_factual=False,
        confidence_score=0.2,
        explanation="Persistent factual discrepancy detected.",
        sources_checked=[],
    )

    with patch("controlplane.pipeline.check_factual_accuracy", return_value=failing_critic):
        output: FinalOutput = pipeline.process_query("Calculate loan schedule")

        assert isinstance(output, FinalOutput)
        assert output.is_blocked is False
        assert "Escalated: Response failed validation after retries" in output.final_text or "failed validation" in output.final_text.lower()
        assert output.audit_trail.get("decision") == "ESCALATED_VALIDATION_FAILED"

