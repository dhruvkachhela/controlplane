"""
# How this works:
# This module implements the Secret and PII Masking component of ControlPlane.ai.
# It uses deterministic regular expression matchers alongside Shannon entropy analysis
# to detect sensitive entities such as email addresses, phone numbers, credit card numbers,
# social security numbers, API credentials, and high-entropy secret tokens.
# Detected entities are replaced with deterministic placeholder tokens (e.g. <PII_EMAIL_1>),
# and a reverse mapping dictionary is recorded so values can be restored safely in the Respond stage.
"""

import math
import re
from typing import Dict, List, Tuple
from controlplane.models import MaskedRequest, UserRequest


def calculate_shannon_entropy(input_string: str) -> float:
    """
    Calculate the Shannon entropy of a given text string.
    
    This function computes the informational randomness of character distribution.
    Strings with high entropy (e.g. random alphanumeric API keys and secret tokens)
    exhibit significantly higher entropy than natural language words.
    
    Parameters:
        input_string (str): The text string to evaluate for randomness.
        
    Returns:
        float: The calculated Shannon entropy value (0.0 or higher).
    """
    # An empty string has zero entropy
    if not input_string:
        return 0.0

    total_characters: int = len(input_string)
    character_counts: Dict[str, int] = {}

    # Count occurrences of each character in the string
    for single_char in input_string:
        character_counts[single_char] = character_counts.get(single_char, 0) + 1

    # Calculate entropy summation: -sum(p(x) * log2(p(x)))
    entropy_total: float = 0.0
    for single_char, occurrence_count in character_counts.items():
        probability: float = occurrence_count / total_characters
        log_term: float = math.log2(probability)
        entropy_total = entropy_total - (probability * log_term)

    return entropy_total


def _collect_pattern_matches(raw_text: str) -> List[Tuple[int, int, str, str]]:
    """
    Scan raw text against regular expressions for sensitive entities and return sorted match intervals.
    
    This helper identifies start/end indices of sensitive tokens, ensuring non-overlapping
    substitutions during masking.
    
    Parameters:
        raw_text (str): The raw user query text to inspect.
        
    Returns:
        List[Tuple[int, int, str, str]]: List of tuples containing (start_pos, end_pos, entity_type, raw_value).
    """
    found_spans: List[Tuple[int, int, str, str]] = []

    # 1. AWS Access Key IDs (e.g. AKIA...)
    aws_pattern: str = r"\bAKIA[0-9A-Z]{16}\b"
    for match in re.finditer(aws_pattern, raw_text):
        found_spans.append((match.start(), match.end(), "SECRET_API_KEY", match.group(0)))

    # 2. NVIDIA / OpenAI / HuggingFace API key formats
    api_key_pattern: str = r"\b(?:nvapi-[a-zA-Z0-9_\-]{24,}|sk-[a-zA-Z0-9_\-]{24,}|hf_[a-zA-Z0-9]{24,})\b"
    for match in re.finditer(api_key_pattern, raw_text):
        found_spans.append((match.start(), match.end(), "SECRET_API_KEY", match.group(0)))

    # 3. JWT / Bearer tokens
    jwt_pattern: str = r"\b(?:Bearer\s+)?(eyJ[a-zA-Z0-9_\-]{8,}\.eyJ[a-zA-Z0-9_\-]{8,}\.[a-zA-Z0-9_\-]+)\b"
    for match in re.finditer(jwt_pattern, raw_text):
        token_value: str = match.group(0)
        found_spans.append((match.start(), match.end(), "SECRET_TOKEN", token_value))

    # 4. Credit Card Numbers (16 digits with hyphens or spaces)
    credit_card_pattern: str = r"\b(?:\d{4}[-\s]?){3}\d{4}\b"
    for match in re.finditer(credit_card_pattern, raw_text):
        found_spans.append((match.start(), match.end(), "PII_CREDIT_CARD", match.group(0)))

    # 5. Social Security Numbers (SSN: XXX-XX-XXXX)
    ssn_pattern: str = r"\b\d{3}-\d{2}-\d{4}\b"
    for match in re.finditer(ssn_pattern, raw_text):
        found_spans.append((match.start(), match.end(), "PII_SSN", match.group(0)))

    # 6. Email Addresses
    email_pattern: str = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    for match in re.finditer(email_pattern, raw_text):
        found_spans.append((match.start(), match.end(), "PII_EMAIL", match.group(0)))

    # 7. Phone Numbers (international and domestic formats)
    phone_pattern: str = r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
    for match in re.finditer(phone_pattern, raw_text):
        phone_candidate: str = match.group(0)
        # Avoid matching short numbers or dates
        digit_count: int = len(re.findall(r"\d", phone_candidate))
        if digit_count >= 7:
            found_spans.append((match.start(), match.end(), "PII_PHONE", phone_candidate))

    # 8. High-Entropy Standalone Tokens
    # Inspect words of length 20 or greater with high randomness
    word_pattern: str = r"\b[A-Za-z0-9_\-/+=]{20,}\b"
    for match in re.finditer(word_pattern, raw_text):
        word_token: str = match.group(0)
        entropy_val: float = calculate_shannon_entropy(word_token)
        # Threshold of 3.5 bits per character signifies random cryptographic keys
        if entropy_val >= 3.5:
            found_spans.append((match.start(), match.end(), "SECRET_HIGH_ENTROPY", word_token))

    return found_spans


