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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0d10]/95 backdrop-blur-sm border-b border-[#1e2229]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Brand & Desktop Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded"
            >
              <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
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
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  v3.4
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#1e2229]">
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
                        ? "text-zinc-100 bg-[#181c23] border border-[#2a303c]"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
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
            <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Adapter:</span>
              <span className="text-zinc-300 font-medium">Mock (Local)</span>
            </div>

            {/* New Investigation CTA */}
            {onNewInvestigation && (
              <button
                type="button"
                onClick={onNewInvestigation}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Investigation</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#1e2229] space-y-1">
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
