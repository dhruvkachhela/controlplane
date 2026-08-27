# ControlPlane.ai

> **Zero-Trust Guardrail Layer for Enterprise AI Agents**  
> Model-Agnostic Governance, Privacy Preservation, and Cost Optimization

[![Tests](https://img.shields.io/badge/pytest-58%20passed-brightgreen.svg)](tests/)
[![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen.svg)](tests/)
[![Python](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-blue.svg)](pyproject.toml)
[![Inference Engine](https://img.shields.io/badge/NVIDIA%20NIM-Llama%203.1%208B-green.svg)](https://www.nvidia.com/en-us/ai-data-science/products/nim/)

---

## 1. Overview & Core Mission

**ControlPlane.ai** is an enterprise-grade runtime guardrail system that acts as an inline governance and optimization layer between end-user queries and Large/Small Language Models.

### The 3 Enterprise AI Bottlenecks Solved:
1. **Privacy & Secret Leakage**: Prevents sensitive customer PII and API credentials from reaching third-party foundation models.
2. **Adversarial Exploitation**: Stops prompt injection, credential theft, and unauthorized transactions before LLM invocation.
3. **Runaway Compute Costs**: Reduces token expenditure by **~38% blended savings** by leveraging governed Small Language Models (`poolside/laguna-xs-2.1`) instead of expensive frontier models (GPT-4o at $2.50/$10.00 per 1M tokens).

---

## 2. Architecture & The 5-Stage Pipeline

```text
[ RAW USER QUERY ]
        |
        v
+-----------------------------------------------------------------------------------+
| 1. PROTECT STAGE                                                                  |
|    - PII & Secret Tokenization (Email, Phone, AWS Keys, Credit Cards, SSN)        |
|    - Shannon Entropy Scanner (Obfuscated API Key & Secret Detection)              |
|    - Deterministic Risk Classifier (Hard Block on Injection / Threats >= 0.70)    |
+-----------------------------------------------------------------------------------+
        |
        v
+-----------------------------------------------------------------------------------+
| 2. PREPARE STAGE                                                                  |
|    - Context Sufficiency Check (Escalate vague queries before LLM call)           |
|    - Query Compression & Fluff Stripper (Save 15-35% prompt tokens)               |
|    - Enterprise Tool Discovery & Schema Injection                                 |
+-----------------------------------------------------------------------------------+
        |
        v
+-----------------------------------------------------------------------------------+
| 3. AGENT STAGE                                                                    |
|    - NVIDIA NIM Microservice Interface (meta/llama-3.1-8b-instruct)               |
|    - High-Speed Sub-Second Inference with Automated Offline Simulation Fallback   |
+-----------------------------------------------------------------------------------+
        |
        v
+-----------------------------------------------------------------------------------+
| 4. VALIDATE STAGE                                                                 |
|    - Factual Critic Agent (LLM-powered JSON grounding & hallucination detector)   |
|    - Bias & Policy Checker Agent (Demographic stereotype & compliance scanner)    |
|    - Governed Feedback Retry Loop (Bounded to max_retries = 3)                    |
+-----------------------------------------------------------------------------------+
        |
        v
+-----------------------------------------------------------------------------------+
| 5. RESPOND STAGE                                                                  |
|    - In-Memory Cryptographic Token Vault Restoration                              |
|    - Immutable Audit Logging & Real-Time USD Economic Telemetry                   |
+-----------------------------------------------------------------------------------+
        |
        v
[ SAFE VALIDATED DELIVERED OUTPUT ]
```

---

## 3. Quick Start & Installation

### Prerequisites
- Python 3.10 or higher
- NVIDIA NIM API Key (optional for live mode; local simulation fallback is built-in)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/dhruvkachhela/controlplane.git
cd controlplane

# 2. Create and activate a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# 3. Install package and dependencies
pip install -e ".[dev]"

# 4. Configure environment keys
cp .env.example .env
# Open .env and insert your NVIDIA_API_KEY
```

---

## 4. Running the Application

### Launch the Streamlit Executive Dashboard
```bash
streamlit run streamlit_app.py
```
Open **`http://localhost:8501`** in your browser.

### Using the Interface
1. **Custom Query Input (Primary)**: Type any enterprise prompt into the customizable text area.
2. **Reference Evaluation Presets (Secondary)**: Pick from 8 predefined demonstration scenarios:
   - *Scenario 1*: Sensitive PII & API Key Masking
   - *Scenario 2*: High-Risk Prompt Injection & Credential Theft (Hard Block)
   - *Scenario 3*: Ambiguous Request with Missing Context (Escalation)
   - *Scenario 4*: Unauthorized Financial Movement
   - *Scenario 5*: Tool Matching & Fluff Compression
   - *Scenario 6*: Legitimate Invoice Status Request (`INV-45821`)
   - *Scenario 7*: Customer Support Order History Lookup (`CUST-8834`)
   - *Scenario 8*: Internal Business Report Summarization
3. **Execute**: Click **"Execute ControlPlane Pipeline"** to view the single-page 5-stage flow, delivered output card, and real-time economic telemetry.

---

## 5. Running Automated Tests

ControlPlane.ai includes a comprehensive pytest suite covering all components, edge cases, and failure modes:

```bash
# Run full test suite with coverage report
pytest tests -v --cov=controlplane
```

### Test Suite Summary
- **58 Passed Tests in 1.20s**
- **98% Statement Coverage**
- Tests cover: Risk classification, Shannon entropy, PII masking, query rewriting, context evaluation, Critic LLM validation, Bias checking, governed retry exhaustion, detokenization, and UI helper formatting.

---

## 6. Programmatic Python API Usage

```python
from controlplane.config import get_settings
from controlplane.pipeline import ControlPlanePipeline

# 1. Initialize pipeline with configuration
settings = get_settings()
pipeline = ControlPlanePipeline(settings)

# 2. Process an enterprise user query
query = "Hello! Search customer records for alice.walker@enterprise.com with auth key AKIAIOSFODNN7EXAMPLE and tell me account balance."
result = pipeline.process_query(query)

# 3. Inspect results
print("Status:", "BLOCKED" if result.is_blocked else "PASSED")
print("Delivered Output:", result.final_text)
print("Processing Latency:", f"{result.latency_seconds:.3f} s")
print("Total Tokens:", result.total_tokens)
print("Actual Compute Cost:", f"${result.actual_cost_usd:.6f} USD")
print("Net Compute Savings:", f"{result.cost_savings_pct:.1f}%")
```

---

## 7. Project Structure

```text
controlplane/
├── app/                             # Next.js App Router (Landing page & API)
│   ├── api/pipeline/route.ts        # Pure live NVIDIA NIM Laguna 2.1 XS execution
│   ├── globals.css                  # Hardware-accelerated styles & design tokens
│   ├── layout.tsx                   # Root layout with Geist typography
│   └── page.tsx                     # Landing page layout
├── components/                      # Modular React UI Components
│   ├── layout/                      # Navbar, Footer, LenisProvider, PaperTexture
│   ├── hero/                        # Hero, Spiral
│   ├── sections/                    # Transitions, InteractivePlayground, RepoSection...
│   └── ui/                          # AnimatedText, MatrixTextBackground...
├── docs/                            # Executive Documentation & Diagrams
│   ├── ControlPlane_AI_Documentation.pdf # Technical documentation PDF
│   ├── TECHNICAL_DOCUMENTATION.md   # Architectural whitepaper
│   ├── architecture_diagram.png     # Vector architecture diagram
│   └── generate_documentation_pdf.py# PDF generator script
├── src/controlplane/                # Core Python Zero-Trust SDK & Pipeline
├── tests/                           # 58 pytest unit, integration, and E2E tests
├── streamlit_app.py                 # Executive Streamlit user dashboard
└── pyproject.toml                   # Build system & package metadata
```

---

## 8. License & Acknowledgements

Developed for the **Accenture AI Hackathon**. Built with Python, Pydantic, NVIDIA NIM Microservices, and Streamlit.
