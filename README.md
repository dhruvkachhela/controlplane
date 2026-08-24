# ControlPlane.ai

> **Model-Agnostic Zero-Trust Guardrail Layer Sitting Between End Users and Enterprise Agents**  
> *Accenture Innovation Challenge 2026 Prototype*

---

## 🌟 Executive Overview & Problem Statement

Enterprises deploying LLM agents face severe trilemma challenges across **Security & Privacy**, **Factual Reliability & Bias**, and **Runaway Inference Costs**.

**ControlPlane.ai** is a model-agnostic, zero-trust middleware framework that wraps enterprise agent calls in a four-stage **Observe ➔ Evaluate ➔ Act** guardrail loop:
1. **Zero-Trust Input Sanitization**: Replaces PII (emails, phone numbers, SSNs, credit cards) and high-entropy secrets (API keys, JWTs, AWS credentials) with deterministic placeholder tokens (`<PII_...>`, `<SECRET_...>`) before user text reaches any model.
2. **Deterministic Risk Gating**: Classifies incoming queries via severity rules and Shannon entropy. Prompts exhibiting high-risk indicators (jailbreaks, prompt injections, privilege escalations, wire fraud) are **hard-blocked** instantaneously without incurring inference costs.
3. **Context Check & Tool-Aware Optimization**: Verifies whether incoming requests contain sufficient context. Ambiguous requests are escalated for clarification; sufficient requests are compressed and enriched with discovered enterprise tools (`[TOOLS: ...]`).
4. **LLM-Powered Validation & Governed Retry Loop**: Post-generation responses are independently audited by a **Critic agent** (factual correctness and hallucination detection) and a **Bias Checker agent** (fairness, stereotyping, and policy compliance). Flagged responses enter a controlled feedback retry loop governed by `MAX_RETRIES` before safe de-tokenization and delivery.

---

## 💰 SLM Net Economics & Cost Savings

By routing routine queries through optimized Small Language Models (NVIDIA Llama 3.1 8B) combined with query compression and early risk gate short-circuiting:
- **Net Compute Cost Reduction**: **~52.9%** savings compared to unconstrained frontier model routing.
- **Inference Price Point**: ~$0.18 per 1M tokens on NVIDIA NIM.
- **Zero Compute Waste**: High-risk exploits and vague queries are rejected at Stages 1 and 2 before downstream model invocation.

---

## 🔄 End-to-End Pipeline Architecture

