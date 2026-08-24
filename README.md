# ControlPlane.ai

> **Model-Agnostic, Zero-Trust Guardrail Layer Sitting Between End Users and Enterprise Agents**
> *Accenture Innovation Challenge 2026 Prototype*

---

## 🌟 Overview

**ControlPlane.ai** is a real-time guardrail framework that observes, evaluates, and acts on inputs and outputs across **Performance**, **Cost**, and **Safety/Responsibility**.

By executing lightweight SLM guardrails before and after primary model calls, ControlPlane delivers up to **~52.9% net cost reduction** while ensuring enterprise-grade data protection, hallucination prevention, and policy compliance.

---

## 🔄 Core Pipeline Architecture

```text
User Input
    │
    ▼
[ ControlPlane Stage 1: Protect ]
    ├── Secret + PII Masking (Presidio + Shannon Entropy)
    └── Risk Classification (Rule/Keyword Engine) ───[ HIGH Risk ]──► BLOCK
    │
    ▼ [ Passed: Low / Medium ]
[ ControlPlane Stage 2: Prepare ]
    ├── Context Sufficiency Check ───────────[ Insufficient ]──► Escalate
    └── Tool-Aware Query Rewrite (Optimization)
    │
    ▼
[ Enterprise Agent (NVIDIA Llama 3.1 8B) ]
    │
    ▼
[ ControlPlane Stage 3: Validate ]
    ├── Factual Critic (Grounding & Hallucination Check)
    └── Bias & Fairness Checker
    │
    ▼
[ ControlPlane Stage 4: Respond ]
    ├── Token Decryption (Restores user plaintext)
    └── Safe Output Delivery
```

---

## 🚀 Quickstart & Setup

### 1. Installation
Ensure Python 3.10+ is installed. Install dependencies:
```bash
pip install -e .
# or with dev dependencies:
pip install -e ".[dev]"
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and provide your secrets:
```bash
cp .env.example .env
```
Configure your keys in `.env`:
```env
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
```

### 3. Run Tests
```bash
pytest tests/ -v
```

### 4. Launch Streamlit UI
```bash
streamlit run streamlit_app.py
```

---

## 🔒 Security & Zero-Trust
- All secrets and API credentials must be loaded exclusively from the `.env` file.
- Sensitive data is tokenized prior to any downstream model call.
- High-risk queries are blocked immediately at the gateway before hitting the enterprise agent.
