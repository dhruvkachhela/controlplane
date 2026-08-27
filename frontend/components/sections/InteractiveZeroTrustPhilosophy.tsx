"use client";

import React, { useRef, useEffect } from "react";

interface Particle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  isOrange: boolean;
}

export default function InteractiveZeroTrustPhilosophy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = container.clientWidth || 1200);
    let height = (canvas.height = Math.max(260, Math.min(380, width * 0.30)));

    const chars = "CONTROLPLANEZERO-TRUST0123456789·";
    let blackParticles: Particle[] = [];
    let orangeParticles: Particle[] = [];

    const mouse = {
      x: -2000,
      y: -2000,
      radius: 110,
      strength: 8,
    };

    const shockwaves: { x: number; y: number; radius: number; maxRadius: number; strength: number }[] = [];

    const rasterizeAndInit = () => {
      blackParticles = [];
      orangeParticles = [];

      const offCanvas = document.createElement("canvas");
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      const targetW = width;
      const targetH = height;
      offCanvas.width = targetW;
      offCanvas.height = targetH;

      // Fill background
      offCtx.fillStyle = "#F5F2EB";
      offCtx.fillRect(0, 0, targetW, targetH);

      // Render bold statement headlines
      const fontSize = Math.max(28, Math.min(58, targetW * 0.05));
      offCtx.font = `900 ${fontSize}px 'Outfit', 'Inter', -apple-system, sans-serif`;

      const lineSpacing = fontSize * 1.18;
      const totalTextHeight = lineSpacing * 2.8;
      const startY = Math.max(fontSize * 0.95, (targetH - totalTextHeight) / 2 + fontSize * 0.9);
      const paddingLeft = Math.max(8, targetW * 0.015);

      // Line 1 & 2: Deep Black
      offCtx.fillStyle = "#111111";
      offCtx.fillText("Never trust raw input.", paddingLeft, startY);
      offCtx.fillText("Never leak sensitive data.", paddingLeft, startY + lineSpacing);

      // Line 3: Electric Orange (#FF5500)
      offCtx.fillStyle = "#FF5500";
      offCtx.fillText("Verify every agent response.", paddingLeft, startY + lineSpacing * 2);

      // Balanced sampling step for ultra-crisp typography at 60 FPS
      const imgData = offCtx.getImageData(0, 0, targetW, targetH).data;
      const step = width < 640 ? 4.6 : 3.6;
      let charIdx = 0;

      for (let y = 0; y < targetH; y += step) {
        for (let x = 0; x < targetW; x += step) {
          const idx = (Math.floor(y) * targetW + Math.floor(x)) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3] / 255;

          const isBackground = r > 235 && g > 230 && b > 220;

          if (a > 0.2 && !isBackground) {
            const isOrange = r > 200 && g < 130 && b < 60;
            const p: Particle = {
              originX: x,
              originY: y,
              x: x + (Math.random() - 0.5) * 4,
              y: y + (Math.random() - 0.5) * 4,
              vx: 0,
              vy: 0,
              char: chars[charIdx % chars.length],
              isOrange,
            };

            if (isOrange) {
              orangeParticles.push(p);
            } else {
              blackParticles.push(p);
            }

            charIdx++;
          }
        }
      }
    };

    rasterizeAndInit();

    // 1. Intersection Observer: Stop loop completely when off-screen
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

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!container || !canvas) return;
        width = canvas.width = container.clientWidth;
        height = canvas.height = Math.max(260, Math.min(380, width * 0.30));
        rasterizeAndInit();
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });

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
      const rect = canvas.getBoundingClientRect();
      shockwaves.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        maxRadius: 200,
        strength: 22,
      });
    };

    canvas.addEventListener("mousemove", onMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    canvas.addEventListener("click", onClick, { passive: true });

    let time = 0;

    const updateAndDrawParticles = (particlesList: Particle[], color: string, fontSize: number) => {
      ctx.fillStyle = color;
      const numParticles = particlesList.length;

      for (let i = 0; i < numParticles; i++) {
        const p = particlesList[i];

        // Mouse Repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = mouse.radius * mouse.radius;

        if (distSq < radiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / mouse.radius) * mouse.strength;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force;
          p.vy -= Math.sin(angle) * force;
        }

        // Shockwaves
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const swDx = p.x - sw.x;
          const swDy = p.y - sw.y;
          const swDist = Math.sqrt(swDx * swDx + swDy * swDy);
          const diff = Math.abs(swDist - sw.radius);

          if (diff < 30) {
            const swForce = (1 - diff / 30) * (sw.strength * (1 - sw.radius / sw.maxRadius));
            const angle = Math.atan2(swDy, swDx);
            p.vx += Math.cos(angle) * swForce;
            p.vy += Math.sin(angle) * swForce;
          }
        }

        // Subtle float
        p.vx += Math.sin(time + p.originX * 0.04) * 0.04;
        p.vy += Math.cos(time + p.originY * 0.04) * 0.04;

        // Spring return to origin
        p.vx += (p.originX - p.x) * 0.10;
        p.vy += (p.originY - p.y) * 0.10;

        // Friction
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillText(p.char, p.x, p.y);
      }
    };

    const animate = () => {
      if (!isVisible) return;

      time += 0.03;
      // Fast solid fill instead of clearRect for performance
      ctx.fillStyle = "#F5F2EB";
      ctx.fillRect(0, 0, width, height);

      // Update shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 9;
        if (sw.radius > sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      // Set Font ONCE per frame
      const particleFontSize = width < 640 ? 5.2 : 4.6;
      ctx.font = `bold ${particleFontSize}px monospace`;

      // Batch 1: Deep Black Particles
      updateAndDrawParticles(blackParticles, "#111111", particleFontSize);

      // Batch 2: Electric Orange Particles
      updateAndDrawParticles(orangeParticles, "#FF5500", particleFontSize);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseleave", onMouseLeave);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
        canvas.removeEventListener("click", onClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden select-none cursor-crosshair">
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
    </div>
  );
}

