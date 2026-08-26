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
}

export default function InteractiveWordSilhouette() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1280);
    let height = (canvas.height = 360);

    const phrase = "CONTROLPLANE.AI·";
    let particles: Particle[] = [];

    // Gentle hover & touch strength
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
      strength: 8,
    };

    const img = new Image();
    img.src = "/clouds.png";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      initFromImage(img);
    };

    img.onerror = () => {
      initProcedural();
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
      if (img.complete && img.naturalWidth > 0) {
        initFromImage(img);
      } else {
        initProcedural();
      }
    };

    window.addEventListener("resize", handleResize);

    const initFromImage = (image: HTMLImageElement) => {
      particles = [];
      const offCanvas = document.createElement("canvas");
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      // Dense full-width panoramic grid
      const targetW = 240;
      const targetH = 65;
      offCanvas.width = targetW;
      offCanvas.height = targetH;

      offCtx.drawImage(image, 0, 0, targetW, targetH);
      const imgData = offCtx.getImageData(0, 0, targetW, targetH).data;

      // 100% edge-to-edge fill with ZERO empty space on left or right
      const stepX = width / targetW;
      const stepY = height / targetH;

      let phraseIdx = 0;

      for (let y = 0; y < targetH; y += 2) {
        for (let x = 0; x < targetW; x += 2) {
          const idx = (y * targetW + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3] / 255;
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          if (a > 0.08 && brightness > 0.06) {
            const originX = x * stepX;
            const originY = y * stepY;

            const char = phrase[phraseIdx % phrase.length];
            phraseIdx++;

            const isAccent = r > 180 && g > 120 && b < 140;
            const particleAlpha = Math.min(0.95, Math.max(0.28, brightness * 1.15));

            particles.push({
              originX,
              originY,
              x: originX + (Math.random() - 0.5) * 3,
              y: originY + (Math.random() - 0.5) * 3,
              vx: 0,
              vy: 0,
              char,
              size: Math.floor(9 + brightness * 4.5),
              color: `rgba(${r}, ${g}, ${b}, ${particleAlpha})`,
              isAccent,
            });
          }
        }
      }
    };

    const initProcedural = () => {
      particles = [];
      let phraseIdx = 0;

      for (let y = 0; y <= height; y += 12) {
        for (let x = 0; x <= width; x += 11) {
          const char = phrase[phraseIdx % phrase.length];
          phraseIdx++;
          particles.push({
            originX: x,
            originY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            char,
            size: 11,
            color: "#FF9966",
            isAccent: false,
          });
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const blastAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
        const speed = 4 + Math.min(10, (400 / (dist + 60)) * 7);

        p.vx += Math.cos(blastAngle) * speed;
        p.vy += Math.sin(blastAngle) * speed;
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("click", onClick);

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Soft Mouse Repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouse.radius - dist) / mouse.radius;
          const repulsion = Math.pow(force, 1.4) * mouse.strength;
          p.vx -= Math.cos(angle) * repulsion;
          p.vy -= Math.sin(angle) * repulsion;
        }

        // 2. Subtle Idle Float
        const idleX = Math.sin(time + p.originY * 0.03) * 0.25;
        const idleY = Math.cos(time + p.originX * 0.03) * 0.25;

        // 3. Harmonic Spring Return
        const springX = (p.originX + idleX - p.x) * 0.065;
        const springY = (p.originY + idleY - p.y) * 0.065;

        p.vx += springX;
        p.vy += springY;

        // 4. Damping
        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        const displacement = Math.sqrt(
          Math.pow(p.x - p.originX, 2) + Math.pow(p.y - p.originY, 2)
        );

        ctx.font = `600 ${p.size}px monospace`;

        if (displacement > 14) {
          ctx.fillStyle = "#FF5500";
        } else {
          ctx.fillStyle = p.color;
        }

        ctx.fillText(p.char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

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
    <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center cursor-crosshair mb-10 select-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {/* Subtle Ambient Fade on top & bottom edges */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
    </div>
  );
}
