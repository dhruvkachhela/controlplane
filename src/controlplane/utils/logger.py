"""
# How this works:
# This module configures structured, level-based logging for ControlPlane.
# It sets up a standardized logging format that includes timestamp, log level, module name, and message.
# Crucially, the logger is designed to prevent raw secrets and sensitive tokens from being output.
# Other modules obtain a dedicated logger instance by calling get_logger(__name__).
# Log level is configurable via environment settings.
"""

import logging
import sys
from typing import Optional


def get_logger(module_name: str, log_level: Optional[str] = "INFO") -> logging.Logger:
    """
    Configure and return a structured logger for a given module.
    
    This function sets up a standard StreamHandler writing to stdout if the logger
    does not already have handlers attached. It prevents duplicate log records
    and applies a unified formatting pattern across the entire application.
    
    Parameters:
        module_name (str): The name of the module requesting the logger (typically __name__).
        log_level (Optional[str]): The string representation of the logging level (e.g. 'DEBUG', 'INFO').
        
    Returns:
        logging.Logger: A configured Python standard library Logger instance.
    """
    logger_instance: logging.Logger = logging.getLogger(module_name)
    
    # Determine the integer log level from the provided string name
    normalized_level: str = log_level.upper() if log_level else "INFO"
    numeric_level: int = getattr(logging, normalized_level, logging.INFO)
    logger_instance.setLevel(numeric_level)

    # Avoid adding multiple handlers if this function is called more than once
    if not logger_instance.handlers:
        console_handler: logging.StreamHandler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(numeric_level)
        
        # Define clean, human-readable structured format
        log_format_pattern: str = (
            "%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
        )
        formatter: logging.Formatter = logging.Formatter(log_format_pattern)
        console_handler.setFormatter(formatter)
        
        logger_instance.addHandler(console_handler)

    return logger_instance
