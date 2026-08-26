"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CommonProblems() {
  const problems = [
    {
      id: "01",
      tag: "CRITICAL VULNERABILITY",
      problem: "Unmasked PII & Secret Leakage",
      impact: "Raw prompts send customer emails, auth tokens, and API keys straight to third-party model providers, breaching GDPR, HIPAA, and SOC2 compliance.",
      solution: "Deterministic PII Tokenization: Stage 1 masks all secrets into reversible tokens ([EMAIL_1], [API_KEY_1]) before prompt reaches LLM inference.",
    },
    {
      id: "02",
      tag: "SECURITY EXPLOIT",
      problem: "Adversarial Prompt Injections",
      impact: "Malicious inputs trick autonomous agents into executing dangerous system commands, dumping environment variables, or exfiltrating internal data.",
      solution: "Sub-Millisecond Injection Firewall: Real-time threat scoring intercepts attack vectors at the perimeter in <0.002s with $0.00 compute wasted.",
    },
    {
      id: "03",
      tag: "ECONOMIC WASTE",
      problem: "84.4% Frontier Model Overspend",
      impact: "Sending verbose prompts with conversational fluff to frontier models (GPT-4o/Claude 3.5) causes massive, unnecessary inference bills.",
      solution: "NVIDIA NIM Laguna 2.1 + Prompt Compression: Strips prompt bloat and routes to high-speed Laguna 2.1 XS, slashing compute costs by 84.4% while matching accuracy.",
    },
    {
      id: "04",
      tag: "HALLUCINATION RISK",
      problem: "Ungrounded & Biased Responses",
      impact: "Ungoverned agents output hallucinations, biased statements, or broken tool calls without any validation layer before reaching end users.",
      solution: "Anti-Hallucination Critic Validator: Stage 4 runs an independent verification agent that cross-checks factual grounding before detokenization.",
    },
  ];

  return (
    <section
      id="problems"
      className="relative w-full bg-[#0A0A0A] bg-dots text-white py-20 sm:py-24 px-4 sm:px-8 lg:px-12 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 font-mono text-xs text-[#8E8E93] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span>001 // THE PRODUCTION PROBLEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
            Autonomous agents fail without <br />
            <span className="text-[#FF5500]">deterministic runtime governance.</span>
          </h2>
          <p className="text-ghost-grey text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
            Enterprise LLM applications cannot rely on prompt engineering alone. Here are the 4 failure modes ControlPlane resolves at the gateway layer.
          </p>
        </div>

        {/* 4 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="rounded-8 border border-white/15 bg-[#121212] p-6 sm:p-8 hover:border-[#FF5500]/50 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
                  <span className="px-2.5 py-0.5 rounded bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] font-mono text-[10px] font-bold tracking-widest uppercase">
                    {item.tag}
                  </span>
                  <span className="font-mono text-xs text-white/40 font-bold group-hover:text-[#FF5500] transition-colors">
                    FAILURE #{item.id}
                  </span>
                </div>

                {/* Problem Headline */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                  {item.problem}
                </h3>

                {/* Problem Impact Description */}
                <p className="text-sm text-white/70 leading-relaxed mb-6 font-normal">
                  {item.impact}
                </p>
              </div>

              {/* Solution Box */}
              <div className="rounded bg-[#0A0A0A] border border-white/10 group-hover:border-[#FF5500]/30 p-4 transition-all">
                <div className="font-mono text-[10px] uppercase text-[#FF5500] font-bold tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                  <span>CONTROLPLANE RESOLUTION:</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-mono leading-relaxed">
                  {item.solution}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
