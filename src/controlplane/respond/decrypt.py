"""
# How this works:
# This module implements the Decrypt (detokenization) and Respond stage component.
# In the ControlPlane pipeline, sensitive PII and secrets are masked upon entry into placeholder tokens
# so that intermediate LLM agents and checkers never process raw credentials.
# After the response passes validation (Critic + Bias Checker) or completes governed retries,
# this module reverses the token map, substituting the original sensitive plaintext values
# back into the final response text so the user receives their complete answer.
"""

from typing import Dict
from controlplane.models import AgentResponse
from controlplane.utils.logger import get_logger

logger = get_logger(__name__)


def restore_original_data(tokenized_text: str, token_map: Dict[str, str]) -> str:
    """
    Reverse tokenization placeholders in the response text using the stored token map.
    
    This function iterates through all registered tokens, ordered by descending length
    to prevent prefix collisions, and restores the original plaintext values.
    
    Parameters:
        tokenized_text (str): The response text containing token placeholders (e.g. <PII_EMAIL_1>).
        token_map (Dict[str, str]): Dictionary mapping token placeholders back to original plaintext.
        
    Returns:
        str: The restored plaintext string intended for delivery to the end user.
    """
    if not tokenized_text or not token_map:
        return tokenized_text

    restored_text: str = tokenized_text

    # Sort token keys by length descending to ensure longer tokens are substituted first
    sorted_token_keys = sorted(token_map.keys(), key=lambda k: len(k), reverse=True)

    for token_key in sorted_token_keys:
        original_plaintext: str = token_map[token_key]
        if token_key in restored_text:
            restored_text = restored_text.replace(token_key, original_plaintext)

    return restored_text


def decrypt_agent_response(agent_response: AgentResponse, token_map: Dict[str, str]) -> str:
    """
    Extract the raw agent output and perform de-tokenization using the provided token map.
    
    This helper function is invoked at the final Respond stage after successful validation.
    It takes an AgentResponse object and produces the safe, complete text for the end user.
    
    Parameters:
        agent_response (AgentResponse): The validated output object from the enterprise agent.
        token_map (Dict[str, str]): The mapping of tokens to original sensitive values.
        
    Returns:
        str: The decrypted and finalized response string.
    """
    raw_content: str = agent_response.raw_response
    decrypted_content: str = restore_original_data(raw_content, token_map)
    return decrypted_content
