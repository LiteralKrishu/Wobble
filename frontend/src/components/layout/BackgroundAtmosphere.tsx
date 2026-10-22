"use client";

import React, { useEffect, useRef } from "react";

export function BackgroundAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // 24 restrained floating dust motes (subtle atmospheric depth)
    const particleCount = 24;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.0 + 0.5,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -Math.random() * 0.18 - 0.04,
      alpha: Math.random() * 0.22 + 0.06,
      baseAlpha: Math.random() * 0.22 + 0.06,
      pulseSpeed: Math.random() * 0.012 + 0.005,
      hue: Math.random() > 0.4 ? 268 : 285,
    }));

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS throttle

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed) * 0.06;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${Math.max(0.03, p.alpha)})`;
        ctx.fill();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian / Charcoal Base */}
      <div className="absolute inset-0 bg-[#06050b]" />

      {/* 2. Vector Artwork Background from /public/background.svg */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundImage: "url('/background.svg')",
          backgroundPosition: "center top",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      />

      {/* 3. Atmospheric Vignette & Contrast Scrim for High-Contrast UI Readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 95% 75% at 50% 25%, rgba(6, 5, 11, 0.35) 0%, rgba(6, 5, 11, 0.7) 65%, #06050b 100%)",
        }}
      />

      {/* 4. Atmospheric Top Center Spotlight Bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[600px] opacity-60 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139, 92, 246, 0.16) 0%, rgba(109, 40, 217, 0.04) 50%, transparent 80%)",
        }}
      />

      {/* 5. Abstract Signal Instability Waveform (Representing Non-deterministic Jitter vs Deterministic Runs) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.045] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Stable Baseline */}
        <line
          x1="0"
          y1="450"
          x2="1440"
          y2="450"
          stroke="url(#waveGradient)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        {/* Signal Jitter Wave */}
        <path
          d="M0,450 Q180,420 360,450 T720,440 T1080,470 T1440,450"
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="1.5"
        />
        {/* Secondary Harmonic Wave */}
        <path
          d="M0,450 Q240,480 480,450 T960,430 T1440,450"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>

      {/* 6. Technical Architectural Crosshairs & Coordinates */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" aria-hidden="true">
        <div className="absolute top-24 left-16 text-[9px] font-mono text-violet-300">
          + LAT_SYNC: 42.19ms / CI_ORCHESTRATOR
        </div>
        <div className="absolute top-24 right-16 text-[9px] font-mono text-violet-300">
          + SEED_BURST: 0x9f8b4 / DELTA_REDUCTION
        </div>
        <div className="absolute bottom-16 left-16 text-[9px] font-mono text-zinc-400">
          + RUNTIME_ISOLATION: EMPIRICAL_VERIFIER
        </div>
      </div>

      {/* 7. Precision Micro-Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(167, 139, 250, 0.7) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(167, 139, 250, 0.7) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 8. Micro-Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
