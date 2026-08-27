"""
# How this works:
# This test module validates the UI data helpers, preset configurations,
# and formatting functions used in the Streamlit application (streamlit_app.py).
# It verifies that demo presets are well-formed and that UI helper formatting handles
# normal, blocked, and escalated pipeline outputs correctly.
"""

import pytest
from controlplane.models import (
    FinalOutput,
    RiskAssessment,
    RiskTier,
)
from controlplane.pipeline import ControlPlanePipeline
from streamlit_app import (
    DEMO_PRESETS,
    format_audit_trail_summary,
    get_status_badge,
)


def test_demo_presets_structure() -> None:
    """
    Test that all predefined demo presets contain valid names, descriptions, and non-empty queries.
    
    Parameters:
        None
        
    Returns:
        None
    """
    assert len(DEMO_PRESETS) >= 4
    for preset_key, preset_data in DEMO_PRESETS.items():
        assert "short_title" in preset_data
        assert "name" in preset_data
        assert "objective" in preset_data
        assert "threat_mitigated" in preset_data
        assert "expected_path" in preset_data
        assert "query" in preset_data
        assert "expected_outcome" in preset_data
        assert len(preset_data["query"]) > 0



def test_get_status_badge_helper() -> None:
    """
    Test that status badges map correctly to visual labels for blocked, escalated, and safe outputs.
    
    Parameters:
        None
        
    Returns:
        None
    """
    # 1. Blocked output
    blocked_output = FinalOutput(
        request_id="req-badge-1",
        final_text="Blocked by risk gate",
        is_blocked=True,
        block_reason="Prompt injection",
        original_query="Ignore instructions",
        masked_query="Ignore instructions",
        risk_assessment=RiskAssessment(
            request_id="req-badge-1",
            risk_tier=RiskTier.HIGH,
            risk_score=0.95,
            is_blocked=True,
            reason="High risk",
        ),
        audit_trail={"decision": "BLOCKED_HIGH_RISK"},
    )
    badge_type, badge_text = get_status_badge(blocked_output)
    assert badge_type == "error"
    assert "BLOCKED" in badge_text

    # 2. Escalated output
    escalated_output = FinalOutput(
        request_id="req-badge-2",
        final_text="Escalated for clarification",
        is_blocked=False,
        original_query="Update it",
        masked_query="Update it",
        risk_assessment=RiskAssessment(
            request_id="req-badge-2",
            risk_tier=RiskTier.LOW,
            risk_score=0.1,
            is_blocked=False,
        ),
        audit_trail={"decision": "ESCALATED_NEED_CONTEXT"},
    )
    badge_type, badge_text = get_status_badge(escalated_output)
    assert badge_type == "warning"
    assert "ESCALATED" in badge_text

    # 3. Safe passed output
    safe_output = FinalOutput(
        request_id="req-badge-3",
        final_text="Account statement for user",
        is_blocked=False,
        original_query="Find account",
        masked_query="Find account",
        risk_assessment=RiskAssessment(
            request_id="req-badge-3",
            risk_tier=RiskTier.LOW,
            risk_score=0.1,
            is_blocked=False,
        ),
        audit_trail={"respond": "Data decrypted and finalized"},
    )
    badge_type, badge_text = get_status_badge(safe_output)
    assert badge_type == "success"
    assert "SAFE" in badge_text


def test_format_audit_trail_summary_helper() -> None:
    """
    Test formatting of pipeline audit trails into readable multi-line summaries.
    
    Parameters:
        None
        
    Returns:
        None
    """
    trail = {
        "protect": "Masked 2 items; Risk: LOW",
        "prepare": "Context sufficient; Tools: ['search_customer_records']",
        "agent": "Model meta/llama-3.1-8b-instruct responded in 0.25s",
        "validate": "Passed (Retries: 0); Factual: True; Unbiased: True",
        "respond": "Data decrypted and finalized",
    }
    summary_lines = format_audit_trail_summary(trail)
    assert len(summary_lines) == 5
    assert any("Protect" in line for line in summary_lines)
    assert any("Respond" in line for line in summary_lines)
