"""
# How this works:
# This module implements the model-agnostic Agent Interface for ControlPlane.ai.
# It wraps calls to the primary enterprise model (NVIDIA Llama 3.1 8B via NVIDIA NIM API)
# using credentials exclusively loaded from the environment settings.
# It formats OpenAI-compatible chat completion requests, measures execution latency,
# and tracks token usage and inference cost estimates.
# If no API key is provided or if network calls encounter errors, it provides graceful simulation.
"""

import math
import time
from typing import Any, Dict, Optional
import requests

from controlplane.config import Settings
from controlplane.models import AgentResponse
from controlplane.utils.logger import get_logger

logger = get_logger(__name__)

# Pricing constant for NVIDIA Llama 3.1 8B in USD per 1,000,000 tokens
# Approximately $0.18 per 1M tokens ($0.00018 per 1k tokens)
LLAMA_3_1_8B_PRICE_PER_MILLION: float = 0.18


def estimate_tokens(text: str) -> int:
    """
    Estimate token count for a text string using standard character-to-token ratio.
    
    In general English text and code, one token represents approximately 4 characters.
    This helper provides a fast, deterministic estimation when tokenizers are not present.
    
    Parameters:
        text (str): The string content to estimate token count for.
        
    Returns:
        int: Estimated number of tokens (minimum 1 for non-empty text).
    """
    if not text:
        return 0
    
    # 4 characters per token heuristic
    estimated_count: int = math.ceil(len(text) / 4.0)
    return max(estimated_count, 1)


def calculate_inference_cost(prompt_tokens: int, completion_tokens: int, model_name: str = "meta/llama-3.1-8b-instruct") -> float:
    """
    Calculate estimated computational inference cost for a model call in USD.
    
    This function applies the pricing model of lightweight SLMs (e.g. Llama 3.1 8B)
    to support cost tracking and demonstrate compute savings over un-guarded frontier models.
    
    Parameters:
        prompt_tokens (int): Number of prompt/input tokens.
        completion_tokens (int): Number of generated completion tokens.
        model_name (str): The name identifier of the model.
        
    Returns:
        float: Estimated cost in USD, rounded to 6 decimal places.
    """
    total_tokens: int = prompt_tokens + completion_tokens
    cost_per_token: float = LLAMA_3_1_8B_PRICE_PER_MILLION / 1_000_000.0
    total_cost: float = total_tokens * cost_per_token
    return round(total_cost, 6)


