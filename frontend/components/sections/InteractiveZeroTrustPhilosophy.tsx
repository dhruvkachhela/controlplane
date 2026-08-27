"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export default function InteractiveZeroTrustPhilosophy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setHoveredLine] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const resizeCanvas = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    const shockwaves: Shockwave[] = [];
    const particles: ParticleNode[] = [];
    const numParticles = width < 640 ? 24 : 45;

    // Initialize floating ambient security nodes
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.7 ? "#FF5500" : "#111111",
        alpha: Math.random() * 0.25 + 0.08,
      });
    }

    const mouse = {
      x: -2000,
      y: -2000,
      radius: 120,
    };

    const triggerShockwave = (clientX: number, clientY: number, isOrange = false) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      shockwaves.push({
        x,
        y,
        radius: 4,
        maxRadius: Math.max(160, Math.min(320, width * 0.35)),
        opacity: 0.7,
        color: isOrange ? "#FF5500" : "#222222",
      });

      // Scatter nearby particles on impact
      for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const force = (1 - dist / 100) * 4;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.x = -2000;
      mouse.y = -2000;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -2000;
      mouse.y = -2000;
    };

    const onClick = (e: MouseEvent) => {
      triggerShockwave(e.clientX, e.clientY, Math.random() > 0.5);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        triggerShockwave(e.touches[0].clientX, e.touches[0].clientY, true);
      }
    };

    container.addEventListener("mousemove", onMouseMove, { passive: true });
    container.addEventListener("mouseleave", onMouseLeave, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("click", onClick, { passive: true });
    container.addEventListener("touchstart", onTouchStart, { passive: true });

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
      }, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animationFrameId);
          animate();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting telemetry web lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < (width < 640 ? 65 : 95)) {
            const alpha = (1 - dist / (width < 640 ? 65 : 95)) * 0.12;
            ctx.strokeStyle = particles[i].color === "#FF5500" || particles[j].color === "#FF5500"
              ? `rgba(255, 85, 0, ${alpha * 1.5})`
              : `rgba(0, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw & update floating security nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor Repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 1.5;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }

        // Friction and bounds
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color === "#FF5500" ? `rgba(255, 85, 0, ${p.alpha * 1.8})` : `rgba(0, 0, 0, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw and expand ripple shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 5;
        sw.opacity *= 0.94;

        if (sw.opacity < 0.02 || sw.radius > sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color === "#FF5500" ? `rgba(255, 85, 0, ${sw.opacity})` : `rgba(0, 0, 0, ${sw.opacity * 0.7})`;
        ctx.lineWidth = Math.max(1, 2.5 * (1 - sw.radius / sw.maxRadius));
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("click", onClick);
      container.removeEventListener("touchstart", onTouchStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none py-6 sm:py-10 cursor-pointer rounded-12 bg-transparent transition-all"
    >
      {/* Background Interactive Security Grid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Foreground Razor-Sharp Typographic Statements */}
      <div className="relative z-10 flex flex-col gap-2.5 sm:gap-4 md:gap-5 max-w-5xl">
        {/* Line 1 */}
        <motion.div
          onMouseEnter={() => setHoveredLine(1)}
          onMouseLeave={() => setHoveredLine(null)}
          className="flex items-center gap-3 group"
        >
          <span className="font-mono text-[10px] sm:text-xs text-black/30 font-bold tracking-widest hidden xs:inline">
            01 //
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#111111] leading-[1.08] transition-transform duration-200 group-hover:translate-x-1.5">
            Never trust raw input.
          </h2>
        </motion.div>

        {/* Line 2 */}
        <motion.div
          onMouseEnter={() => setHoveredLine(2)}
          onMouseLeave={() => setHoveredLine(null)}
          className="flex items-center gap-3 group"
        >
          <span className="font-mono text-[10px] sm:text-xs text-black/30 font-bold tracking-widest hidden xs:inline">
            02 //
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#111111] leading-[1.08] transition-transform duration-200 group-hover:translate-x-1.5">
            Never leak sensitive data.
          </h2>
        </motion.div>

        {/* Line 3 - Signature Orange Highlight */}
        <motion.div
          onMouseEnter={() => setHoveredLine(3)}
          onMouseLeave={() => setHoveredLine(null)}
          className="flex items-center gap-3 group"
        >
          <span className="font-mono text-[10px] sm:text-xs text-[#FF5500]/60 font-bold tracking-widest hidden xs:inline">
            03 //
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#FF5500] leading-[1.08] transition-transform duration-200 group-hover:translate-x-1.5">
            Verify every agent response.
          </h2>
        </motion.div>
      </div>

      {/* Bottom Subtle Interactive Indicator */}
      <div className="relative z-10 mt-6 sm:mt-8 pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] sm:text-[10px] uppercase text-black/40 tracking-wider">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
          <span>TAP OR HOVER TO TRIGGER ZERO-TRUST SHOCKWAVES</span>
        </span>
        <span className="hidden sm:inline">DETERMINISTIC GUARDRAILS // 100% VERIFIABLE</span>
      </div>
    </div>
  );
}
