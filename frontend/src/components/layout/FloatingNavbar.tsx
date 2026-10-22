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
  GitBranch,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingNavbarProps {
  onNewInvestigation?: () => void;
  selectedRepo?: string;
  onRepoChange?: (repo: string) => void;
}

const NAV_ITEMS = [
  {
    name: "TRIAGE",
    href: "/dashboard",
    badge: null,
  },
  {
    name: "INVESTIGATIONS",
    href: "/investigations",
    badge: "ACTIVE 4",
    badgeColor: "amber", // Similar to Techfest's EARLY BIRD gold pill
  },
  {
    name: "CATALOG",
    href: "/tests",
    badge: null,
  },
  {
    name: "ENGINE",
    href: "/settings",
    badge: null,
  },
];

export function FloatingNavbar({
  onNewInvestigation,
  selectedRepo = "ALL",
  onRepoChange,
}: FloatingNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 pointer-events-none px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* ============================================================ */}
        {/* 1. TOP LEFT: DISTINCTIVE WOBBLE WORDMARK & STYLIZED EMBLEM   */}
        {/* ============================================================ */}
        <div className="pointer-events-auto flex items-center">
          <Link
            href="/dashboard"
            className="group flex items-center space-x-3 px-3 py-2 rounded-xl bg-[#090713]/80 backdrop-blur-xl border border-[rgba(139,92,246,0.20)] shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:border-violet-500/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="WOBBLE Home"
          >
            {/* Stylized Sharp Futuristic Emblem */}
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0714] rounded-[7px] flex items-center justify-center overflow-hidden">
                <svg
                  className="w-4 h-4 text-violet-300 group-hover:scale-110 transition-transform duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4l6 16 4-10 6 10" />
                </svg>
                {/* Tech scanline accent */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Wordmark */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wider text-white group-hover:text-violet-200 transition-colors uppercase font-mono">
                WOBBLE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-950/60 text-violet-300 border border-violet-800/40">
                v3.4
              </span>
            </div>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* 2. CENTER: TECHFEST-STYLE CHAMFERED FLOATING NAVIGATION PILL */}
        {/* ============================================================ */}
        <nav
          aria-label="Primary Navigation"
          className="pointer-events-auto hidden md:flex items-center relative"
        >
          {/* Outer Chamfered Shell with Hairline Border and Atmospheric Glass */}
          <div className="relative flex items-center h-12 px-6 bg-[#0a0815]/90 backdrop-blur-xl border border-[rgba(139,92,246,0.22)] shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(139,92,246,0.12)] chamfer-nav-pill">
            {/* Tech Corner Decorative Brackets (Inspired by Techfest reference) */}
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-violet-400/40 font-mono text-[11px] select-none pointer-events-none"
              aria-hidden="true"
            >
              [
            </div>
            <div
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-violet-400/40 font-mono text-[11px] select-none pointer-events-none"
              aria-hidden="true"
            >
              ]
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-6 sm:space-x-8 px-2 font-mono text-xs">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center py-1 transition-all select-none tracking-widest text-[11px] font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400",
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-100"
                    )}
                  >
                    {/* Floating Gold/Amber Badge (Identical to Techfest's EARLY BIRD badge) */}
                    {item.badge && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-[3px] bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-[8px] font-bold tracking-normal uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">
                        {item.badge}
                      </span>
                    )}

                    <span>{item.name}</span>

                    {/* Active State Bottom Glow Bar */}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-400 to-violet-500 rounded-full shadow-[0_0_8px_#8b5cf6]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* ============================================================ */}
        {/* 3. TOP RIGHT: USER IDENTITY, SCOPE & NEW INVESTIGATION CTA   */}
        {/* ============================================================ */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          {/* Subtle Repository Scope Pill */}
          <div className="hidden lg:flex items-center space-x-2 bg-[#090713]/80 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[rgba(139,92,246,0.18)] text-xs font-mono shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <GitBranch className="w-3.5 h-3.5 text-violet-400" />
            <select
              aria-label="Repository Context Scope"
              value={selectedRepo}
              onChange={(e) => onRepoChange?.(e.target.value)}
              className="bg-transparent text-zinc-300 hover:text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#0b0817]">
                All Repos (5 Active)
              </option>
              <option value="mono-repo/api-core" className="bg-[#0b0817]">
                mono-repo/api-core
              </option>
              <option value="billing-engine" className="bg-[#0b0817]">
                billing-engine
              </option>
              <option value="auth-vault" className="bg-[#0b0817]">
                auth-vault
              </option>
              <option value="data-pipeline" className="bg-[#0b0817]">
                data-pipeline
              </option>
            </select>
          </div>

          {/* User Profile Pill (Inspired by Techfest's "YASH" button) */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#090713]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.22)] shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_8px_rgba(139,92,246,0.4)]">
              AM
            </div>
            <span className="text-xs font-mono font-medium text-zinc-200 hidden sm:inline">
              Alex Mercer
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          {/* New Investigation CTA */}
          {onNewInvestigation && (
            <button
              type="button"
              onClick={onNewInvestigation}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-medium font-mono shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Investigation</span>
              <span className="sm:hidden">New</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button (44x44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#090713]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.20)] text-zinc-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. RESPONSIVE MOBILE DRAWER                                   */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-3 max-w-7xl mx-auto p-4 rounded-2xl bg-[#090715]/95 backdrop-blur-2xl border border-[rgba(139,92,246,0.25)] shadow-[0_15px_50px_rgba(0,0,0,0.8)] space-y-2 font-mono">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider px-2 py-1 border-b border-[rgba(139,92,246,0.12)]">
            Navigation Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "text-white bg-violet-950/60 border border-violet-500/40"
                    : "text-zinc-300 hover:bg-[#141026]"
                )}
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[rgba(139,92,246,0.12)] flex items-center justify-between px-2 text-xs text-zinc-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>CI Health: 98.4%</span>
            </span>
            <span className="font-mono text-[10px] text-violet-400">Mock Adapter</span>
          </div>
        </div>
      )}
    </div>
  );
}
