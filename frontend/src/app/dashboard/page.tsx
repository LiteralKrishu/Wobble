"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OperationalOverview } from "@/components/dashboard/OperationalOverview";
import { TriageWorklist } from "@/components/dashboard/TriageWorklist";
import { FlakinessTrendChart } from "@/components/dashboard/FlakinessTrendChart";
import { SeverityDistributionChart } from "@/components/dashboard/SeverityDistributionChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ExecutionVariance3D } from "@/components/3d/ExecutionVariance3D";
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  Activity,
  Layers,
  Radio,
  ExternalLink,
} from "lucide-react";
import { api, DashboardMetrics } from "@/services/api";
import { Investigation, Repository, TelemetryEvent } from "@/types";
import gsap from "gsap";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("ALL");
  const [show3DRadar, setShow3DRadar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dashboardRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [m, invs, repos, telem] = await Promise.all([
        api.getDashboardMetrics(),
        api.getInvestigations({ repository: selectedRepo }),
        api.getRepositories(),
        api.getTelemetryStream(),
      ]);
      setMetrics(m);
      setInvestigations(invs);
      setRepositories(repos);
      setTelemetry(telem);
      setIsLoading(false);
    }
    loadData();
  }, [selectedRepo]);

  // GSAP entrance reveal for dashboard content
  useEffect(() => {
    if (
      !dashboardRoot.current ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".wobble-stagger-card",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        }
      );
    }, dashboardRoot);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <AppShell
      selectedRepo={selectedRepo}
      onRepoChange={(repo) => setSelectedRepo(repo)}
    >
      <div ref={dashboardRoot} className="space-y-6">
        {/* ============================================================ */}
        {/* HERO TITLE & OPERATIONAL STATUS                              */}
        {/* ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-2 border-b border-[rgba(139,92,246,0.12)] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-violet-400 font-mono text-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#a78bfa]" />
              <span className="tracking-widest uppercase font-semibold text-[11px]">
                EMPIRICAL VERIFICATION PLATFORM
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400 font-sans">COCKPIT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Flaky Test Triage &amp; Empirical Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Automated reproduction seeds, delta-debugging test-order reduction, and synthetic race-condition stress verification.
            </p>
          </div>

          {/* Quick Engine Status Indicator */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0d091a] border border-emerald-500/30 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CI Health: 98.4%</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0d091a] border border-violet-500/25 text-violet-300">
              <Radio className="w-3.5 h-3.5 text-violet-400" />
              <span>Telemetry: Active</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. OPERATIONAL OVERVIEW TELEMETRY STRIP                       */}
        {/* ============================================================ */}
        <div className="wobble-stagger-card">
          <OperationalOverview
            metrics={metrics}
            selectedRepo={selectedRepo}
            onRepoChange={setSelectedRepo}
            repositories={repositories}
          />
        </div>

        {/* ============================================================ */}
        {/* 2. ASYMMETRICAL WORKSPACE: TRIAGE MATRIX & ANALYTICAL STACK   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT DOMINANT COLUMN (7 Cols / 58% on Large Screens) */}
          <div className="lg:col-span-7 space-y-6">
            {/* The Flaky Test Triage Queue (Core Workhorse) */}
            <div className="wobble-stagger-card">
              <TriageWorklist investigations={investigations} />
            </div>

            {/* Diagnostic Activity Feed (CI Event Stream) */}
            <div className="wobble-stagger-card">
              <ActivityFeed events={telemetry} />
            </div>
          </div>

          {/* RIGHT ANALYTICAL STACK (5 Cols / 42% on Large Screens) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Single Strong Trend Visualization */}
            <div className="wobble-stagger-card">
              <FlakinessTrendChart data={metrics?.trendData} />
            </div>

            {/* Failure Mechanism Taxonomy */}
            <div className="wobble-stagger-card">
              <SeverityDistributionChart data={metrics?.severityDistribution} />
            </div>

            {/* Interactive 3D Variance Radar Card (Signature Feature) */}
            <div className="wobble-stagger-card rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(139,92,246,0.12)]">
                <div>
                  <div className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-semibold">
                    [ 3D EXECUTION VARIANCE ]
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5">
                    Signal Instability Visualizer
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShow3DRadar(!show3DRadar)}
                  className="px-3 py-1 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 text-violet-200 border border-violet-500/40 text-xs font-mono font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
                >
                  {show3DRadar ? "Hide 3D Space" : "Engage 3D Radar"}
                </button>
              </div>

              {show3DRadar ? (
                <div className="mt-4 rounded-xl overflow-hidden border border-violet-500/30">
                  <ExecutionVariance3D
                    flakinessRate={24.5}
                    testName="TestAsyncConnectionPoolDrainUnderLoad"
                    className="h-[280px]"
                  />
                  <div className="p-3 bg-[#0a0715] text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Point cloud: Pass (Cyan) vs Fail (Rose)</span>
                    <span className="text-violet-400">WebGL Orbit</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-xl bg-[#0c0818]/90 border border-[rgba(139,92,246,0.12)] text-xs font-mono text-zinc-400 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-zinc-200 font-sans font-medium">
                      Empirical Non-Deterministic State Space
                    </p>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      100 simulated executions oscillating between pass/fail outcomes across synthetic race windows.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShow3DRadar(true)}
                    className="shrink-0 ml-3 px-3 py-2 rounded-xl bg-[#140f26] hover:bg-violet-900/30 text-violet-300 border border-violet-500/30 text-xs font-mono transition-all cursor-pointer"
                  >
                    Launch Radar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
