"use client";

import React, { useEffect, useState } from "react";

export default function PaperTexture() {
  const [textureOpacity, setTextureOpacity] = useState<number>(0.18);
  const [fiberOpacity, setFiberOpacity] = useState<number>(0.10);
  const [showControls, setShowControls] = useState<boolean>(false);

  useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const cssTex = parseFloat(rootStyle.getPropertyValue("--paper-texture-opacity")) || 0.18;
    const cssFib = parseFloat(rootStyle.getPropertyValue("--paper-grain-opacity")) || 0.10;
    setTextureOpacity(cssTex);
    setFiberOpacity(cssFib);
  }, []);

  const handleTextureChange = (val: number) => {
    setTextureOpacity(val);
    document.documentElement.style.setProperty("--paper-texture-opacity", val.toString());
  };

  const handleFiberChange = (val: number) => {
    setFiberOpacity(val);
    document.documentElement.style.setProperty("--paper-grain-opacity", val.toString());
  };

  return (
    <>
      {/* 1. Main 3D Embossed Paper Texture Overlay */}
      <div
        className="paper-texture-overlay pointer-events-none fixed inset-0 z-[99999]"
        style={{ opacity: textureOpacity }}
        aria-hidden="true"
      />

      {/* 2. Tactile Paper Fibers & Specks Layer */}
      <div
        className="paper-fibers-overlay pointer-events-none fixed inset-0 z-[99998]"
        style={{ opacity: fiberOpacity }}
        aria-hidden="true"
      />

      {/* 3. Discrete Interactive Texture Control Badge */}
      <div className="fixed bottom-4 right-4 z-[100000] font-mono text-xs select-none">
        {!showControls ? (
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Adjust paper texture"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">TEXTURE: {Math.round(textureOpacity * 100)}%</span>
          </button>
        ) : (
          <div className="p-4 rounded-12 bg-[#121212]/95 border border-white/20 text-white backdrop-blur-2xl shadow-2xl flex flex-col gap-3 w-64">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-[11px] text-[#FF5500] tracking-wider">// TEXTURE TUNER</span>
              <button
                onClick={() => setShowControls(false)}
                className="text-white/40 hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Texture Tooth Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-white/70 mb-1">
                <span>PAPER TOOTH</span>
                <span className="text-[#FF5500] font-bold">{Math.round(textureOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={textureOpacity}
                onChange={(e) => handleTextureChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
              />
            </div>

            {/* Fibers Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-white/70 mb-1">
                <span>FIBERS & GRAIN</span>
                <span className="text-[#FF5500] font-bold">{Math.round(fiberOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={fiberOpacity}
                onChange={(e) => handleFiberChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => {
                  handleTextureChange(0.12);
                  handleFiberChange(0.06);
                }}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] text-center cursor-pointer"
              >
                Subtle
              </button>
              <button
                onClick={() => {
                  handleTextureChange(0.18);
                  handleFiberChange(0.10);
                }}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[9px] text-center font-bold text-[#FF5500] cursor-pointer"
              >
                Designer
              </button>
              <button
                onClick={() => {
                  handleTextureChange(0.45);
                  handleFiberChange(0.30);
                }}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] text-center cursor-pointer"
              >
                Heavy
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
