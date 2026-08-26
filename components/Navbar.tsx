"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ["interactive", "metrics", "repo"];
      const scrollPosition = window.scrollY + 250;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            return;
          }
        }
      }

      if (window.scrollY < 300) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "interactive", label: "PLAYGROUND", href: "#interactive" },
    { id: "metrics", label: "METRICS", href: "#metrics" },
    { id: "repo", label: "CODE", href: "#repo" },
  ];

  return (
    <>
      {/* 1. Global Black-to-White Top Scroll Loading Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-black via-zinc-400 to-white origin-left z-50 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        style={{ scaleX }}
      />

      {/* 2. Floating Pill Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 py-4 pointer-events-none">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`pointer-events-auto flex items-center justify-between gap-6 sm:gap-10 px-5 sm:px-7 py-2.5 rounded-full border transition-all duration-300 ${scrolled
              ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-white"
              : "bg-[#0A0A0A]/75 backdrop-blur-md border-white/10 text-white/90"
            }`}
        >
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 font-mono text-xs font-bold tracking-wider uppercase text-white hover:text-[#FF5500] transition-colors group"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF5500] group-hover:scale-125 transition-transform animate-pulse shadow-[0_0_8px_#FF5500]" />
            <span className="tracking-widest">CONTROLPLANE.AI</span>
          </a>

          {/* Clean Nav Links */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px] uppercase tracking-widest text-white/70">
            {navItems.map((item, idx) => {
              const isActive = activeSection === item.id;
              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <span className="text-white/20 px-0.5 sm:px-1">·</span>}
                  <a
                    href={item.href}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${isActive
                        ? "bg-white text-black font-bold shadow-md scale-105"
                        : "text-white/70 hover:text-white hover:bg-white/10 active:scale-95"
                      }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                    )}
                    <span>{item.label}</span>
                  </a>
                </React.Fragment>
              );
            })}
          </div>
        </motion.nav>
      </header>
    </>
  );
}
