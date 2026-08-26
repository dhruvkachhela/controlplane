"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Why not just start from scratch?",
      a: "Starting from scratch costs 3 full days of repetitive plumbing on every project: schema modeling, GROQ typings, draft mode, responsive images, revalidation webhooks, and SEO templates. This kit gives you six years of tested decisions committed directly to your repository so you can start on the creative work immediately.",
    },
    {
      q: "Is this compatible with Next.js 15 App Router and Astro?",
      a: "Yes. The repository includes dual implementations for Next.js 15 (App Router with Server Components & cache tags) and Astro 4/5. Both integrate seamlessly with Sanity Studio v3 and GROQ Typegen.",
    },
    {
      q: "How do AI agents (Cursor, Claude Code) work with this kit?",
      a: "The repository ships with an exhaustive AGENTS.md constitution and 1,335+ scoped agent skills. When an LLM reads the project, it builds inside the existing architectural decisions instead of inventing new arbitrary patterns per run.",
    },
    {
      q: "Can I use this for commercial client projects?",
      a: "Absolutely. Both Single and Agency licenses include full commercial rights to ship client projects, custom marketing sites, and enterprise web applications.",
    },
    {
      q: "What happens after I purchase?",
      a: "You receive immediate access to the GitHub repository containing the complete Next.js and Astro templates, Sanity Studio v3 schemas, MCP server packages, documentation, and Discord community access.",
    },
  ];

  return (
    <section id="faq" className="relative w-full bg-[#0A0A0A] text-white py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-b border-white/10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center gap-2 font-mono text-xs text-[#8E8E93] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span>006 / FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.q} className="py-6 sm:py-8">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer"
                >
                  <span className="text-lg sm:text-xl font-semibold text-white group-hover:text-[#FF5500] transition-colors">
                    {faq.q}
                  </span>
                  <span className="font-mono text-xl text-white/50 group-hover:text-white shrink-0">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm sm:text-base text-ghost-grey leading-relaxed font-normal">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
