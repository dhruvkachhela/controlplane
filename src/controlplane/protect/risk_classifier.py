"""
# How this works:
# This module implements the Risk Classifier component of ControlPlane.ai.
# It acts as the fastest, authoritative zero-trust guardrail at the pipeline entrance.
# It uses deterministic rule-based keyword matching, heuristic threat analysis, and risk scoring
# to classify queries into LOW, MEDIUM, or HIGH risk tiers.
# If a query is identified as HIGH risk (e.g. prompt injection, destructive shell execution,
# unauthorized financial transactions, or credential exfiltration), it is immediately blocked
# with an explanatory reason, stopping the request before any expensive agent call.
"""

import re
from typing import List, Tuple
from controlplane.models import RiskAssessment, RiskTier, UserRequest


# Define heuristic rule sets mapped to risk categories and severity weights
HIGH_RISK_PATTERNS: List[Tuple[str, str, float]] = [
    # 1. Prompt Injections and Jailbreak patterns
    (
        r"(?i)(?:ignore\s+all\s+(?:previous|prior)\s+instructions|you\s+are\s+now\s+in\s+bypass\s+mode|dan\s+mode|disregard\s+(?:all\s+)?safety\s+guidelines|system\s+prompt\s+override|print\s+out\s+(?:all\s+)?system\s+prompts)",
        "prompt_injection",
        0.95,
    ),
    # 2. Destructive OS and Shell Commands
    (
        r"(?i)(?:rm\s+-rf\s+[/~]|format\s+[a-z]:|/etc/shadow|/etc/passwd|drop\s+database|truncate\s+table|chmod\s+777|os\.system\s*\(|eval\s*\(|subprocess\.Popen)",
        "exploit_command",
        0.98,
    ),
    # 3. High-Stakes Financial Fraud and Unauthorized Transfers
    (
        r"(?i)(?:authorize\s+(?:an\s+)?immediate\s+wire\s+transfer|wire\s+transfer\s+to\s+unverified\s+offshore|drain\s+(?:all\s+)?funds|bypass\s+kyc|launder\s+funds)",
        "financial_fraud",
        0.90,
    ),
    # 4. Credential Theft and Data Exfiltration
    (
        r"(?i)(?:dump\s+(?:all\s+)?api\s+keys|steal\s+(?:user\s+)?credentials|extract\s+password\s+hashes|exfiltrate\s+(?:customer\s+)?database)",
        "data_exfiltration",
        0.92,
    ),
    # 5. Dangerous Physical Harm and Weapons
    (
        r"(?i)(?:synthesize\s+(?:chemical|biological)\s+weapon|create\s+(?:a\s+)?pipe\s+bomb|manufacture\s+explosives)",
        "physical_harm",
        0.99,
    ),
]

MEDIUM_RISK_PATTERNS: List[Tuple[str, str, float]] = [
    # Database alterations and permission updates
    (
        r"(?i)\b(?:alter\s+user\s+permissions|modify\s+access\s+control|database\s+migration\s+guidelines|update\s+internal\s+user\s+access)\b",
        "administrative_access",
        0.55,
    ),
    # Sensitive customer record lookups
    (
        r"(?i)\b(?:lookup\s+all\s+ssns|bulk\s+export\s+user\s+profiles|list\s+internal\s+api\s+routes)\b",
        "sensitive_lookup",
        0.50,
    ),
]


def evaluate_risk_rules(query_text: str) -> Tuple[float, List[str], List[str]]:
    """
    Evaluate a query against deterministic risk rules and return severity metrics.
    
    This function checks the query against high-severity and medium-severity heuristic
    patterns to calculate a composite risk score and extract triggered threat categories.
    
    Parameters:
        query_text (str): The raw user input query string to analyze.
        
    Returns:
        Tuple[float, List[str], List[str]]: (risk_score, categories_detected, triggered_reasons).
    """
    detected_categories: List[str] = []
    triggered_reasons: List[str] = []
    highest_severity: float = 0.0

    # 1. Scan for High-Risk threats
    for pattern_regex, category_name, severity_weight in HIGH_RISK_PATTERNS:
        match = re.search(pattern_regex, query_text)
        if match:
            if category_name not in detected_categories:
                detected_categories.append(category_name)
            triggered_reasons.append(
                f"Triggered high-risk rule '{category_name}' on matched phrase: '{match.group(0)}'"
            )
            if severity_weight > highest_severity:
                highest_severity = severity_weight

    # 2. Scan for Medium-Risk threats if no high-risk pattern dominated
    for pattern_regex, category_name, severity_weight in MEDIUM_RISK_PATTERNS:
        match = re.search(pattern_regex, query_text)
        if match:
            if category_name not in detected_categories:
                detected_categories.append(category_name)
            triggered_reasons.append(
                f"Triggered policy check '{category_name}' on phrase: '{match.group(0)}'"
            )
            if severity_weight > highest_severity:
                highest_severity = severity_weight

    # Default baseline score for benign query
    if highest_severity == 0.0:
        base_score: float = 0.05
        return (base_score, detected_categories, triggered_reasons)

    return (highest_severity, detected_categories, triggered_reasons)


def classify_risk(user_request: UserRequest, risk_threshold: float = 0.7) -> RiskAssessment:
    """
    Perform authoritative risk tier classification and determine if the query must be blocked.
    
    This function analyzes the incoming user query. If the computed risk score meets or exceeds
    the risk_threshold (default 0.7), the query is assigned RiskTier.HIGH and hard-blocked
    with an explanatory reason. Otherwise, it is assigned RiskTier.MEDIUM or RiskTier.LOW.
    
    Parameters:
        user_request (UserRequest): The incoming user request to classify.
        risk_threshold (float): Numerical threshold above which queries are classified as HIGH risk.
        
    Returns:
        RiskAssessment: The evaluation payload with tier, numerical score, block flag, and reason.
    """
    raw_query: str = user_request.raw_query
    risk_score, categories, reasons = evaluate_risk_rules(raw_query)

    # Determine risk tier based on numerical thresholds
    if risk_score >= risk_threshold:
        risk_tier: RiskTier = RiskTier.HIGH
        is_blocked: bool = True
        explanation_message: str = (
            f"Blocked by ControlPlane Risk Gate: High risk detected "
            f"({', '.join(categories)}). {'; '.join(reasons)}"
        )
    elif risk_score >= 0.40:
        risk_tier = RiskTier.MEDIUM
        is_blocked = False
        explanation_message = (
            f"Elevated caution (Medium risk): {', '.join(categories)}."
        )
    else:
        risk_tier = RiskTier.LOW
        is_blocked = False
        explanation_message = "Standard baseline query passed risk evaluation."

    risk_result: RiskAssessment = RiskAssessment(
        request_id=user_request.request_id,
        risk_tier=risk_tier,
        risk_score=round(risk_score, 2),
        categories_detected=categories,
        is_blocked=is_blocked,
        reason=explanation_message,
    )
    return risk_result
