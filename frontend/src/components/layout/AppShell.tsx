"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { NewInvestigationModal } from "@/components/investigation/NewInvestigationModal";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isNewInvOpen, setIsNewInvOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <SmoothScroll>
      <PageTransition>
        <div className="relative min-h-screen flex bg-[#08070d] text-white selection:bg-violet-600/30 selection:text-white">
          {/* Skip to Main Content Link for Keyboard & Screen Reader Users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white font-mono text-xs shadow-lg"
          >
            Skip to main content
          </a>

          {/* Atmospheric Midnight-Purple Background */}
          <BackgroundAtmosphere />

          {/* Compact Beautifully Proportioned Sidebar */}
          <Sidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            onNewInvestigation={() => setIsNewInvOpen(true)}
          />

          {/* Right Content Stream (Indented on Desktop for Sidebar) */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            {/* Restrained Top Navigation Bar */}
            <TopBar
              onToggleMobileSidebar={() =>
                setIsMobileSidebarOpen(!isMobileSidebarOpen)
              }
              onNewInvestigation={() => setIsNewInvOpen(true)}
            />

            {/* Main Application Content */}
            <main
              id="main-content"
              tabIndex={-1}
              className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto focus:outline-none"
            >
              {children}
            </main>

            {/* Refined Engineering Footer */}
            <footer className="relative z-10 border-t border-[rgba(139,92,246,0.10)] bg-[#0a0812]/80 backdrop-blur-sm py-4 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-zinc-300 tracking-wide">
                    WOBBLE
                  </span>
                  <span className="text-zinc-600">—</span>
                  <span>Flaky Test Empirical Verification Platform</span>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-zinc-400 font-mono">
                    Adapter: Mock (Local)
                  </span>
                  <span className="text-zinc-800">|</span>
                  <Link
                    href="/settings"
                    className="text-zinc-400 hover:text-violet-300 transition-colors"
                  >
                    Backend Settings
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

          {/* New Investigation Modal */}
          <NewInvestigationModal
            isOpen={isNewInvOpen}
            onClose={() => setIsNewInvOpen(false)}
          />
        </div>
      </PageTransition>
    </SmoothScroll>
  );
}
