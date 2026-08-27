"use client";

import React from "react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#070707] text-white/70 py-12 px-4 sm:px-8 lg:px-12 border-t border-white/10 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span>CONTROLPLANE.AI</span>
          </div>
          <p className="text-white/40 max-w-sm font-sans text-xs">
            Enterprise Zero-Trust Guardrail Engine for Autonomous AI Agents. Built for Hackathon 2026.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8 uppercase tracking-widest text-[11px]">
          <a href="#interactive" className="hover:text-white transition-colors">
            PLAYGROUND
          </a>
          <a href="#metrics" className="hover:text-white transition-colors">
            METRICS
          </a>
          <a href="#repo" className="hover:text-white transition-colors">
            CODE
          </a>
          <button
            onClick={scrollToTop}
            className="text-[#FF5500] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>TOP</span>
            <span>↑</span>
          </button>
        </div>

        <div className="text-left md:text-right text-white/40 text-[11px]">
          <p>© {new Date().getFullYear()} CONTROLPLANE.AI.</p>
          <p className="mt-1 text-white/60">
            NVIDIA NIM LAGUNA 2.1 XS RUNTIME // ZERO TRUST
          </p>
        </div>
      </div>
    </footer>
  );
}
