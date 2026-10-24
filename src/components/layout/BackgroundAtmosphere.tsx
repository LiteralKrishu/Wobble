"use client";

import React from "react";

export function BackgroundAtmosphere() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Clean solid dark neutral base */}
      <div className="absolute inset-0 bg-[#090a0c]" />

      {/* Extremely subtle hairline architectural grid for depth (non-distracting) */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
}
