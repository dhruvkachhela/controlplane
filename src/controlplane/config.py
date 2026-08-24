"""
# How this works:
# This module is responsible for loading and validating application settings.
# It reads secrets and configuration variables from a .env file or the OS environment.
# It ensures that API keys and endpoints for NVIDIA Llama models are loaded safely.
# If required keys are missing when strict validation is requested, it provides clear errors.
# Default values are used for optional operational settings such as log levels and thresholds.
"""

import os
from typing import Optional
from dotenv import load_dotenv


class Settings:
    """
    Application configuration and secret storage.
    
    This class holds API credentials, endpoint URLs, and runtime flags.
    Values are loaded from the environment or a local .env file.
    """

    def __init__(self, env_file_path: Optional[str] = None) -> None:
        """
        Initialize settings by loading environment variables from a .env file.
        
        This method loads values into os.environ and populates configuration fields.
        If an explicit env_file_path is provided, it attempts to load from that path.
        Otherwise, it looks for a .env file in the current working directory.
        
        Parameters:
            env_file_path (Optional[str]): Optional custom path to a .env configuration file.
            
        Returns:
            None
        """
        # Load the environment variables from the file into os.environ
        # Search explicit path, current working directory, and controlplane package root
        if env_file_path is not None:
            load_dotenv(dotenv_path=env_file_path, override=False)
        else:
            # Check current working directory .env
            load_dotenv(override=False)
            # Also check controlplane project root .env
            project_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
            if os.path.isfile(project_env):
                load_dotenv(dotenv_path=project_env, override=False)



        # NVIDIA NIM / Llama 3.1 8B configuration
        env_key: str = os.getenv("NVIDIA_API_KEY", "")
        if not env_key:
            try:
                import streamlit as st
                if hasattr(st, "secrets") and "NVIDIA_API_KEY" in st.secrets:
                    env_key = str(st.secrets["NVIDIA_API_KEY"])
            except Exception:
                pass

        self.nvidia_api_key: str = env_key
        self.nvidia_base_url: str = os.getenv(
            "NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"
        )
        self.nvidia_model: str = os.getenv(
            "NVIDIA_MODEL", "meta/llama-3.1-8b-instruct"
        )

        # Operational parameters
        self.log_level: str = os.getenv("LOG_LEVEL", "INFO")
        
        # Risk threshold for high risk blocking
        raw_risk_threshold: str = os.getenv("RISK_THRESHOLD", "0.7")
        try:
            self.risk_threshold: float = float(raw_risk_threshold)
        except ValueError:
            self.risk_threshold = 0.7

        # Retry cap for validator loops
        raw_max_retries: str = os.getenv("MAX_RETRIES", "3")
        try:
            self.max_retries: int = int(raw_max_retries)
        except ValueError:
            self.max_retries = 3

    def validate_api_keys(self) -> bool:
        """
        Check whether the necessary external API keys are present.
        
        This method checks if the NVIDIA API key is configured with a non-empty string.
        It is used before making live network calls to the enterprise model.
        
        Parameters:
            None
            
        Returns:
            bool: True if the required API keys are non-empty, False otherwise.
        """
        # Ensure the NVIDIA API key has been set and is not empty
        has_api_key: bool = bool(self.nvidia_api_key.strip())
        return has_api_key


def get_settings(env_file_path: Optional[str] = None) -> Settings:
    """
    Factory function to instantiate and retrieve application settings.
    
    This function creates a new Settings instance configured from the environment.
    It provides a simple and consistent way to access configuration values.
    
    Parameters:
        env_file_path (Optional[str]): Optional custom path to a .env configuration file.
        
    Returns:
        Settings: An initialized Settings object containing all active configurations.
    """
    settings_instance: Settings = Settings(env_file_path=env_file_path)
    return settings_instance
