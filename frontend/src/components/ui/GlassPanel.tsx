import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "none" | "cyan" | "lime" | "violet" | "amber";
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
        "relative rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] transition-all duration-150",
        glow === "violet" && "shadow-[0_0_20px_rgba(139,92,246,0.15)] border-violet-500/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
