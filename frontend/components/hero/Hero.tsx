"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import Spiral from "./Spiral";
import { ScrambleText } from "@/components/ui/AnimatedText";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const [activeModel, setActiveModel] = React.useState("LAGUNA 2.1 XS");
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/pipeline")
      .then((r) => r.json())
      .then((data) => {
        if (data?.modelDisplayName) setActiveModel(data.modelDisplayName);
        if (data?.status) setIsOnline(data.status === "ONLINE");
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A] bg-dots text-white py-20 sm:py-24 px-4 sm:px-8 lg:px-12 border-b border-white/10">
      {/* 1. Full-Screen Revolving Concentric Data Rings (Background Layer) */}
      <Spiral />

      {/* 2. Central Content Layer */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-5 sm:gap-6"
        >
          {/* Eyebrow Pill */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-[#141414]/85 backdrop-blur-xl shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse shrink-0 shadow-[0_0_8px_#FF5500]" />
            <span className="font-mono text-xs tracking-[0.16em] uppercase text-white/90 font-bold">
              <ScrambleText text="CONTROLPLANE.AI // ZERO-TRUST RUNTIME" />
            </span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] max-w-3xl"
          >
            The <span className="text-[#FF5500] underline decoration-[#FF5500]/30 decoration-4 underline-offset-8">Zero-Trust</span> <br />
            Control Plane for <br />
            AI Agents.
          </motion.h1>

          {/* Action CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-1"
          >
            <a
              href="#interactive"
              className="inline-flex items-center gap-3 px-7 py-3 rounded bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#FF5500] hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] group cursor-pointer"
            >
              <span>EXPLORE THE CONTROL PLANE</span>
              <span className="group-hover:translate-y-0.5 transition-transform text-[#FF5500] group-hover:text-white font-bold">
                ↓
              </span>
            </a>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded border border-white/15 bg-[#141414]/90 backdrop-blur-md font-mono text-xs text-white/80 shadow-md">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-[#FF5500] animate-pulse" : "bg-red-500"}`} />
              <span>NVIDIA NIM {activeModel} {isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>
          </motion.div>

          {/* Value Highlights 3-Card Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 w-full max-w-3xl text-left"
          >
            <div className="p-3.5 rounded-8 border border-white/15 bg-[#141414]/80 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-white/30 transition-colors">
              <span className="text-[10px] font-mono uppercase text-white/50 font-semibold tracking-wider">
                STAGE 1-5 PIPELINE
              </span>
              <span className="text-xs font-bold font-mono text-white mt-1">
                PROTECT → RESPOND
              </span>
            </div>

            <div className="p-3.5 rounded-8 border border-white/15 bg-[#141414]/80 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-white/30 transition-colors">
              <span className="text-[10px] font-mono uppercase text-white/50 font-semibold tracking-wider">
                {activeModel}
              </span>
              <span className="text-xs font-bold font-mono text-white mt-1">
                ~38% COST SAVINGS
              </span>
            </div>

            <div className="p-3.5 rounded-8 border border-white/15 bg-[#141414]/80 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-white/30 transition-colors">
              <span className="text-[10px] font-mono uppercase text-white/50 font-semibold tracking-wider">
                SECURITY POSTURE
              </span>
              <span className="text-xs font-bold font-mono text-white mt-1">
                ZERO DATA LEAKAGE
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Metadata Strip */}
      <div className="absolute bottom-5 left-0 right-0 px-6 sm:px-12 flex justify-between items-center font-mono text-[10px] uppercase text-white/40 tracking-widest pointer-events-none z-10">
        <span>CONTROLPLANE.AI // HACKATHON 2026</span>
        <span className="hidden sm:inline">AUTONOMOUS AGENT GOVERNANCE</span>
      </div>
    </section>
  );
}
