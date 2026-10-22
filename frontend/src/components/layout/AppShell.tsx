"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { FloatingNavbar } from "@/components/layout/FloatingNavbar";
import { NavigationRail } from "@/components/layout/NavigationRail";
import { TelemetryRail } from "@/components/layout/TelemetryRail";
import { NewInvestigationModal } from "@/components/investigation/NewInvestigationModal";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";

interface AppShellProps {
  children: React.ReactNode;
  selectedRepo?: string;
  onRepoChange?: (repo: string) => void;
}

export function AppShell({
  children,
  selectedRepo = "ALL",
  onRepoChange,
}: AppShellProps) {
  const [isNewInvOpen, setIsNewInvOpen] = useState(false);

  return (
    <SmoothScroll>
      <PageTransition>
        <div className="relative min-h-screen flex flex-col bg-[#06050b] text-white selection:bg-violet-600/35 selection:text-white">
          {/* Skip to Main Content Link for Keyboard & Screen Reader Users (WCAG 2.4.1) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white font-mono text-xs shadow-lg"
          >
            Skip to main content
          </a>

          {/* 1. Cinematic Atmospheric Background with Instability Waveforms */}
          <BackgroundAtmosphere />

          {/* 2. Top Chamfered Floating Navbar (Techfest-Inspired) */}
          <FloatingNavbar
            onNewInvestigation={() => setIsNewInvOpen(true)}
            selectedRepo={selectedRepo}
            onRepoChange={onRepoChange}
          />

          {/* 3. Left Slim Vertical Navigation Rail (Techfest-Inspired Left Dock) */}
          <NavigationRail
            onNewInvestigation={() => setIsNewInvOpen(true)}
          />

          {/* 4. Right Telemetry & CI Status Rail (Techfest-Inspired Right Dock) */}
          <TelemetryRail />

          {/* 5. Main Application Content Area */}
          <div className="relative z-10 flex-1 flex flex-col min-w-0 w-full pt-24 sm:pt-28 pb-16">
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:pl-24 md:pr-16 lg:pr-20 focus:outline-none"
            >
              {children}
            </main>

            {/* 6. Refined Atmospheric Engineering Footer */}
            <footer className="mt-16 border-t border-[rgba(139,92,246,0.12)] bg-[#07050f]/80 backdrop-blur-md py-6 px-4 sm:px-6 md:pl-24 md:pr-16 lg:pr-20">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-zinc-200 tracking-wider">
                    WOBBLE
                  </span>
                  <span className="text-zinc-600">—</span>
                  <span className="text-zinc-400 font-sans">
                    Flaky Test Empirical Verification &amp; Delta-Debugging Platform
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-zinc-400">
                    Engine: <span className="text-violet-300">DRF / Mock Adapter</span>
                  </span>
                  <span className="text-zinc-800">|</span>
                  <Link
                    href="/settings"
                    className="text-zinc-400 hover:text-violet-300 transition-colors"
                  >
                    Backend Config
                  </Link>
                  <Link
                    href="/tests"
                    className="text-zinc-400 hover:text-violet-300 transition-colors"
                  >
                    Test Directory
                  </Link>
                </div>
              </div>
            </footer>
          </div>

          {/* 7. New Investigation Modal */}
          <NewInvestigationModal
            isOpen={isNewInvOpen}
            onClose={() => setIsNewInvOpen(false)}
          />
        </div>
      </PageTransition>
    </SmoothScroll>
  );
}
