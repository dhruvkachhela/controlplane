"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CounterNumber, ScrambleText } from "@/components/ui/AnimatedText";
import InteractiveZeroTrustPhilosophy from "./InteractiveZeroTrustPhilosophy";

export function StatementOne() {
  return (
    <section className="relative w-full bg-[#F5F2EB] text-black py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12 border-b border-black/10 overflow-hidden">
      {/* Background Subtle Watermark Text - Contained & Fluid Across All Form Factors */}
      <div className="absolute inset-x-4 sm:inset-x-8 lg:inset-x-12 bottom-3 sm:bottom-5 lg:bottom-6 flex justify-end items-end pointer-events-none select-none z-0">
        <span className="font-mono text-[36px] xs:text-[50px] sm:text-[76px] md:text-[100px] lg:text-[135px] xl:text-[160px] font-black text-black/[0.04] leading-none tracking-tighter">
          0-TRUST
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col gap-3"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 font-mono text-xs text-black/60 uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <ScrambleText text="// ZERO-TRUST PHILOSOPHY" />
          </div>

          {/* Edge-to-Edge Interactive Typographic Particle Matrix */}
          <InteractiveZeroTrustPhilosophy />
        </motion.div>
      </div>
    </section>
  );
}

export function StatementTwo() {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [activeModel, setActiveModel] = useState<string>("LAGUNA 2.1 XS");

  React.useEffect(() => {
    fetch("/api/pipeline")
      .then((r) => r.json())
      .then((data) => {
        if (data?.modelDisplayName) setActiveModel(data.modelDisplayName);
      })
      .catch(() => {});
  }, []);

  const stages = [
    { num: "01", name: "PROTECT", metric: "< 0.001s", desc: "Regex & Shannon Entropy PII Tokenization" },
    { num: "02", name: "PREPARE", metric: "38.4% Saved", desc: "Context Sufficiency & Prompt Compression" },
    { num: "03", name: "AGENT", metric: activeModel, desc: `${activeModel} Small-Model Reasoning` },
    { num: "04", name: "VALIDATE", metric: "100% Pass", desc: "Multi-Agent Anti-Hallucination Critic" },
    { num: "05", name: "RESPOND", metric: "0 Leakage", desc: "Deterministic Vault Detokenization" },
  ];

  return (
    <section
      id="metrics"
      className="relative w-full bg-[#0A0A0A] bg-dots-dense text-white py-18 sm:py-24 px-4 sm:px-8 lg:px-12 border-b border-white/10 overflow-hidden"
    >
      {/* Ambient Lighting Gradient */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] pointer-events-none rounded-full blur-[150px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF5500 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center flex flex-col items-center gap-4 mb-10 max-w-3xl"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-white/80 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse shadow-[0_0_8px_#FF5500]" />
            <ScrambleText text={`PRODUCTION BENCHMARKS // NVIDIA NIM ${activeModel}`} />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] px-2">
            <span className="text-[#FF5500]">
              <CounterNumber value={38} decimals={0} suffix="% " />
            </span>
            Blended Compute Savings. <br />
            <span className="text-white/70">Zero Data Leakage. 100% Audit Proof.</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-white/75 leading-relaxed font-normal max-w-2xl px-2">
            By pairing deterministic PII masking with <strong>NVIDIA NIM {activeModel} small-model routing</strong> and Stage 2 prompt compression, ControlPlane reduces enterprise agent infrastructure bills by <strong>~38%</strong> vs direct frontier model invocation (GPT-4o baseline).
          </p>
        </motion.div>

        {/* Reimagined Telemetry & Economics Bento Dashboard */}
        <div className="w-full max-w-6xl rounded-12 sm:rounded-16 border border-white/15 bg-[#0D0D0D]/90 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6">
          {/* Top Row: 3 Core Bento Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Bento Card 1: 38% Compute Economics Breakdown (5 Cols) */}
            <motion.div
              whileHover={{ borderColor: "rgba(255,85,0,0.4)" }}
              className="lg:col-span-5 p-4 sm:p-6 rounded-12 border border-white/10 bg-[#121212] flex flex-col justify-between gap-4 sm:gap-5 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-bold">
                  // COMPUTE ECONOMICS
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] text-[#FF5500] font-bold">
                  SAVE ~38%
                </span>
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1">
                  <CounterNumber value={38} decimals={0} suffix="%" />
                  <span className="text-xs font-sans text-white/50 uppercase font-normal">BLENDED SAVINGS</span>
                </div>

                {/* Visual Comparative Cost Bars */}
                <div className="space-y-2.5 mt-4">
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-white/50 mb-1">
                      <span>FRONTIER HEAVY BASELINE</span>
                      <span>$0.00575 / query</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-full bg-white/40 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-[#FF5500] mb-1 font-bold">
                      <span>CONTROLPLANE + {activeModel}</span>
                      <span>$0.00357 / query</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[62%] bg-[#FF5500] rounded-full shadow-[0_0_10px_#FF5500]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-white/40 flex items-center justify-between pt-2 border-t border-white/5">
                <span>FLUFF COMPRESSION: 38.4%</span>
                <span>EFFICIENCY: 1.6x</span>
              </div>
            </motion.div>

            {/* Bento Card 2: 58/58 Security Evaluation Grid (4 Cols) */}
            <motion.div
              whileHover={{ borderColor: "rgba(255,85,0,0.6)" }}
              className="lg:col-span-4 p-4 sm:p-6 rounded-12 border border-[#FF5500]/40 bg-[#141210] flex flex-col justify-between gap-4 sm:gap-5 transition-colors shadow-[0_0_20px_rgba(255,85,0,0.1)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-bold">
                  // TEST EVALUATION GATES
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-bold font-mono text-[#FF5500] tracking-tight">
                  <CounterNumber value={58} suffix="/58" />
                </div>
                <div className="text-xs font-mono text-white/70 uppercase mt-1 font-bold">
                  100% REGRESSION PASS RATE
                </div>

                {/* 58-Node Micro Matrix Display */}
                <div className="grid grid-cols-10 gap-1 mt-4">
                  {Array.from({ length: 58 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full aspect-square rounded-[1.5px] bg-[#FF5500]/70 hover:bg-[#FF5500] hover:scale-125 transition-all"
                      title={`Evaluation Gate #${i + 1}: PASSED`}
                    />
                  ))}
                </div>
              </div>

              <div className="font-mono text-[10px] text-white/50 pt-2 border-t border-white/5 flex justify-between">
                <span>PYTEST SUITE: 0.69s</span>
                <span>PII + JAILBREAK: 100%</span>
              </div>
            </motion.div>

            {/* Bento Card 3: Speed & Audit Evidence (3 Cols) */}
            <motion.div
              whileHover={{ borderColor: "rgba(255,255,255,0.3)" }}
              className="lg:col-span-3 p-4 sm:p-6 rounded-12 border border-white/10 bg-[#121212] flex flex-col justify-between gap-4 sm:gap-5 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-bold">
                  // FIREWALL SPEED
                </span>
                <span className="font-mono text-[10px] text-white/50">SUB-MS</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                    <CounterNumber value={0.001} decimals={3} suffix="s" />
                  </div>
                  <div className="text-[10px] font-mono text-white/50 uppercase mt-0.5">BLOCK LATENCY</div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                    <CounterNumber value={100} suffix="%" />
                  </div>
                  <div className="text-[10px] font-mono text-white/50 uppercase mt-0.5">AUDIT EVIDENCE</div>
                </div>
              </div>

              <div className="font-mono text-[10px] text-white/40 pt-2 border-t border-white/5">
                SHA-256 REVERSIBLE PROOF
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: 5-Stage Interactive Telemetry Ribbon */}
          <div className="border-t border-white/10 pt-4 sm:pt-5">
            <div className="flex items-center justify-between mb-3 font-mono text-[10px] uppercase text-white/50 tracking-wider">
              <span>// 5-STAGE ZERO-TRUST TELEMETRY CHAIN:</span>
              <span className="text-[#FF5500] font-bold hidden sm:inline">HOVER STAGES TO INSPECT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
              {stages.map((st, i) => {
                const isHov = hoveredStage === i;
                return (
                  <motion.div
                    key={st.num}
                    onMouseEnter={() => setHoveredStage(i)}
                    onMouseLeave={() => setHoveredStage(null)}
                    animate={{
                      scale: isHov ? 1.02 : 1,
                      borderColor: isHov ? "rgba(255,85,0,0.8)" : "rgba(255,255,255,0.1)",
                    }}
                    className={`p-2.5 sm:p-3 rounded-8 border transition-all cursor-pointer ${
                      st.num === "05" ? "col-span-2 sm:col-span-1" : ""
                    } ${
                      isHov ? "bg-[#181512] shadow-[0_0_15px_rgba(255,85,0,0.2)]" : "bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono text-[10px]">
                      <span className="text-white/40">{st.num}</span>
                      <span className="text-[#FF5500] font-bold">{st.metric}</span>
                    </div>
                    <div className="font-bold text-xs font-mono text-white mt-1 truncate">{st.name}</div>
                    <div className="text-[10px] text-white/50 font-mono mt-1 truncate">{st.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
