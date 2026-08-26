"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("001");

  // Keyboard shortcut listener (Escape to close, ⌘J to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[#0F0F0F] border-l border-white/15 text-white shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between bg-[#141414]">
              <div>
                <div className="font-mono text-[11px] text-[#FF5500] uppercase tracking-widest font-semibold">
                  A PERSONAL NOTE FROM THE MAINTAINER
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white mt-1">
                  README ╱ THE CONTENT ARCHITECTURE
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-mono text-sm hover:bg-white hover:text-black transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Sub-nav Tabs */}
            <div className="flex border-b border-white/10 bg-[#121212] px-6 sm:px-8 gap-6 font-mono text-xs uppercase tracking-wider overflow-x-auto">
              <button
                onClick={() => setActiveTab("001")}
                className={`py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === "001"
                    ? "border-[#FF5500] text-white font-bold"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                001 / WHY THIS EXISTS
              </button>
              <button
                onClick={() => setActiveTab("002")}
                className={`py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === "002"
                    ? "border-[#FF5500] text-white font-bold"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                002 / WHY I KEEP SHIPPING IT
              </button>
              <button
                onClick={() => setActiveTab("003")}
                className={`py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === "003"
                    ? "border-[#FF5500] text-white font-bold"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                003 / WHO AM I
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto font-sans text-sm sm:text-base text-ghost-grey space-y-4 leading-relaxed">
              {activeTab === "001" && (
                <div className="space-y-4">
                  <p>
                    Every Sanity project I shipped, the first week looked identical. Spin up Next, or Astro. Wire the Studio. Rewrite the page builder. Rebuild the SEO layer. Re-do the webhook revalidation. Re-style the same contact form for the fourth time.
                  </p>
                  <p>
                    By the time the actual creative work started, 3 days of the budget were gone and the client had not seen a single pixel that mattered.
                  </p>
                  <p>
                    Extracting it started small. One project. Then two. Then ten. Every time something broke in production—a Sanity migration that nuked a dataset, a CDN cache that served stale OG images for three weeks, a webhook that fired twice and corrupted a sitemap—the fix went back into the boilerplate.
                  </p>
                  <p>
                    For a long time I called this the cost of headless. I had rebuilt the same foundation so many times I could do it half-asleep, and I mistook that for being good at my job instead of what it was: doing the same work twice.
                  </p>
                </div>
              )}

              {activeTab === "002" && (
                <div className="space-y-4">
                  <p>
                    I use this on every project. I am the heaviest user. The bug I find on a Friday client engagement is the patch you get on Monday.
                  </p>
                  <p>
                    I am one person, not a team. That is a feature. The architecture is consistent because one mind held it from the first schema file to the last revalidation hook. Nobody overrode the opinion. Nobody added a field because a stakeholder asked nicely.
                  </p>
                  <p>
                    There is no distance between me and this. When you open the fetch layer or the page builder, you are reading how I actually ship, not a demo cleaned up for sale. You get the thing I rely on, maintained by the person who relies on it most.
                  </p>
                  <p>
                    I am not trying to turn this into a SaaS. There is no dashboard, no seat-based pricing, no telemetry. You buy the repo, you own the repo.
                  </p>
                </div>
              )}

              {activeTab === "003" && (
                <div className="space-y-4">
                  <p>
                    I am <strong>Edoardo Lunardi</strong> — Creative Web Engineer, nearly a decade in. Sanity Pioneer 2026, Awwwards jury member, recognized across Awwwards, CSSDA, and FWA.
                  </p>
                  <p>
                    I have shipped for Buck, Disney, Porsche, Red Bull, Le Labo Fragrances, and Getty. Design sensibility, technical depth, obsessive about detail. Based in Vienna, working worldwide.
                  </p>
                  <div className="pt-4 flex items-center gap-4 font-mono text-xs text-white">
                    <a
                      href="https://www.edoardolunardi.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dashed underline-offset-4 hover:text-[#FF5500]"
                    >
                      edoardolunardi.dev ↗
                    </a>
                    <a
                      href="mailto:hello@edoardolunardi.dev"
                      className="underline decoration-dashed underline-offset-4 hover:text-[#FF5500]"
                    >
                      hello@edoardolunardi.dev
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-[#141414] flex items-center justify-between font-mono text-xs">
              <span className="text-white/40">PRESS ESC TO CLOSE</span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-white text-black font-semibold hover:bg-cream-100 transition-colors cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