```text
       ┌────────────────────────────────────────────────────────────┐
       │                   Incoming User Query                      │
       └─────────────────────────────┬──────────────────────────────┘
                                     │
                                     ▼
       ┌────────────────────────────────────────────────────────────┐
       │                 STAGE 1: PROTECT GATEWAY                   │
       │  • PII & Secret Masking (Presidio + Shannon Entropy)       │
       │  • Risk Classifier (Prompt injection, Jailbreak, Fraud)    │
       └──────────────┬──────────────────────────────┬──────────────┘
                      │                              │
             [ HIGH Risk >= 0.70 ]          [ Passed: LOW / MED ]
                      │                              │
                      ▼                              ▼
             🛑 HARD BLOCK RETURN           ┌───────────────────────────────────┐
                                            │         STAGE 2: PREPARE          │
                                            │ • Input 0: Tool Discovery         │
                                            │ • Context Sufficiency Check       │
                                            │ • Tool-Aware Query Rewriting      │
                                            └───────┬───────────────────┬───────┘
                                                    │                   │
                                          [ Vague / Missing Info ]   [ Sufficient ]
                                                    │                   │
                                                    ▼                   ▼
                                           ⚠️ ESCALATE FOR        ┌───────────────────────────────────┐
                                            CLARIFICATION         │    STAGE 3: ENTERPRISE AGENT      │
                                                                  │ • NVIDIA Llama 3.1 8B Instruct    │
                                                                  │ • Token & Cost Estimation Telemetry│
                                                                  └─────────────────┬─────────────────┘
                                                                                    │
                                                                                    ▼
                                                                  ┌───────────────────────────────────┐
                                                                  │         STAGE 4: VALIDATE         │
                                                                  │ • Factual Critic (Hallucinations) │
                                                                  │ • Bias & Fairness Checker Agent   │
                                                                  └───────┬───────────────────┬───────┘
                                                                          │                   │
                                                                [ Flagged & Retries < MAX ] [ Clean Pass ]
                                                                          │                   │
                                                                          ▼                   ▼
                                                                  🔁 CONTROLLED       ┌───────────────────────────────────┐
                                                                     RETRY LOOP       │         STAGE 5: RESPOND          │
                                                                     (Inject Guidance)│ • Collision-Free Detokenization   │
                                                                                      │ • Real Plaintext Restored         │
                                                                                      │ • Final Safe Output Delivery      │
                                                                                      └───────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
controlplane/
├── pyproject.toml               # Poetry/pip project metadata and dependencies
├── .env.example                 # Template for environment configuration & API keys
├── .gitignore                   # Excludes .env, virtualenvs, bytecode, test caches
├── README.md                    # System documentation and architecture guide
├── streamlit_app.py             # Demo-ready interactive Streamlit dashboard
├── src/
│   └── controlplane/
│       ├── __init__.py          # Package root exposing __version__
│       ├── config.py            # Environment settings and zero-trust key validation
│       ├── models.py            # Pydantic data contracts for all pipeline stages
│       ├── pipeline.py          # Master ControlPlane orchestration engine
│       ├── agent_interface.py   # NVIDIA Llama 3.1 8B client + token/cost estimation
│       ├── axi_bridge.py        # Enterprise AXI protocol bridge (architectural stub)
│       ├── sampling.py          # Dynamic sampling modulator (architectural stub)
│       ├── protect/             # Stage 1: Protect
│       │   ├── pii_mask.py      # Presidio regexes, Shannon entropy & token mapping
│       │   └── risk_classifier.py # Deterministic risk classification rules
│       ├── prepare/             # Stage 2: Prepare
│       │   ├── context_check.py # Tool discovery (Input 0) & context assessment
│       │   └── query_rewrite.py # Query text compression & tool injection
│       ├── validate/            # Stage 4: Validate
│       │   ├── critic.py        # Factual correctness & hallucination LLM agent
│       │   └── bias_checker.py  # Fairness, demographic bias & policy LLM agent
│       ├── respond/             # Stage 5: Respond
│       │   └── decrypt.py       # Collision-free token map restoration
│       └── utils/
│           └── logger.py        # Structured logging with request_id correlation
└── tests/
    ├── test_smoke.py            # Package, settings, contracts & stub tests
    ├── test_protect.py          # Entropy, PII masking & Risk Classifier tests
    ├── test_prepare.py          # Tool discovery, context check & rewrite tests
    ├── test_agent.py            # Agent interface, token/cost estimation tests
    ├── test_validate.py         # Critic, Bias Checker & retry exhaustion tests
    ├── test_respond.py          # Token restoration and decryption tests
    ├── test_ui.py               # Streamlit UI helpers & presets tests
    └── test_e2e.py              # Full end-to-end integration tests
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10, 3.11, 3.12, 3.13, or 3.14.
- `uv` (recommended) or standard `pip` / `venv`.

### 2. Installation & Setup
```bash
# Clone the repository
git clone https://github.com/dhruvkachhela/controlplane.git
cd controlplane

# Create virtual environment and install package in editable mode
uv venv .venv
.venv\Scripts\activate          # On Windows
# source .venv/bin/activate     # On Linux / macOS

uv pip install -e ".[dev]"
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your NVIDIA NIM credentials (if available; otherwise the system automatically runs in high-fidelity local simulation mode):
```env
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
RISK_THRESHOLD=0.70
MAX_RETRIES=3
LOG_LEVEL=INFO
```

### 4. Running the Test Suite
Execute the full test suite with coverage:
```bash
pytest tests/ -v --cov=controlplane
```

### 5. Launching the Interactive Streamlit UI
```bash
streamlit run streamlit_app.py
```
Open your browser at `http://localhost:8501` to test the live demo presets:
- **Normal Business Query**: Watch live PII/Secret tokenization and clean post-validation decryption.
- **High-Risk Injection**: See zero-trust hard-blocking at the Protect risk gate.
- **Ambiguous Query**: See context evaluation trigger human escalation before model invocation.
- **Financial Fraud**: Experience risk classifier stopping unauthorized capital movements.
- **Tool Optimization**: Observe prompt fluff compression and tool injection.

---

## 🔒 Security & Privacy Guarantees
- **No Hardcoded Keys**: API credentials and secrets are loaded exclusively from `.env`.
- **Zero Plaintext Leakage**: Downstream models, Critic agents, and Bias Checkers only see token placeholders (`<PII_EMAIL_1>`), preventing training data poisoning or vendor surveillance.
- **Deterministic Hard Blocks**: Critical security threats cannot be bypassed by LLM persuasion or jailbreak tricks.

---

## 👥 Authors & Acknowledgements
- Built for the **Accenture Innovation Challenge 2026**.
- Developed by **Team Grown Wings**.
