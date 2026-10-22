"use client";

import React from "react";

export function BackgroundAtmosphere() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-[#050811]" />

      {/* Cyber Technical Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-60" />

      {/* Atmospheric radial light fields */}
      <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px]" />
      <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-violet-600/8 rounded-full blur-[160px]" />

      {/* Tech decorative HUD crosshairs */}
      <div className="absolute top-8 left-8 text-[10px] font-mono tracking-widest text-cyan-400/20 select-none hidden lg:block">
        [SYS_MONITOR // 40.7128° N, 74.0060° W]
      </div>
      <div className="absolute top-8 right-8 text-[10px] font-mono tracking-widest text-emerald-400/20 select-none hidden lg:block">
        [DIAGNOSTIC ENGINE: v3.4.1-ACTIVE]
      </div>
      <div className="absolute bottom-8 left-8 text-[10px] font-mono tracking-widest text-slate-500/20 select-none hidden lg:block">
        + FLAKINESS TELEMETRY CHANNEL // OK
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] font-mono tracking-widest text-slate-500/20 select-none hidden lg:block">
        + PERTURBATION RUNNER // STANDBY
      </div>

      {/* Corner crosshairs */}
      <svg
        className="absolute top-6 left-6 w-4 h-4 text-white/10 hidden sm:block"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M0 8H16M8 0V16" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        className="absolute top-6 right-6 w-4 h-4 text-white/10 hidden sm:block"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M0 8H16M8 0V16" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}
