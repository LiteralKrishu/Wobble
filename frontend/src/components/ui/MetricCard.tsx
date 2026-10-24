import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
  icon?: LucideIcon;
  subtext?: string;
  glow?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  delta,
  icon: Icon,
  subtext,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 flex flex-col justify-between transition-all duration-150 hover:border-[rgba(139,92,246,0.32)] hover:bg-[#131020] group",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-400 tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-md text-violet-400 bg-violet-950/40 border border-violet-800/30 group-hover:border-violet-700/50 transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="text-2xl font-semibold text-white tracking-tight">
          {value}
        </div>

        {delta && (
          <div className="flex items-center space-x-1 font-mono text-xs">
            {delta.isNeutral ? (
              <Minus className="w-3 h-3 text-zinc-400" />
            ) : delta.isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            )}
            <span
              className={cn(
                "font-medium",
                delta.isNeutral
                  ? "text-zinc-400"
                  : delta.isPositive
                  ? "text-emerald-400"
                  : "text-rose-400"
              )}
            >
              {delta.value}
            </span>
          </div>
        )}
      </div>

      {(delta?.label || subtext) && (
        <div className="mt-2.5 pt-2 border-t border-[rgba(139,92,246,0.10)] text-[11px] text-zinc-400 truncate">
          {delta?.label || subtext}
        </div>
      )}
    </div>
  );
}
