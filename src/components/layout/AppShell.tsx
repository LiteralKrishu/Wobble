"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { FloatingNavbar } from "@/components/layout/FloatingNavbar";
import { NewInvestigationModal } from "@/components/investigation/NewInvestigationModal";
import { Terminal, Shield, GitBranch, Cpu, Activity, ExternalLink } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isNewInvOpen, setIsNewInvOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-emerald-400/25 selection:text-white">
      {/* Cinematic Layered Background */}
      <BackgroundAtmosphere />

      {/* Fixed Floating Navigation */}
      <React.Suspense fallback={<div className="h-14" />}>
        <FloatingNavbar onNewInvestigation={() => setIsNewInvOpen(true)} />
      </React.Suspense>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Techfest-inspired Cinematic Technical Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">WOBBLE PLATFORM</span>
              <span className="text-slate-600">//</span>
              <span className="text-slate-400">DEV TELEMETRY CORE</span>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">
              Deterministic Reproduction &amp; Fix Verification
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>DRF Adapter: Ready</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seeds: PCG64-Active</span>
            </div>
            <Link
              href="/settings"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              Config
            </Link>
          </div>
        </div>
      </footer>

      {/* New Investigation Modal */}
      <NewInvestigationModal
        isOpen={isNewInvOpen}
        onClose={() => setIsNewInvOpen(false)}
      />
    </div>
  );
}
