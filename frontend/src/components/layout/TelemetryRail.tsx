"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Terminal,
  HelpCircle,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryRailProps {
  className?: string;
}

export function TelemetryRail({ className }: TelemetryRailProps) {
  return (
    <aside
      aria-label="CI Telemetry & Diagnostics Dock"
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center py-4 px-2 rounded-2xl bg-[#090713]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(139,92,246,0.08)]",
        className
      )}
    >
      {/* Live CI Stream Signal Indicator */}
      <div
        className="group relative flex flex-col items-center p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mb-3 cursor-default"
        title="CI Stream: 98.4% Health Score"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
        <Radio className="w-4 h-4 text-emerald-400" />
        <span className="text-[9px] font-mono mt-1 font-semibold text-emerald-300">
          98%
        </span>
      </div>

      <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent mb-3" />

      {/* Quick Diagnostics Utilities */}
      <div className="flex flex-col items-center space-y-3 font-mono text-xs">
        {/* Terminal / CLI Adapter */}
        <Link
          href="/settings"
          title="CLI Engine Configuration"
          aria-label="Engine Settings"
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:text-white hover:bg-[#151026] border border-transparent hover:border-violet-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Terminal className="w-4 h-4 text-zinc-400 group-hover:text-violet-300" />
        </Link>

        {/* Global Filter / Tuning */}
        <button
          type="button"
          title="Telemetry Pulse Stream"
          aria-label="Telemetry Pulse Stream"
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:text-white hover:bg-[#151026] border border-transparent hover:border-violet-500/30 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Activity className="w-4 h-4 text-violet-400" />
        </button>

        {/* Quick Search trigger */}
        <div
          title="Keyboard Shortcut: ⌘K to Search"
          className="w-10 h-8 rounded-lg bg-[#0e0a1c] border border-[rgba(139,92,246,0.14)] flex items-center justify-center text-[10px] text-zinc-400 font-mono select-none"
        >
          ⌘K
        </div>

        {/* GitHub Source Link */}
        <a
          href="https://github.com/YASHCHAUDHARI007/Stackoverhack"
          target="_blank"
          rel="noopener noreferrer"
          title="Stackoverhack GitHub Repository"
          aria-label="View on GitHub"
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:text-white hover:bg-[#151026] border border-transparent hover:border-violet-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>

        {/* Docs / Help */}
        <Link
          href="/settings"
          title="Documentation & Verification Help"
          aria-label="Documentation"
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:text-white hover:bg-[#151026] border border-transparent hover:border-violet-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
      </div>

      <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent mt-3 mb-2" />

      {/* Engine Status Pip */}
      <div className="text-[8px] font-mono uppercase text-zinc-400 tracking-wider text-center">
        LIVE
      </div>
    </aside>
  );
}
