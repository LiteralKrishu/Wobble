"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  CheckCircle2,
  Settings,
  Plus,
  Layers,
  Menu,
  X,
  Radio,
  Server,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingNavbarProps {
  onNewInvestigation?: () => void;
  selectedRepo?: string;
  onRepoChange?: (repo: string) => void;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Investigations", href: "/investigations", icon: Search },
  { name: "Flaky Tests", href: "/tests", icon: Layers },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function FloatingNavbar({
  onNewInvestigation,
  selectedRepo = "All Repositories",
  onRepoChange,
}: FloatingNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto">
      <nav
        aria-label="Main Navigation"
        className="glass-panel rounded-2xl px-4 py-2.5 sm:px-6 transition-all duration-300 border border-white/10 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between">
          {/* Logo & Product Brand */}
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg"
            >
              {/* Geometric SVG Emblem with Radar Pulse */}
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-violet-500/10 border border-cyan-400/30 flex items-center justify-center overflow-hidden group-hover:border-emerald-400/50 transition-colors">
                <span className="absolute inset-0 bg-emerald-400/10 animate-radar-ping rounded-lg pointer-events-none" />
                <svg
                  className="w-4 h-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M4 4l6 16 4-10 6 10" />
                </svg>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                    WOBBLE
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                    v3.4
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 tracking-tight hidden sm:inline">
                  Flaky Test Investigation Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-white/10">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer",
                      isActive
                        ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,245,150,0.25)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-400" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Live / Mock Adapter Mode Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-400">MODE:</span>
              <span className="text-cyan-300 font-medium">MOCK ADAPTER</span>
            </div>

            {/* New Investigation CTA */}
            {onNewInvestigation && (
              <button
                type="button"
                onClick={onNewInvestigation}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-semibold hover:from-emerald-400 hover:to-teal-300 transition-all duration-200 shadow-[0_0_20px_-3px_rgba(16,245,150,0.4)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">New Investigation</span>
                <span className="sm:hidden">New</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 flex items-center justify-between px-3 text-[11px] font-mono text-slate-400 border-t border-white/5 mt-2">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Adapter: Mock (DRF Ready)</span>
              </span>
              <span className="text-emerald-400">TELEMETRY OK</span>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
