"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  Layers,
  Settings,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationRailProps {
  className?: string;
  onNewInvestigation?: () => void;
}

const RAIL_ITEMS = [
  {
    name: "Triage",
    href: "/dashboard",
    icon: Activity,
    tooltip: "Flaky Test Triage & Empirical Signals",
    badge: "38",
  },
  {
    name: "Traces",
    href: "/investigations",
    icon: Search,
    tooltip: "Reproduced Root Cause Traces",
    badge: "4",
  },
  {
    name: "Catalog",
    href: "/tests",
    icon: Layers,
    tooltip: "Test Suite Registry & History",
  },
  {
    name: "Engine",
    href: "/settings",
    icon: Settings,
    tooltip: "DRF Engine & Verifier Configuration",
  },
];

export function NavigationRail({ className }: NavigationRailProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Quick Navigation Rail"
      className={cn(
        "fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center py-4 px-2.5 rounded-2xl bg-[#090713]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(139,92,246,0.08)]",
        className
      )}
    >
      {/* Top Subtle Tech Pill Header / Instability Indicator */}
      <div className="mb-3 flex flex-col items-center group relative">
        <div className="w-8 h-8 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:border-violet-400/60 transition-colors">
          <Flame className="w-4 h-4 text-violet-400 animate-pulse" />
        </div>
        <span className="sr-only">WOBBLE Flake Detection Rail</span>
      </div>

      <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent mb-3" />

      {/* Vertical Navigation Items */}
      <nav className="flex flex-col items-center space-y-3">
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.tooltip}
              aria-label={item.name}
              className={cn(
                "group relative flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                isActive
                  ? "bg-violet-950/50 text-white border border-violet-500/40 shadow-[0_0_14px_rgba(139,92,246,0.25)]"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-[#151026] border border-transparent"
              )}
            >
              {/* Active Indicator Glow Pip */}
              {isActive && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-violet-400 rounded-r shadow-[0_0_8px_#a78bfa]" />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  "w-4 h-4 transition-transform duration-150 group-hover:scale-110",
                  isActive ? "text-violet-300" : "text-zinc-400 group-hover:text-zinc-200"
                )}
              />

              {/* Compact Label */}
              <span
                className={cn(
                  "text-[10px] tracking-tight mt-1 font-medium select-none",
                  isActive ? "text-violet-200 font-semibold" : "text-zinc-400 group-hover:text-zinc-300"
                )}
              >
                {item.name}
              </span>

              {/* Pill Badge if present */}
              {item.badge && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 text-[9px] font-mono px-1 rounded-full border",
                    isActive
                      ? "bg-violet-600 text-white border-violet-400"
                      : "bg-[#161129] text-zinc-400 border-[rgba(139,92,246,0.2)]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent mt-3 mb-2" />

      {/* Bottom Status / Verifier Pip */}
      <div className="mt-1 flex flex-col items-center">
        <Link
          href="/settings"
          title="Empirical Verifier: Connected"
          className="w-7 h-7 rounded-lg bg-[#0e0a1c] border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:border-emerald-400 transition-colors"
          aria-label="Empirical Verifier System Status"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