def mask_sensitive_data(user_request: UserRequest) -> MaskedRequest:
    """
    Detect sensitive data in a UserRequest and produce a sanitized MaskedRequest with replacement tokens.
    
    This function scans the raw query for sensitive PII and secret patterns, replaces them
    with uniquely numbered token placeholders (e.g. <PII_EMAIL_1>), and stores the reverse
    lookup in a token map dictionary.
    
    Parameters:
        user_request (UserRequest): The raw user query payload to sanitize.
        
    Returns:
        MaskedRequest: Strongly-typed masked request containing sanitized text and token map.
    """
    raw_query_text: str = user_request.raw_query
    raw_spans: List[Tuple[int, int, str, str]] = _collect_pattern_matches(raw_query_text)

    # Sort spans primarily by starting position, then longest span first
    # This prevents duplicate or nested overlapping replacement errors
    sorted_spans: List[Tuple[int, int, str, str]] = sorted(
        raw_spans,
        key=lambda span_item: (span_item[0], -(span_item[1] - span_item[0]))
    )

    non_overlapping_spans: List[Tuple[int, int, str, str]] = []
    current_cursor: int = 0

    for start_idx, end_idx, entity_tag, entity_value in sorted_spans:
        # Check that this span starts after or at our current cursor position
        if start_idx >= current_cursor:
            non_overlapping_spans.append((start_idx, end_idx, entity_tag, entity_value))
            current_cursor = end_idx

    token_map: Dict[str, str] = {}
    detected_entity_types: List[str] = []
    entity_counters: Dict[str, int] = {}
    
    # Build the masked string by replacing matched spans with tokens
    masked_string_parts: List[str] = []
    last_processed_index: int = 0

    for start_pos, end_pos, entity_name, secret_plaintext in non_overlapping_spans:
        # Append the non-sensitive text preceding this match
        unmasked_segment: str = raw_query_text[last_processed_index:start_pos]
        masked_string_parts.append(unmasked_segment)

        # Track sequential counter for this entity category
        counter_val: int = entity_counters.get(entity_name, 0) + 1
        entity_counters[entity_name] = counter_val
        
        replacement_token: str = f"<{entity_name}_{counter_val}>"
        masked_string_parts.append(replacement_token)
        
        # Save mapping from placeholder token back to plaintext
        token_map[replacement_token] = secret_plaintext

        # Record human-readable category in detected entities
        base_category: str = entity_name.replace("PII_", "").replace("SECRET_", "")
        if base_category not in detected_entity_types:
            detected_entity_types.append(base_category)

        last_processed_index = end_pos

    # Append any remaining characters after the last replaced span
    trailing_segment: str = raw_query_text[last_processed_index:]
    masked_string_parts.append(trailing_segment)

    final_masked_query: str = "".join(masked_string_parts)

    result_request: MaskedRequest = MaskedRequest(
        request_id=user_request.request_id,
        original_query=raw_query_text,
        masked_query=final_masked_query,
        token_map=token_map,
        detected_entities=detected_entity_types,
    )
    return result_request
