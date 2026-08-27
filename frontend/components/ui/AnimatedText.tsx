"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MaskedHeadingProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}

export function MaskedHeading({
  children,
  className = "",
  delay = 0,
  as: Component = "h2",
}: MaskedHeadingProps) {
  const lines = children.split("\n");

  return (
    <Component className={`flex flex-col ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden py-0.5">
          <motion.span
            initial={{ y: "115%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{
              duration: 0.75,
              ease: [0.23, 1, 0.32, 1],
              delay: delay + i * 0.12,
            }}
            className="block"
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}

interface ScrambleTextProps {
  text: string;
  className?: string;
}

export function ScrambleText({ text, className = "" }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789//·_[]";

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "\n") return char;
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 28);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-block font-mono cursor-default transition-colors ${className}`}
    >
      {displayText}
    </span>
  );
}

interface CounterNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function CounterNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.4,
}: CounterNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let rafId: number;
    const durationMs = duration * 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = value * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </span>
  );
}
