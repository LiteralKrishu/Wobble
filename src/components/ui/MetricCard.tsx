import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  icon: LucideIcon;
  subtext?: string;
  glow?: "none" | "cyan" | "lime" | "violet";
  className?: string;
}

export function MetricCard({
  title,
  value,
  delta,
  icon: Icon,
  subtext,
  glow = "none",
  className,
}: MetricCardProps) {
  return (
    <GlassPanel
      glow={glow}
      hasCorners
      className={cn("p-5 flex flex-col justify-between group", className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            {value}
          </div>
        </div>

        <div
          className={cn(
            "p-2.5 rounded-xl border transition-all duration-300",
            glow === "lime"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:shadow-[0_0_15px_-3px_rgba(16,245,150,0.4)]"
              : glow === "violet"
              ? "bg-violet-500/10 border-violet-500/30 text-violet-400 group-hover:shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:shadow-[0_0_15px_-3px_rgba(0,229,255,0.4)]"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(delta || subtext) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          {delta && (
            <div className="flex items-center space-x-1 font-mono">
              {delta.isNeutral ? (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              ) : delta.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span
                className={cn(
                  "font-medium",
                  delta.isNeutral
                    ? "text-slate-400"
                    : delta.isPositive
                    ? "text-emerald-400"
                    : "text-rose-400"
                )}
              >
                {delta.value}
              </span>
              {delta.label && (
                <span className="text-slate-500 text-[11px] ml-1">
                  {delta.label}
                </span>
              )}
            </div>
          )}

          {subtext && !delta && (
            <span className="text-slate-400 text-[11px] font-mono">
              {subtext}
            </span>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
