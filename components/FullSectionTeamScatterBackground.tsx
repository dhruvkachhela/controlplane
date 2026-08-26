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
  baseAlpha: number;
  isAccent: boolean;
  color: string;
}

export default function FullSectionTeamScatterBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const phrase = "CONTROLPLANE.AI·";
    let particles: Particle[] = [];

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
      strength: 14,
    };

    const img = new Image();
    img.src = "/team.jpg";
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
      height = canvas.height = canvas.parentElement.clientHeight;
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

      const targetW = 150;
      const targetH = Math.round((targetW * image.naturalHeight) / image.naturalWidth);
      offCanvas.width = targetW;
      offCanvas.height = targetH;

      offCtx.drawImage(image, 0, 0, targetW, targetH);
      const imgData = offCtx.getImageData(0, 0, targetW, targetH).data;

      const isDesktop = width >= 1024;

      // Position anchored clearly in the right half of the screen on desktop
      let drawW = isDesktop ? Math.min(width * 0.48, 720) : Math.min(width * 0.95, 600);
      const renderAspect = targetW / targetH;
      let drawH = drawW / renderAspect;

      const startX = isDesktop ? width - drawW - 30 : (width - drawW) / 2;
      const startY = Math.max(50, (height - drawH) * 0.38);

      const stepX = drawW / targetW;
      const stepY = drawH / targetH;

      let phraseIdx = 0;

      for (let y = 0; y < targetH; y += 2) {
        for (let x = 0; x < targetW; x += 2) {
          const idx = (y * targetW + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          if (brightness > 0.12) {
            const originX = startX + x * stepX;
            const originY = startY + y * stepY;

            const char = phrase[phraseIdx % phrase.length];
            phraseIdx++;

            const isAccent = Math.random() < 0.07 && brightness > 0.42;
            const baseAlpha = Math.min(0.85, Math.max(0.14, Math.pow(brightness, 1.25) * 0.95));

            particles.push({
              originX,
              originY,
              x: originX + (Math.random() - 0.5) * 4,
              y: originY + (Math.random() - 0.5) * 4,
              vx: 0,
              vy: 0,
              char,
              size: Math.floor(9.5 + brightness * 4.5),
              baseAlpha,
              isAccent,
              color: isAccent ? "#FF5500" : `rgba(255, 255, 255, ${baseAlpha})`,
            });
          }
        }
      }
    };

    const initProcedural = () => {
      particles = [];
      const centerX = width >= 1024 ? width * 0.75 : width * 0.5;
      const centerY = height * 0.48;
      let phraseIdx = 0;

      for (let y = -160; y <= 160; y += 12) {
        for (let x = -140; x <= 140; x += 11) {
          const char = phrase[phraseIdx % phrase.length];
          phraseIdx++;
          const originX = centerX + x;
          const originY = centerY + y;
          particles.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            char,
            size: 11,
            baseAlpha: 0.6,
            isAccent: Math.random() < 0.08,
            color: "#FFFFFF",
          });
        }
      }
    };

    // Track mouse & touch on parent section
    const parent = canvas.parentElement;
    const onMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && canvas) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // Gentle and fluid wave scatter on click
    const triggerGentleScatter = (clickX: number, clickY: number) => {
      const originClickX = clickX >= 0 ? clickX : width * 0.75;
      const originClickY = clickY >= 0 ? clickY : height * 0.45;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - originClickX;
        const dy = p.y - originClickY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const blastAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
        const speed = 10 + Math.min(22, (800 / (dist + 50)) * 14);

        p.vx += Math.cos(blastAngle) * speed;
        p.vy += Math.sin(blastAngle) * speed;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerGentleScatter(clickX, clickY);
    };

    if (parent) {
      parent.addEventListener("mousemove", onMouseMove);
      parent.addEventListener("mouseleave", onMouseLeave);
      parent.addEventListener("touchmove", onTouchMove, { passive: true });
      parent.addEventListener("touchend", onTouchEnd);
      parent.addEventListener("click", onClick);
    }

    // Render loop with smooth aerodynamic spring recovery
    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Mouse Repulsion
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

        // 2. Gentle Idle Float
        const idleX = Math.sin(time + p.originY * 0.03) * 0.35;
        const idleY = Math.cos(time + p.originX * 0.03) * 0.35;

        // 3. Smooth Harmonic Spring Return (Hooke's Law)
        const springX = (p.originX + idleX - p.x) * 0.055;
        const springY = (p.originY + idleY - p.y) * 0.055;

        p.vx += springX;
        p.vy += springY;

        // 4. Smooth Damping
        p.vx *= 0.90;
        p.vy *= 0.90;

        p.x += p.vx;
        p.y += p.vy;

        // Draw character
        const displacement = Math.sqrt(
          Math.pow(p.x - p.originX, 2) + Math.pow(p.y - p.originY, 2)
        );

        ctx.font = `600 ${p.size}px monospace`;

        if (p.isAccent || displacement > 16) {
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
      if (parent) {
        parent.removeEventListener("mousemove", onMouseMove);
        parent.removeEventListener("mouseleave", onMouseLeave);
        parent.removeEventListener("touchmove", onTouchMove);
        parent.removeEventListener("touchend", onTouchEnd);
        parent.removeEventListener("click", onClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none z-0 select-none"
    />
  );
}
