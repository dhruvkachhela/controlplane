"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { StatementOne, StatementTwo } from "@/components/Transitions";
import InteractivePlayground from "@/components/InteractivePlayground";
import RepoSection from "@/components/RepoSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FF5500] selection:text-white">
      {/* 1. Floating Global Navigation with Scroll-Spy */}
      <Navbar />

      {/* 2. Hero: Value Proposition & Signature Rotating Spiral */}
      <Hero />

      {/* 3. Zero-Trust Philosophy Transition Statement */}
      <StatementOne />

      {/* 4. Live Interactive Zero-Trust Trial Playground */}
      <InteractivePlayground />

      {/* 5. Economics & Performance Metrics (84.4% Compute Savings) */}
      <StatementTwo />

      {/* 6. Developer Implementation & Code Architecture */}
      <RepoSection />

      {/* 7. Authoritative Footer */}
      <Footer />
    </main>
  );
}
