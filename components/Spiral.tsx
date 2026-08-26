"use client";

import React from "react";

export default function Spiral() {
  const rings = [
    {
      id: "ring-1",
      r: 70,
      text: "· CONTROLPLANE.AI · ZERO TRUST RUNTIME · ",
      duration: 35,
      dir: "normal",
      opacity: "opacity-60",
      fontSize: "9.5px",
    },
    {
      id: "ring-2",
      r: 125,
      text: "· 5-STAGE ZERO-TRUST PIPELINE · SUB-0.002s BLOCK LATENCY · ",
      duration: 48,
      dir: "reverse",
      opacity: "opacity-65",
      fontSize: "10.5px",
    },
    {
      id: "ring-3",
      r: 185,
      text: "· DETERMINISTIC PII MASKING · PROMPT INJECTION FIREWALL · ENTITY TOKENIZER · ",
      duration: 60,
      dir: "normal",
      opacity: "opacity-75",
      fontSize: "11px",
    },
    {
      id: "ring-4",
      r: 255,
      text: "· NVIDIA NIM LLAMA 3.1 8B INFERENCE · 52.9% COMPUTE COST SAVINGS · ZERO DATA LEAKAGE · ",
      duration: 72,
      dir: "reverse",
      opacity: "opacity-85",
      fontSize: "11.5px",
    },
    {
      id: "ring-5",
      r: 335,
      text: "· MULTI-AGENT CRITIC VALIDATION · ANTI-HALLUCINATION GROUNDING · POLICY COMPLIANCE · ",
      duration: 85,
      dir: "normal",
      opacity: "opacity-70",
      fontSize: "12px",
    },
    {
      id: "ring-6",
      r: 420,
      text: "· 58/58 AGENT EVALUATION TESTS PASSING · 100% AUDIT PROOF EVIDENCE · REVERSIBLE TOKENS · ",
      duration: 100,
      dir: "reverse",
      opacity: "opacity-55",
      fontSize: "12.5px",
    },
    {
      id: "ring-7",
      r: 515,
      text: "· ENTERPRISE AGENT GOVERNANCE · REAL-TIME TELEMETRY · SHANNON ENTROPY CLASSIFIER · CRYPTOGRAPHIC AUDIT TRAILS · ",
      duration: 120,
      dir: "normal",
      opacity: "opacity-40",
      fontSize: "13px",
    },
    {
      id: "ring-8",
      r: 620,
      text: "· AUTONOMOUS AI AGENT GUARDRAIL ENGINE · NEVER TRUST RAW INPUT · NEVER LEAK CREDENTIALS · VERIFY EVERY RESPONSE · ",
      duration: 145,
      dir: "reverse",
      opacity: "opacity-30",
      fontSize: "13.5px",
    },
  ];

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden select-none pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Inline styles for continuous GPU-accelerated rotation & gentle breathing */}
      <style>{`
        @keyframes spin-infinite {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes subtle-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .spiral-container-breathe {
          animation: subtle-breathe 16s ease-in-out infinite;
          will-change: transform;
        }

        .spiral-ring {
          transform-origin: 650px 650px;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .spiral-container-breathe,
          .spiral-ring {
            animation: none !important;
          }
        }
      `}</style>

      {/* Full-Screen Breathing Concentric Wrapper */}
      <div className="spiral-container-breathe relative w-full h-full flex items-center justify-center">

        {/* SVG Canvas for concentric circular text paths */}
        <svg
          viewBox="0 0 1300 1300"
          className="w-[140vw] h-[140vw] min-w-[900px] min-h-[900px] max-w-none transform scale-95 sm:scale-100 opacity-80"
          style={{ willChange: "transform" }}
        >
          <defs>
            {rings.map((ring) => (
              <path
                key={ring.id}
                id={ring.id}
                d={`M 650, 650 m -${ring.r}, 0 a ${ring.r},${ring.r} 0 1,1 ${ring.r * 2},0 a ${ring.r},${ring.r} 0 1,1 -${ring.r * 2},0`}
              />
            ))}
          </defs>

          {rings.map((ring) => (
            <g
              key={ring.id}
              className={`spiral-ring ${ring.opacity}`}
              style={{
                animation: `spin-infinite ${ring.duration}s linear infinite ${
                  ring.dir === "reverse" ? "reverse" : "normal"
                }`,
              }}
            >
              <text
                fill="currentColor"
                className="font-mono tracking-[0.22em] uppercase text-white fill-white"
                style={{ fontSize: ring.fontSize, fontWeight: 500 }}
              >
                <textPath href={`#${ring.id}`} startOffset="0%">
                  {ring.text}
                </textPath>
              </text>
            </g>
          ))}
        </svg>

        {/* Radial Fade Overlay to Keep Center Text Readability Crystal Clear */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(10,10,10,0.88) 18%, rgba(10,10,10,0.72) 45%, rgba(10,10,10,0.3) 75%, #0A0A0A 100%)",
          }}
        />
      </div>
    </div>
  );
}
