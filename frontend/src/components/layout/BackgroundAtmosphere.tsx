"use client";

import React, { useEffect, useRef } from "react";

export function BackgroundAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    // Check prefers-reduced-motion
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

    // Create 32 restrained floating atmospheric particles (dust motes / subtle stars)
    const particleCount = 32;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.2 - 0.05, // subtle upward drift
      alpha: Math.random() * 0.25 + 0.08,
      baseAlpha: Math.random() * 0.25 + 0.08,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      hue: Math.random() > 0.4 ? 265 : 280, // soft violet to electric purple
    }));

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // throttle to 30 FPS for minimal GPU overhead

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

        // Wrap around screen edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gentle sinusoidal twinkle
        p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed) * 0.08;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${Math.max(0.04, p.alpha)})`;
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
      {/* Deep Near-Black Base (#08070d) */}
      <div className="absolute inset-0 bg-[#08070d]" />

      {/* Atmospheric Midnight-Purple Spotlight (Top Center Beam) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] opacity-75 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139, 92, 246, 0.16) 0%, rgba(109, 40, 217, 0.06) 50%, transparent 80%)",
        }}
      />

      {/* Subtle Side Ambient Violet Reflection */}
      <div
        className="absolute top-1/4 -left-48 w-[600px] h-[600px] opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Subtle Right Lower Glow */}
      <div
        className="absolute bottom-10 -right-48 w-[700px] h-[600px] opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(91, 33, 182, 0.07) 0%, transparent 70%)",
        }}
      />

      {/* Soft Cinematic Light Beam (diagonal sweep) */}
      <div
        className="absolute -top-40 -left-20 w-[140%] h-[120%] opacity-[0.03] rotate-[-28deg] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(167, 139, 250, 0.8) 45%, rgba(139, 92, 246, 0.4) 55%, transparent 100%)",
        }}
      />

      {/* Architectural Hairline Grid for Depth */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(167, 139, 250, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(167, 139, 250, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Atmospheric Micro-Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
