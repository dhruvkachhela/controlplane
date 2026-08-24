"""
# How this works:
# This is the Streamlit UI entry point for ControlPlane.ai.
# In Phase 6, it will provide the live dashboard showcasing the full
# BEFORE -> CONTROL -> AFTER pipeline stages, risk gauges, masked tokens, and cost savings.
"""

import streamlit as st
from controlplane.pipeline import ControlPlanePipeline


def main() -> None:
    """
    Main Streamlit user interface render function.
    
    Parameters:
        None
        
    Returns:
        None
    """
    st.set_page_config(
        page_title="ControlPlane.ai - Guardrail Pipeline",
        page_icon="🛡️",
        layout="wide",
    )
    st.title("🛡️ ControlPlane.ai")
    st.caption("Model-agnostic zero-trust guardrail layer for enterprise AI agents")
    st.info("System initialized. Phase 0 bootstrap complete.")


if __name__ == "__main__":
    main()
