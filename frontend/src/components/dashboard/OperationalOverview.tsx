"use client";

import React from "react";
import {
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Activity,
  GitBranch,
  ArrowUpRight,
  TrendingDown,
  Layers,
} from "lucide-react";
import { DashboardMetrics } from "@/services/api";

interface OperationalOverviewProps {
  metrics: DashboardMetrics | null;
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
  repositories: Array<{ id: string; name: string; healthScore: number }>;
}

export function OperationalOverview({
  metrics,
  selectedRepo,
  onRepoChange,
  repositories,
}: OperationalOverviewProps) {
  const flakyCount = metrics?.flakyCount ?? 38;
  const verifiedCount = metrics?.verifiedFixes ?? 29;
  const inProgress = metrics?.investigationsInProgress ?? 4;
  const totalScanned = metrics?.totalScanned ?? 14820;

  return (
    <div className="relative rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Background Subtle Gradient Lighting */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
        }}
      />

      {/* Header Bar with Scope and Operational Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(139,92,246,0.12)] gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_10px_#a78bfa]" />
          <div>
            <h2 className="text-xs font-mono font-semibold tracking-wider text-zinc-300 uppercase">
              Operational Signal &amp; Empirical Status
            </h2>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Real-time telemetry across distributed test pipelines and execution environments
            </p>
          </div>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0f0b1e] border border-[rgba(139,92,246,0.18)]">
            <GitBranch className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-400 text-[11px]">Scope:</span>
            <select
              aria-label="Repository filter scope"
              value={selectedRepo}
              onChange={(e) => onRepoChange(e.target.value)}
              className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#0e0a1b]">
                All Repositories ({repositories.length || 5})
              </option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.name} className="bg-[#0e0a1b]">
                  {repo.name} ({repo.healthScore}%)
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0f0b1e] border border-emerald-500/25 text-emerald-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>98.4% Suite Passing</span>
          </div>
        </div>
      </div>

      {/* Main Asymmetrical Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
        {/* 1. Primary Hero Telemetry: Active Flakes & Instability */}
        <div className="lg:col-span-1 rounded-xl bg-[#0e0a1d]/80 border border-[rgba(139,92,246,0.22)] p-4 flex flex-col justify-between hover:border-violet-500/40 transition-colors group">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Flaky Test Count</span>
            </span>
            <span className="text-rose-400 font-semibold px-1.5 py-0.2 rounded bg-rose-950/40 border border-rose-800/40 text-[10px]">
              CRITICAL
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
              <span>{flakyCount}</span>
              <span className="text-xs font-normal text-zinc-400">
                / {totalScanned.toLocaleString()} scanned
              </span>
            </div>
            {/* Visual Severity Breakdown Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden flex mt-2.5">
              <div
                className="h-full bg-rose-500"
                style={{ width: "32%" }}
                title="12 High Severity"
              />
              <div
                className="h-full bg-amber-500"
                style={{ width: "50%" }}
                title="19 Moderate"
              />
              <div
                className="h-full bg-violet-400"
                style={{ width: "18%" }}
                title="7 Low"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[rgba(139,92,246,0.10)] font-mono">
            <span className="flex items-center space-x-1 text-emerald-400">
              <TrendingDown className="w-3 h-3" />
              <span>-4 flakes this sprint</span>
            </span>
            <span>Peak: 24.5%</span>
          </div>
        </div>

        {/* 2. Empirical Verification Assurance */}
        <div className="lg:col-span-1 rounded-xl bg-[#0e0a1d]/80 border border-[rgba(139,92,246,0.22)] p-4 flex flex-col justify-between hover:border-violet-500/40 transition-colors group">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Empirically Verified</span>
            </span>
            <span className="text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40 text-[10px]">
              100/100 PASS
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
              <span>{verifiedCount}</span>
              <span className="text-xs font-normal text-emerald-400">
                (76.3% fix rate)
              </span>
            </div>
            {/* Progress Meter */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden mt-2.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: "76%" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[rgba(139,92,246,0.10)] font-mono">
            <span className="text-zinc-300">Mean MTTF: 14.2 days</span>
            <span className="text-emerald-400 font-medium">99.8% Confidence</span>
          </div>
        </div>

        {/* 3. In-Flight Diagnostic Pipeline */}
        <div className="lg:col-span-1 rounded-xl bg-[#0e0a1d]/80 border border-[rgba(139,92,246,0.22)] p-4 flex flex-col justify-between hover:border-violet-500/40 transition-colors group">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              <span>Active Repro Pipeline</span>
            </span>
            <span className="text-violet-300 font-semibold px-1.5 py-0.2 rounded bg-violet-950/40 border border-violet-800/40 text-[10px]">
              DIAGNOSING
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
              <span>{inProgress}</span>
              <span className="text-xs font-normal text-violet-300">
                investigations live
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
              <span className="text-violet-400">2 Delta-Debug</span>
              <span>•</span>
              <span className="text-indigo-400">1 Patch Synth</span>
              <span>•</span>
              <span className="text-amber-400">1 Repro</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[rgba(139,92,246,0.10)] font-mono">
            <span>Mean MTTR: 18m</span>
            <span className="text-violet-400">100% Seed Isolated</span>
          </div>
        </div>

        {/* 4. CI Engine Telemetry & Suite Health */}
        <div className="lg:col-span-1 rounded-xl bg-[#0e0a1d]/80 border border-[rgba(139,92,246,0.22)] p-4 flex flex-col justify-between hover:border-violet-500/40 transition-colors group">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Test Suite Coverage</span>
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">
              LOCAL MOCK
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
              <span>14.8k</span>
              <span className="text-xs font-normal text-zinc-400">
                test executions
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">
              Deterministic Rate: <span className="text-emerald-400 font-medium">99.74%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[rgba(139,92,246,0.10)] font-mono">
            <span className="text-zinc-400">CI Latency: &lt;14ms</span>
            <span className="text-emerald-400">Engine Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
