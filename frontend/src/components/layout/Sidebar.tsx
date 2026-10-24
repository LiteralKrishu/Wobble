"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  Layers,
  Settings,
  GitBranch,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewInvestigation?: () => void;
  selectedRepo?: string;
  onRepoChange?: (repo: string) => void;
}

const NAV_ITEMS = [
  {
    name: "Triage & Overview",
    href: "/dashboard",
    icon: Activity,
    badge: "38 Flakes",
    badgeType: "warning",
  },
  {
    name: "Investigations",
    href: "/investigations",
    icon: Search,
    badge: "4 Active",
    badgeType: "violet",
  },
  {
    name: "Test Directory",
    href: "/tests",
    icon: Layers,
    badge: "8 Tests",
    badgeType: "neutral",
  },
  {
    name: "Settings & Engine",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0812] border-r border-[rgba(139,92,246,0.12)] flex flex-col justify-between transition-transform duration-250 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-14 px-4 flex items-center justify-between border-b border-[rgba(139,92,246,0.10)] bg-[#0d0a18]/60">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center space-x-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500/50 rounded"
            >
              {/* Electric Violet Brand Icon */}
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-600 to-indigo-700 p-0.5 shadow-[0_0_12px_rgba(139,92,246,0.35)] flex items-center justify-center">
                <div className="w-full h-full bg-[#0a0812] rounded-[4px] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-violet-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4l6 16 4-10 6 10" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-sm tracking-wider text-white">
                  WOBBLE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-950/60 text-violet-300 border border-violet-800/40">
                  v3.4
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              aria-label="Close navigation sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Repository Card */}
          <div className="p-3 border-b border-[rgba(139,92,246,0.08)] bg-[#0c0916]/40">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="uppercase tracking-wider font-mono text-[9px] text-zinc-400">
                Current Scope
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live CI
              </span>
            </div>
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-[#120f20] border border-[rgba(139,92,246,0.14)] text-xs font-mono text-zinc-200">
              <GitBranch className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate">mono-repo/api-core</span>
              <span className="text-[10px] text-zinc-400 font-sans ml-auto">
                main
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-2.5 py-4 space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Workbench
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group",
                    isActive
                      ? "text-white bg-gradient-to-r from-violet-900/40 to-transparent border border-violet-500/30 shadow-[inset_2px_0_0_#8b5cf6]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-violet-950/20 border border-transparent"
                  )}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-violet-400"
                          : "text-zinc-400 group-hover:text-zinc-300"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.2 rounded border",
                        item.badgeType === "warning" &&
                          "bg-amber-950/40 text-amber-400 border-amber-800/40",
                        item.badgeType === "violet" &&
                          "bg-violet-950/40 text-violet-300 border-violet-800/40",
                        item.badgeType === "neutral" &&
                          "bg-zinc-900/60 text-zinc-400 border-zinc-800"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Health & User Profile */}
        <div className="p-3 border-t border-[rgba(139,92,246,0.10)] bg-[#0d0a18]/60 space-y-3">
          {/* Health Mini Widget */}
          <div className="p-2.5 rounded-md bg-[#110e20] border border-[rgba(139,92,246,0.12)]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Suite Health
              </span>
              <span className="text-zinc-200 font-mono font-medium">98.4%</span>
            </div>
            {/* Health Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-[98.4%]" />
              <div className="bg-rose-500 h-full w-[1.6%]" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Adapter: Mock (Local)</span>
              <Link
                href="/settings"
                className="hover:text-violet-300 transition-colors flex items-center gap-0.5"
              >
                DRF <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* User Account Tile */}
          <div className="flex items-center space-x-2.5 px-2 py-1.5 rounded-md hover:bg-violet-950/20 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-[0_0_8px_rgba(139,92,246,0.3)]">
              AM
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-zinc-200 truncate">
                Alex Mercer
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                Staff Infrastructure
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
