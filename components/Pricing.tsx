"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Pricing() {
  const plans = [
    {
      name: "Single License",
      price: "$149",
      period: "ONE-TIME PURCHASE",
      desc: "For solo developers and single client engagements. Buy once, own forever.",
      features: [
        "Full Next.js 15 (App Router) + Astro codebase",
        "Sanity Studio v3 with complete page builder schemas",
        "Type-safe GROQ fetch layer + Typegen bindings",
        "AGENTS.md + 1,335+ Agent Skills catalog",
        "2 Production MCP Servers (App Reader + Real Chrome)",
        "Automated llms.txt & Markdown twin generation",
        "1 Production domain deployment",
        "Lifetime updates & patches",
      ],
      cta: "GET SINGLE LICENSE",
      highlight: false,
    },
    {
      name: "Agency / Unlimited",
      price: "$299",
      period: "ONE-TIME PURCHASE",
      desc: "For agencies and freelancers shipping multiple client projects every month.",
      features: [
        "Everything in Single License",
        "Unlimited client projects & production domains",
        "Multi-environment dataset migration scripts",
        "Whitelabel studio configuration & custom desk presets",
        "Priority GitHub PRs & Discord community channel",
        "Commercial redistribution rights on client deliverables",
        "Lifetime updates & new skill additions",
      ],
      cta: "GET AGENCY LICENSE",
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="relative w-full bg-[#0A0A0A] bg-dots text-white py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-b border-white/10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#8E8E93] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span>005 / PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Buy once, own it forever.
          </h2>
          <p className="text-ghost-grey text-base sm:text-lg mt-4 font-normal">
            No SaaS subscriptions, no seat tiers, no telemetry. Six years of decisions committed directly to your repository.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-8 sm:p-10 rounded-8 border flex flex-col justify-between transition-all ${
                plan.highlight
                  ? "bg-[#141414] border-[#FF5500]/60 shadow-[0_0_30px_rgba(255,85,0,0.12)] ring-1 ring-[#FF5500]/30"
                  : "bg-[#111111] border-white/15 hover:border-white/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider mb-4">
                  <span className="text-white/60 font-semibold">{plan.name}</span>
                  {plan.highlight && (
                    <span className="px-2 py-0.5 rounded bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 text-[10px] font-bold">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-bold font-mono text-white">
                    {plan.price}
                  </span>
                  <span className="font-mono text-xs text-ghost-grey tracking-wider uppercase">
                    / {plan.period}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-ghost-grey leading-relaxed mb-8">
                  {plan.desc}
                </p>

                <div className="pt-6 border-t border-white/10 space-y-3 font-mono text-xs">
                  <div className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-2">
                    INCLUDED IN REPOSITORY:
                  </div>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-white/80">
                      <span className="text-[#FF5500] font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center py-4 rounded font-mono text-xs uppercase tracking-widest font-bold transition-all ${
                    plan.highlight
                      ? "bg-white text-black hover:bg-cream-100 hover:scale-[1.02] shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
