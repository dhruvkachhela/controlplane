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
  size: number;
  color: string;
  isAccent: boolean;
  alpha: number;
}

export default function InteractiveZeroTrustPhilosophy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1200);
    let height = (canvas.height = Math.max(260, Math.min(380, width * 0.30)));

    const chars = "CONTROLPLANEZERO-TRUST0123456789·";
    let particles: Particle[] = [];

    const mouse = {
      x: -2000,
      y: -2000,
      radius: 120,
      strength: 10,
    };

    const shockwaves: { x: number; y: number; radius: number; maxRadius: number; strength: number }[] = [];

    const rasterizeAndInit = () => {
      particles = [];
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
      const fontSize = Math.max(30, Math.min(62, targetW * 0.052));
      offCtx.font = `900 ${fontSize}px 'Outfit', 'Inter', -apple-system, sans-serif`;

      const lineSpacing = fontSize * 1.18;
      const totalTextHeight = lineSpacing * 2.8;
      const startY = Math.max(fontSize * 0.95, (targetH - totalTextHeight) / 2 + fontSize * 0.9);
      const paddingLeft = Math.max(8, targetW * 0.015);

      // Line 1: Deep Black
      offCtx.fillStyle = "#111111";
      offCtx.fillText("Never trust raw input.", paddingLeft, startY);

      // Line 2: Deep Black
      offCtx.fillText("Never leak sensitive data.", paddingLeft, startY + lineSpacing);

      // Line 3: Electric Orange (#FF5500)
      offCtx.fillStyle = "#FF5500";
      offCtx.fillText("Verify every agent response.", paddingLeft, startY + lineSpacing * 2);

      // Sample pixels with high-density step
      const imgData = offCtx.getImageData(0, 0, targetW, targetH).data;
      const step = width < 640 ? 3.2 : 2.6;
      let charIdx = 0;

      for (let y = 0; y < targetH; y += step) {
        for (let x = 0; x < targetW; x += step) {
          const idx = (Math.floor(y) * targetW + Math.floor(x)) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3] / 255;

          const isBackground = r > 235 && g > 230 && b > 220;

          if (a > 0.18 && !isBackground) {
            const isOrange = r > 200 && g < 130 && b < 60;
            const originX = x;
            const originY = y;

            particles.push({
              originX,
              originY,
              x: originX + (Math.random() - 0.5) * 6,
              y: originY + (Math.random() - 0.5) * 6,
              vx: 0,
              vy: 0,
              char: chars[charIdx % chars.length],
              size: step + 0.6,
              color: isOrange ? "#FF5500" : "#111111",
              isAccent: isOrange,
              alpha: 1.0,
            });

            charIdx++;
          }
        }
      }
    };

    rasterizeAndInit();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.max(260, Math.min(380, width * 0.30));
      rasterizeAndInit();
    };

    window.addEventListener("resize", handleResize);

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
        maxRadius: 220,
        strength: 26,
      });
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("click", onClick);

    let time = 0;
    const animate = () => {
      time += 0.035;
      ctx.clearRect(0, 0, width, height);

      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 10;
        if (sw.radius > sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Mouse Repulsion Force
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * mouse.strength;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force;
          p.vy -= Math.sin(angle) * force;
        }

        // 2. Shockwave Pulse
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const swDx = p.x - sw.x;
          const swDy = p.y - sw.y;
          const swDist = Math.sqrt(swDx * swDx + swDy * swDy);
          const diff = Math.abs(swDist - sw.radius);

          if (diff < 35) {
            const swForce = (1 - diff / 35) * (sw.strength * (1 - sw.radius / sw.maxRadius));
            const angle = Math.atan2(swDy, swDx);
            p.vx += Math.cos(angle) * swForce;
            p.vy += Math.sin(angle) * swForce;
          }
        }

        // 3. Subtle float
        p.vx += Math.sin(time + p.originX * 0.04) * 0.06;
        p.vy += Math.cos(time + p.originY * 0.04) * 0.06;

        // 4. Spring return to origin
        const homeDx = p.originX - p.x;
        const homeDy = p.originY - p.y;
        p.vx += homeDx * 0.09;
        p.vy += homeDy * 0.09;

        // 5. Velocity friction
        p.vx *= 0.83;
        p.vy *= 0.83;

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle character glyph
        ctx.fillStyle = p.color;
        ctx.font = `bold ${p.size}px monospace`;
        ctx.fillText(p.char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
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
    <div className="relative w-full overflow-hidden select-none cursor-crosshair">
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
    </div>
  );
}
