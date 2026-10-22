import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "none" | "cyan" | "lime" | "violet";
  hasCorners?: boolean;
}

export function GlassPanel({
  children,
  className,
  glow = "none",
  hasCorners = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl glass-panel transition-all duration-300",
        glow === "cyan" && "border-cyan-500/30 shadow-[0_0_25px_-5px_rgba(0,229,255,0.15)]",
        glow === "lime" && "border-emerald-500/30 shadow-[0_0_25px_-5px_rgba(16,245,150,0.15)]",
        glow === "violet" && "border-violet-500/30 shadow-[0_0_25px_-5px_rgba(168,85,247,0.15)]",
        className
      )}
      {...props}
    >
      {/* Decorative futuristic corner brackets */}
      {hasCorners && (
        <>
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40 rounded-tl-sm pointer-events-none" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/40 rounded-tr-sm pointer-events-none" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/40 rounded-bl-sm pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/40 rounded-br-sm pointer-events-none" />
        </>
      )}
      {children}
    </div>
  );
}
