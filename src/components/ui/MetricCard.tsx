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
        "rounded-lg bg-[#111317] border border-[#1e2229] p-4 flex flex-col justify-between transition-colors hover:border-[#2a303c]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-400 tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className="p-1 rounded text-zinc-400 bg-zinc-800/40">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <div className="text-2xl font-semibold text-zinc-100 tracking-tight">
          {value}
        </div>

        {delta && (
          <div className="flex items-center space-x-1 font-mono text-xs">
            {delta.isNeutral ? (
              <Minus className="w-3 h-3 text-zinc-400" />
            ) : delta.isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span
              className={cn(
                "font-medium",
                delta.isNeutral
                  ? "text-zinc-400"
                  : delta.isPositive
                  ? "text-emerald-400"
                  : "text-red-400"
              )}
            >
              {delta.value}
            </span>
          </div>
        )}
      </div>

      {(delta?.label || subtext) && (
        <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 truncate">
          {delta?.label || subtext}
        </div>
      )}
    </div>
  );
}
