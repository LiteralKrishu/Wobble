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
  // Retain props for compatibility but render clean, solid engineering surfaces without artificial glows
  glow = "none",
  hasCorners = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg bg-[#111317] border border-[#1e2229] transition-colors duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
