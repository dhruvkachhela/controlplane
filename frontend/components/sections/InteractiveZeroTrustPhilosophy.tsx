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

    const chars = "CONTROLPLANEZERO-TRUST0123456789·";
    let blackParticles: Particle[] = [];
    let orangeParticles: Particle[] = [];

    let cssWidth = container.clientWidth || 1200;
    let cssHeight = Math.max(180, Math.min(380, cssWidth * (cssWidth < 480 ? 0.52 : cssWidth < 768 ? 0.38 : 0.28)));
    let dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    const mouse = {
      x: -2000,
      y: -2000,
      radius: 110,
      strength: 7,
    };

    const shockwaves: { x: number; y: number; radius: number; maxRadius: number; strength: number }[] = [];

    const rasterizeAndInit = () => {
      blackParticles = [];
      orangeParticles = [];

      cssWidth = container.clientWidth || 1200;
      cssHeight = Math.max(180, Math.min(380, cssWidth * (cssWidth < 480 ? 0.52 : cssWidth < 768 ? 0.38 : 0.28)));
      dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);

      // Offscreen canvas at device-pixel-ratio for crisp typography sampling
      const offCanvas = document.createElement("canvas");
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;

      // Fill cream background
      offCtx.fillStyle = "#F5F2EB";
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

      // Scale offscreen ctx by DPR
      offCtx.scale(dpr, dpr);

      // Fluid font sizing that fits screen perfectly
      const maxLineLength = 28; // "Verify every agent response."
      const availWidth = cssWidth * 0.94;
      const targetFontSize = Math.min(54, Math.max(16, (availWidth / maxLineLength) * 1.65));
      
      offCtx.font = `900 ${targetFontSize}px 'Outfit', 'Inter', -apple-system, sans-serif`;

      const lineSpacing = targetFontSize * 1.22;
      const totalTextHeight = lineSpacing * 2.8;
      const startY = Math.max(targetFontSize * 0.95, (cssHeight - totalTextHeight) / 2 + targetFontSize * 0.85);
      const paddingLeft = Math.max(8, cssWidth * 0.015);

      // Render bold lines
      offCtx.fillStyle = "#111111";
      offCtx.fillText("Never trust raw input.", paddingLeft, startY);
      offCtx.fillText("Never leak sensitive data.", paddingLeft, startY + lineSpacing);

      offCtx.fillStyle = "#FF5500";
      offCtx.fillText("Verify every agent response.", paddingLeft, startY + lineSpacing * 2);

      // Read back exact pixels in DPR space
      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
      
      // Proportional sampling step calibrated to targetFontSize and DPR
      // This ensures characters never overlap into jumbled blobs on phones or desktops
      const step = Math.max(2.4, (targetFontSize * dpr) * 0.075);
      let charIdx = 0;

      for (let y = 0; y < offCanvas.height; y += step) {
        for (let x = 0; x < offCanvas.width; x += step) {
          const idx = (Math.floor(y) * offCanvas.width + Math.floor(x)) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3] / 255;

          const isBackground = r > 235 && g > 230 && b > 220;

          if (a > 0.25 && !isBackground) {
            const isOrange = r > 200 && g < 130 && b < 60;
            // Convert coordinate back to CSS pixel space
            const cssX = x / dpr;
            const cssY = y / dpr;

            const p: Particle = {
              originX: cssX,
              originY: cssY,
              x: cssX + (Math.random() - 0.5) * 3,
              y: cssY + (Math.random() - 0.5) * 3,
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

    // Intersection observer
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

    const triggerShockwave = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      shockwaves.push({
        x: clientX - rect.left,
        y: clientY - rect.top,
        radius: 0,
        maxRadius: Math.max(140, Math.min(260, cssWidth * 0.35)),
        strength: 18,
      });
    };

    const onClick = (e: MouseEvent) => {
      triggerShockwave(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        triggerShockwave(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener("mousemove", onMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    canvas.addEventListener("click", onClick, { passive: true });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });

    let time = 0;

    const updateAndDrawParticles = (particlesList: Particle[], color: string) => {
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

        // Draw in DPR scaled space
        ctx.fillText(p.char, p.x * dpr, p.y * dpr);
      }
    };

    const animate = () => {
      if (!isVisible) return;

      time += 0.03;

      // Fill background
      ctx.fillStyle = "#F5F2EB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 8;
        if (sw.radius > sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      // Proportional particle font size calibrated to screen DPR
      const particleFontSize = Math.max(2.8, Math.min(5.2, (cssWidth < 480 ? 3.0 : cssWidth < 768 ? 3.8 : 4.4))) * dpr;
      ctx.font = `bold ${particleFontSize}px monospace`;

      // Batch 1: Deep Black Particles
      updateAndDrawParticles(blackParticles, "#111111");

      // Batch 2: Electric Orange Particles
      updateAndDrawParticles(orangeParticles, "#FF5500");

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
        canvas.removeEventListener("touchstart", onTouchStart);
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
