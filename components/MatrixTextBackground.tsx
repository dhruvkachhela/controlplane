"use client";

import React from "react";

interface MatrixTextBackgroundProps {
  opacity?: number;
  className?: string;
}

export default function MatrixTextBackground({
  opacity = 0.12,
  className = "",
}: MatrixTextBackgroundProps) {
  const phrasesRow1 = [
    "STAGE 1: PROTECT // PII DETOKENIZER",
    "STAGE 2: PREPARE // CONTEXT CHECK",
    "STAGE 3: AGENT // NVIDIA NIM 8B",
    "STAGE 4: VALIDATE // CRITIC LOOP",
    "STAGE 5: RESPOND // SAFE DETOKENIZE",
    "ZERO TRUST ARCHITECTURE",
    "SUB-MILLISECOND RISK GATE",
  ];

  const phrasesRow2 = [
    "DETERMINISTIC REGEX PII MASKING",
    "PROMPT INJECTION FIREWALL",
    "NVIDIA NIM LAGUNA 2.1 XS INFERENCE",
    "MULTI-AGENT CRITIC VERIFICATION",
    "IMMUTABLE CRYPTOGRAPHIC AUDIT HASH",
    "84.4% BLENDED COMPUTE SAVINGS",
    "ZERO CREDENTIAL LEAKAGE",
  ];

  const phrasesRow3 = [
    "AUTONOMOUS AGENT GOVERNANCE",
    "REVERSIBLE TOKEN MAP [EMAIL_1] [API_KEY_1]",
    "ANTI-HALLUCINATION BIAS FILTER",
    "POLICY GATING GATEWAY",
    "ZERO-TRUST PIPELINE",
    "ENTERPRISE GOVERNANCE",
    "GDPR // HIPAA // SOC2 COMPLIANT",
  ];

  const streamLines = [
    { text: phrasesRow1.join(" · ") + " · " + phrasesRow1.join(" · "), duration: 55, dir: "left", opacity: 0.16, size: "11.5px", delay: 0 },
    { text: phrasesRow2.join(" ╱ ") + " ╱ " + phrasesRow2.join(" ╱ "), duration: 70, dir: "right", opacity: 0.12, size: "12px", delay: -10 },
    { text: phrasesRow3.join(" · ") + " · " + phrasesRow3.join(" · "), duration: 48, dir: "left", opacity: 0.18, size: "11px", delay: -20 },
    { text: phrasesRow1.join(" // ") + " // " + phrasesRow1.join(" // "), duration: 80, dir: "right", opacity: 0.10, size: "13px", delay: -5 },
    { text: phrasesRow2.join(" · ") + " · " + phrasesRow2.join(" · "), duration: 62, dir: "left", opacity: 0.14, size: "11px", delay: -15 },
    { text: phrasesRow3.join(" ╱ ") + " ╱ " + phrasesRow3.join(" ╱ "), duration: 85, dir: "right", opacity: 0.11, size: "12.5px", delay: -28 },
    { text: phrasesRow1.join(" · ") + " · " + phrasesRow1.join(" · "), duration: 52, dir: "left", opacity: 0.17, size: "10.5px", delay: -12 },
    { text: phrasesRow2.join(" // ") + " // " + phrasesRow2.join(" // "), duration: 68, dir: "right", opacity: 0.13, size: "12px", delay: -35 },
  ];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes matrix-drift-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes matrix-drift-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .matrix-row {
          white-space: nowrap;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .matrix-row {
            animation: none !important;
          }
        }
      `}</style>

      {/* Atmospheric Dense Architecture Text Field */}
      <div
        className="w-full h-full flex flex-col justify-around py-8 transform -rotate-2 scale-110 origin-center"
        style={{ opacity }}
      >
        {streamLines.map((line, idx) => (
          <div
            key={idx}
            className="matrix-row font-mono uppercase tracking-[0.25em] text-white"
            style={{
              fontSize: line.size,
              opacity: line.opacity,
              animation: `${
                line.dir === "left" ? "matrix-drift-left" : "matrix-drift-right"
              } ${line.duration}s linear infinite`,
              animationDelay: `${line.delay}s`,
            }}
          >
            <span>{line.text} · </span>
            <span>{line.text} · </span>
          </div>
        ))}
      </div>

      {/* Vignette Gradients for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 20%, rgba(10,10,10,0.7) 70%, #0A0A0A 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
    </div>
  );
}
