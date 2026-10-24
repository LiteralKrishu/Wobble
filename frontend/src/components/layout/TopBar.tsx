"use client";

import React, { useState } from "react";
import {
  Menu,
  Plus,
  Search,
  Calendar,
  GitBranch,
  ChevronDown,
  Activity,
} from "lucide-react";

interface TopBarProps {
  onToggleMobileSidebar: () => void;
  onNewInvestigation?: () => void;
  selectedRepo?: string;
  onRepoChange?: (repo: string) => void;
}

export function TopBar({
  onToggleMobileSidebar,
  onNewInvestigation,
  selectedRepo = "ALL",
  onRepoChange,
}: TopBarProps) {
  const [timeRange, setTimeRange] = useState("7d");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#0a0812]/85 backdrop-blur-md border-b border-[rgba(139,92,246,0.12)]">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Project Context */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-violet-950/30 border border-[rgba(139,92,246,0.15)]"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Project & Scope Selector */}
          <div className="hidden sm:flex items-center space-x-2 bg-[#100d1c] px-2.5 py-1.5 rounded-md border border-[rgba(139,92,246,0.14)] text-xs">
            <GitBranch className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-400 font-mono text-[11px]">Scope:</span>
            <select
              value={selectedRepo}
              onChange={(e) => onRepoChange?.(e.target.value)}
              className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#0e0b1a]">
                All Repositories (5 Active)
              </option>
              <option value="mono-repo/api-core" className="bg-[#0e0b1a]">
                mono-repo/api-core (98%)
              </option>
              <option value="billing-engine" className="bg-[#0e0b1a]">
                billing-engine (96%)
              </option>
              <option value="auth-vault" className="bg-[#0e0b1a]">
                auth-vault (92%)
              </option>
              <option value="data-pipeline" className="bg-[#0e0b1a]">
                data-pipeline (94%)
              </option>
              <option value="checkout-svc" className="bg-[#0e0b1a]">
                checkout-svc (97%)
              </option>
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="hidden md:flex items-center space-x-1.5 bg-[#100d1c] px-2.5 py-1.5 rounded-md border border-[rgba(139,92,246,0.14)] text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="24h" className="bg-[#0e0b1a]">
                Last 24 Hours
              </option>
              <option value="7d" className="bg-[#0e0b1a]">
                Last 7 Days
              </option>
              <option value="30d" className="bg-[#0e0b1a]">
                Last 30 Days
              </option>
            </select>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tests, seeds, error hashes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#100d1c] border border-[rgba(139,92,246,0.14)] focus:border-violet-500/60 pl-8 pr-12 py-1.5 rounded-md text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800/80 rounded border border-zinc-700/60">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Operational Status & Action Button */}
        <div className="flex items-center space-x-3">
          {/* CI Health Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CI: Operational</span>
          </div>

          {/* New Investigation CTA */}
          {onNewInvestigation && (
            <button
              type="button"
              onClick={onNewInvestigation}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-medium shadow-[0_0_14px_rgba(139,92,246,0.35)] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Investigation</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
