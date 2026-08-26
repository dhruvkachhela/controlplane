"use client";

import React from "react";
import { motion } from "framer-motion";
import InteractiveWordSilhouette from "./InteractiveWordSilhouette";
import MatrixTextBackground from "./MatrixTextBackground";

export default function Features() {
  const features = [
    {
      id: "001",
      title: "STAGE 1: PROTECT",
      sub: "PII & THREAT GATE",
      desc: "Deterministic regex & entity tokenization masks emails, auth tokens, and SSNs into reversible tokens ([EMAIL_1], [API_KEY_1]). Real-time threat classifier calculates risk score and immediately hard-blocks prompt injections (<0.002s latency, $0.00 compute).",
      tag: "PII + FIREWALL",
    },
    {
      id: "002",
      title: "STAGE 2: PREPARE",
      sub: "CONTEXT CHECK",
      desc: "Validates context sufficiency to prevent hallucinations on ambiguous queries. If pronouns or IDs are missing, it escalates to the operator. For valid queries, it strips prompt bloat and binds optimal enterprise tools from the discovered tool registry.",
      tag: "CONTEXT CHECK",
    },
    {
      id: "003",
      title: "STAGE 3: AGENT",
      sub: "NVIDIA NIM 8B INFERENCE",
      desc: "Executes small-model reasoning with meta/llama-3.1-8b-instruct on NVIDIA NIM runtime hardware. Achieves ultra-low latency and 52.9% net dollar compute savings compared to frontier GPT-4o baselines with zero secret leakage.",
      tag: "NVIDIA NIM 8B",
    },
    {
      id: "004",
      title: "STAGE 4: VALIDATE",
      sub: "CRITIC VERIFICATION",
      desc: "An independent Critic agent inspects the model's draft response for factual groundedness, bias avoidance, and tool schema compliance. If flaws are detected, a governed feedback loop triggers bounded retries before final delivery.",
      tag: "CRITIC LOOP",
    },
    {
      id: "005",
      title: "STAGE 5: RESPOND",
      sub: "SAFE DETOKENIZE",
      desc: "Only after the response is certified safe, the detokenizer safely restores original entity values. Commits the execution trail with an immutable cryptographic request hash for audit logging.",
      tag: "DETOKENIZE + AUDIT",
    },
    {
      id: "006",
      title: "GOVERNANCE ENGINE",
      sub: "AGENTS.MD CONSTITUTION",
      desc: "Unified policy contract loaded by Claude Code, Cursor, and enterprise orchestrators enforcing strict privacy boundaries, threat evaluation, and audit logging across all executions.",
      tag: "AGENTS.MD PROTOCOL",
    },
    {
      id: "007",
      title: "POLICY GATING",
      sub: "FINANCIAL GATEWAY",
      desc: "Hard rules intercept unauthorized capital movements, unverified offshore transfers, and KYC bypass attempts directly at the gateway without model dependency.",
      tag: "POLICY GATE",
    },
    {
      id: "008",
      title: "COMPLIANCE EXPORT",
      sub: "REGULATORY AUDIT JSON",
      desc: "One-click export of complete audit trails, risk scoring metrics, masked payloads, critic reasoning logs, and token accounting for GDPR, HIPAA, and SOC2 audits.",
      tag: "JSON AUDIT PROOF",
    },
  ];

  return (
    <section
      id="architecture"
      className="relative w-full bg-[#0A0A0A] text-white py-20 sm:py-24 px-4 sm:px-8 lg:px-12 border-b border-white/10 overflow-hidden"
    >
      {/* 1. Background Matrix Texture */}
      <MatrixTextBackground opacity={0.05} />

      {/* 2. Soft Ambient Vignettes */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(10,10,10,0.65) 75%, #0A0A0A 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none z-0" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none z-0" />

      {/* 3. Main Architecture Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="flex items-center gap-2 font-mono text-xs text-[#8E8E93] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
            <span>002 / ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
            Every guardrail committed. <br />
            So you can skip to the <span className="text-[#27C93F]">actual work.</span>
          </h2>

          <p className="text-ghost-grey text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
            The production foundation under enterprise AI: <strong>deterministic privacy</strong>, <strong>small-model routing</strong>, <strong>critic validation</strong>, and <strong>cryptographic audit proofs</strong> committed once.
          </p>
        </div>

        {/* 1. Featured First: Panoramic Typographic Sunset Canvas */}
        <InteractiveWordSilhouette />

        {/* 2. Then: Clean Horizontal Rectangular Format Cards in Emerald Green */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
              className="p-6 sm:p-7 rounded-8 border border-white/15 bg-[#121212]/90 backdrop-blur-md hover:border-[#27C93F]/50 hover:bg-[#161616]/95 transition-all shadow-xl flex flex-col justify-between gap-3 group"
            >
              {/* Top Row: ID, Title, and Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-[#27C93F]">{feature.id} //</span>
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight">{feature.title}</span>
                  <span className="hidden sm:inline-block font-mono text-[11px] text-white/50 uppercase tracking-wider">
                    ({feature.sub})
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-[#27C93F]/10 border border-[#27C93F]/30 text-[#27C93F] text-[10px] font-mono font-bold tracking-widest">
                  {feature.tag}
                </span>
              </div>

              {/* Description Row */}
              <p className="text-xs sm:text-sm text-ghost-grey leading-relaxed font-normal text-white/80 pt-1">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
