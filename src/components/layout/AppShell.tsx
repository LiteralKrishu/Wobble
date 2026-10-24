"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { FloatingNavbar } from "@/components/layout/FloatingNavbar";
import { NewInvestigationModal } from "@/components/investigation/NewInvestigationModal";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isNewInvOpen, setIsNewInvOpen] = useState(false);

  return (
    <SmoothScroll>
      <PageTransition>
        <div className="relative min-h-screen flex flex-col justify-between selection:bg-amber-500/25 selection:text-white bg-[#090a0c]">
          {/* Subtle Background Surface */}
          <BackgroundAtmosphere />

          {/* Fixed Engineering Navigation */}
          <React.Suspense fallback={<div className="h-13" />}>
            <FloatingNavbar onNewInvestigation={() => setIsNewInvOpen(true)} />
          </React.Suspense>

          {/* Main Content Workspace */}
          <main className="relative z-10 flex-1 pt-18 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          {/* Clean Functional Engineering Footer */}
          <footer className="relative z-10 border-t border-[#1e2229] bg-[#0c0d10] py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-zinc-300">WOBBLE</span>
                <span className="text-zinc-600">—</span>
                <span>Flaky Test Investigation &amp; Empirical Verification</span>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <span className="text-zinc-400 font-mono">Adapter: Mock (Local)</span>
                <span className="text-zinc-700">|</span>
                <Link
                  href="/settings"
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Backend Settings
                </Link>
                <Link
                  href="/tests"
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Test Directory
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
      </PageTransition>
    </SmoothScroll>
  );
}
