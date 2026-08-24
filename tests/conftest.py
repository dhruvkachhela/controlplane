"""
# How this works:
# This conftest module defines pytest fixtures for the test suite.
# It sets the test environment to default simulation mode (NVIDIA_API_KEY="")
# so unit tests run deterministically and fast without relying on live external networks.
"""

import os
import pytest


@pytest.fixture(autouse=True)
def default_test_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Ensure unit tests run with clean default configuration in simulation mode.
    
    Parameters:
        monkeypatch (pytest.MonkeyPatch): Pytest fixture for safely modifying environment variables.
        
    Returns:
        None
    """
    monkeypatch.setenv("NVIDIA_API_KEY", "")
    monkeypatch.setenv("RISK_THRESHOLD", "0.7")
    monkeypatch.setenv("MAX_RETRIES", "3")
    monkeypatch.setenv("LOG_LEVEL", "INFO")