class AgentInterface:
    """
    Model-agnostic wrapper for interacting with enterprise language models and NVIDIA NIM API.
    """

    def __init__(self, settings: Settings) -> None:
        """
        Initialize the AgentInterface with application settings.
        
        Parameters:
            settings (Settings): The application settings object containing API endpoints and keys.
            
        Returns:
            None
        """
        self.settings: Settings = settings

    def _generate_simulated_response(self, formatted_query: str) -> str:
        """
        Generate a domain-grounded simulated response when live API calls are unavailable.
        
        Parameters:
            formatted_query (str): The rewritten query sent to the agent.
            
        Returns:
            str: Simulated model answer text.
        """
        normalized_query: str = formatted_query.lower()
        
        if "customer" in normalized_query or "search_customer_records" in normalized_query:
            return "Customer records retrieved successfully. Account status is ACTIVE with verified credentials."
        elif "loan" in normalized_query or "amortization" in normalized_query:
            return "Amortization calculation complete. Monthly payment is calculated at $955.28 across the 60-month term."
        elif "invoice" in normalized_query:
            return "Invoice document generated successfully and queued for secure download."
        elif "status" in normalized_query or "uptime" in normalized_query:
            return "System operational status: All enterprise microservices and payment gateways are currently healthy (99.98% uptime)."
        else:
            return f"Processed query request: {formatted_query}. Task completed successfully."

    def invoke_agent(self, request_id: str, formatted_query: str) -> AgentResponse:
        """
        Send a query to the enterprise model and return the generated response with metrics.
        
        If a valid NVIDIA API key is configured, it executes a live HTTP POST call to the
        OpenAI-compatible /chat/completions endpoint. If no key is set or if an error occurs,
        it falls back to simulated execution.
        
        Parameters:
            request_id (str): Unique request identifier.
            formatted_query (str): The rewritten query sent to the model.
            
        Returns:
            AgentResponse: The model output along with latency, token usage, and cost estimates.
        """
        start_time: float = time.time()
        
        # Check if live external API credentials exist
        if self.settings.validate_api_keys():
            try:
                # Construct endpoint URL
                endpoint_url: str = f"{self.settings.nvidia_base_url.rstrip('/')}/chat/completions"
                request_headers: Dict[str, str] = {
                    "Authorization": f"Bearer {self.settings.nvidia_api_key}",
                    "Content-Type": "application/json",
                }
                
                request_payload: Dict[str, Any] = {
                    "model": self.settings.nvidia_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful, secure enterprise agent. Provide direct, accurate responses without repeating sensitive credentials.",
                        },
                        {
                            "role": "user",
                            "content": formatted_query,
                        },
                    ],
                    "temperature": 0.2,
                    "max_tokens": 1024,
                }
                
                # Make live HTTP call with a 15-second timeout
                http_response: requests.Response = requests.post(
                    endpoint_url,
                    headers=request_headers,
                    json=request_payload,
                    timeout=15.0,
                )
                
                if http_response.status_code == 200:
                    response_json: Dict[str, Any] = http_response.json()
                    choices: list = response_json.get("choices", [])
                    
                    if choices:
                        message_content: str = choices[0].get("message", {}).get("content", "")
                    else:
                        message_content = "No content returned by model."
                        
                    usage_data: Dict[str, Any] = response_json.get("usage", {})
                    prompt_toks: int = usage_data.get("prompt_tokens", estimate_tokens(formatted_query))
                    completion_toks: int = usage_data.get("completion_tokens", estimate_tokens(message_content))
                    total_toks: int = usage_data.get("total_tokens", prompt_toks + completion_toks)
                    
                    cost_val: float = calculate_inference_cost(prompt_toks, completion_toks, self.settings.nvidia_model)
                    elapsed: float = time.time() - start_time
                    
                    return AgentResponse(
                        request_id=request_id,
                        query_sent=formatted_query,
                        raw_response=message_content,
                        model_name=self.settings.nvidia_model,
                        execution_time_seconds=round(elapsed, 3),
                        prompt_tokens=prompt_toks,
                        completion_tokens=completion_toks,
                        total_tokens=total_toks,
                        cost_estimate=cost_val,
                        is_simulated=False,
                    )
                else:
                    logger.warning(
                        f"NVIDIA NIM API returned status {http_response.status_code}: {http_response.text}. Falling back to simulation."
                    )
            except Exception as exc:
                logger.warning(f"Error connecting to NVIDIA NIM API ({exc}). Falling back to simulation.")

        # Simulation path (used for testing or when API key is not configured)
        simulated_text: str = self._generate_simulated_response(formatted_query)
        elapsed_time: float = time.time() - start_time
        
        prompt_token_count: int = estimate_tokens(formatted_query)
        completion_token_count: int = estimate_tokens(simulated_text)
        total_token_count: int = prompt_token_count + completion_token_count
        simulated_cost: float = calculate_inference_cost(
            prompt_token_count,
            completion_token_count,
            self.settings.nvidia_model,
        )

        response_model: AgentResponse = AgentResponse(
            request_id=request_id,
            query_sent=formatted_query,
            raw_response=simulated_text,
            model_name=self.settings.nvidia_model,
            execution_time_seconds=round(elapsed_time, 3),
            prompt_tokens=prompt_token_count,
            completion_tokens=completion_token_count,
            total_tokens=total_token_count,
            cost_estimate=simulated_cost,
            is_simulated=True,
        )
        return response_model
