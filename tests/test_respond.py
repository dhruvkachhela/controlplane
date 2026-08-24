"""
# How this works:
# This test module verifies the Respond stage and Decryption (detokenization) logic of ControlPlane.ai.
# It tests restoring original sensitive PII and secrets into agent responses using stored token maps.
# It checks edge cases such as empty maps, multiple tokens, duplicate token occurrences,
# and partial token string preservation.
"""

import pytest

from controlplane.models import (
    AgentResponse,
    FinalOutput,
    MaskedRequest,
    RiskAssessment,
    RiskTier,
    UserRequest,
)
from controlplane.respond.decrypt import (
    decrypt_agent_response,
    restore_original_data,
)


def test_restore_single_and_multiple_tokens() -> None:
    """
    Test that single and multiple token placeholders are cleanly restored to their plaintext values.
    
    Parameters:
        None
        
    Returns:
        None
    """
    token_map: dict[str, str] = {
        "<PII_EMAIL_1>": "alice.johnson@enterprise.com",
        "<PII_PHONE_1>": "+1-555-987-6543",
        "<SECRET_API_KEY_1>": "AKIAIOSFODNN7EXAMPLE",
    }
    
    tokenized_text: str = (
        "Statement delivered to <PII_EMAIL_1>. For support, call <PII_PHONE_1> "
        "and authenticate with key <SECRET_API_KEY_1>."
    )

    restored_text: str = restore_original_data(tokenized_text, token_map)

    assert "alice.johnson@enterprise.com" in restored_text
    assert "+1-555-987-6543" in restored_text
    assert "AKIAIOSFODNN7EXAMPLE" in restored_text
    assert "<PII_" not in restored_text
    assert "<SECRET_" not in restored_text


def test_restore_duplicate_occurrences_of_same_token() -> None:
    """
    Test that multiple occurrences of the same token in a response are all replaced.
    
    Parameters:
        None
        
    Returns:
        None
    """
    token_map: dict[str, str] = {
        "<PII_EMAIL_1>": "contact@business.org",
    }
    
    tokenized_text: str = (
        "Primary email: <PII_EMAIL_1>. A confirmation email was sent to <PII_EMAIL_1>."
    )

    restored_text: str = restore_original_data(tokenized_text, token_map)

    expected_text: str = (
        "Primary email: contact@business.org. A confirmation email was sent to contact@business.org."
    )
    assert restored_text == expected_text


def test_restore_empty_token_map_leaves_text_intact() -> None:
    """
    Test that an empty token map leaves the text completely unchanged.
    
    Parameters:
        None
        
    Returns:
        None
    """
    clean_text: str = "Quarterly revenue grew by 14.2% across European markets."
    empty_map: dict[str, str] = {}

    restored: str = restore_original_data(clean_text, empty_map)
    assert restored == clean_text


def test_decrypt_agent_response_helper() -> None:
    """
    Test the high-level decrypt_agent_response function returning the final decrypted output text.
    
    Parameters:
        None
        
    Returns:
        None
    """
    agent_resp: AgentResponse = AgentResponse(
        request_id="req-resp-01",
        query_sent="Lookup user account <PII_EMAIL_1>",
        raw_response="Account for user <PII_EMAIL_1> has active tier status.",
    )
    
    token_map: dict[str, str] = {
        "<PII_EMAIL_1>": "sarah.connor@cyber.org",
    }

    final_text: str = decrypt_agent_response(agent_resp, token_map)

    assert "Account for user sarah.connor@cyber.org has active tier status." == final_text
    assert "<PII_EMAIL_1>" not in final_text
