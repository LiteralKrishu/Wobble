"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  Settings,
  Plus,
  Layers,
  Menu,
  X,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingNavbarProps {
  onNewInvestigation?: () => void;
  selectedRepo?: string;
  onRepoChange?: (repo: string) => void;
}

const NAV_ITEMS = [
  { name: "Triage & Overview", href: "/dashboard", icon: Activity },
  { name: "Investigations", href: "/investigations", icon: Search },
  { name: "Test Directory", href: "/tests", icon: Layers },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function FloatingNavbar({
  onNewInvestigation,
}: FloatingNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#08070d]/90 backdrop-blur-md border-b border-[rgba(139,92,246,0.14)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Brand & Desktop Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500/50 rounded"
            >
              <div className="w-6 h-6 rounded bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M4 4l6 16 4-10 6 10" />
                </svg>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm tracking-tight text-zinc-100">
                  WOBBLE
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40">
                  v3.4
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[rgba(139,92,246,0.14)]">
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
                      "flex items-center space-x-2 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      isActive
                        ? "text-violet-200 bg-violet-950/40 border border-violet-500/30 font-semibold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-[#141122] border border-transparent"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Adapter Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Adapter:</span>
              <span className="text-zinc-300 font-medium">Mock (Local)</span>
            </div>

            {/* New Investigation CTA */}
            {onNewInvestigation && (
              <button
                type="button"
                onClick={onNewInvestigation}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Investigation</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 rounded text-zinc-400 hover:text-white hover:bg-[#141122] border border-[rgba(139,92,246,0.14)]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[rgba(139,92,246,0.14)] space-y-1">
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
                    "flex items-center space-x-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                    isActive
                      ? "text-zinc-100 bg-[#181c23] border border-[#2a303c]"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
