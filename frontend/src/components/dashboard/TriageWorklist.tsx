"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Investigation } from "@/types";
import { cn } from "@/lib/utils";

interface TriageWorklistProps {
  investigations: Investigation[];
}

type FilterTab = "ALL" | "WORSENING" | "UNREPRODUCED" | "ACTIVE" | "VERIFIED";

export function TriageWorklist({ investigations }: TriageWorklistProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSeed, setCopiedSeed] = useState<string | null>(null);

  const handleCopySeed = (e: React.MouseEvent, seed: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(seed);
    setCopiedSeed(seed);
    setTimeout(() => setCopiedSeed(null), 2000);
  };

  const filtered = investigations.filter((inv) => {
    // Search query filter
    const matchesSearch =
      inv.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.testFile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.repository.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "WORSENING") return inv.failureRate >= 14;
    if (activeTab === "UNREPRODUCED") return inv.status === "INVESTIGATING" || inv.stage === "DETECT";
    if (activeTab === "ACTIVE") return inv.status !== "VERIFIED";
    if (activeTab === "VERIFIED") return inv.status === "VERIFIED";
    return true;
  });

  return (
    <div className="relative rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Decorative Technical Corner Accents */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-violet-400/40 select-none pointer-events-none" aria-hidden="true">
        +
      </div>
      <div className="absolute top-2 right-2 text-[9px] font-mono text-violet-400/40 select-none pointer-events-none" aria-hidden="true">
        +
      </div>

      {/* Header and Filter Bar */}
      <div className="p-4 sm:p-6 border-b border-[rgba(139,92,246,0.12)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
                [ TRIAGE QUEUE ]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/40">
                {filtered.length} Prioritized
              </span>
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight mt-1">
              Flaky Test Detection &amp; Empirical Worklist
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prioritized non-deterministic failures needing automated seed isolation, delta reduction, or empirical verification
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/investigations"
              className="px-3 py-1.5 rounded-xl bg-[#120e22] hover:bg-violet-900/30 text-violet-300 hover:text-white border border-violet-500/25 hover:border-violet-500/40 text-xs font-mono transition-all flex items-center space-x-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
            >
              <span>Full Investigation Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Filters & Quick Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-medium select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400",
                activeTab === "ALL"
                  ? "bg-violet-950/60 text-white border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#120e22] border border-transparent"
              )}
            >
              All Tests ({investigations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WORSENING")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-1.5 font-medium select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400",
                activeTab === "WORSENING"
                  ? "bg-rose-950/50 text-rose-300 border border-rose-800/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#120e22] border border-transparent"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span>Getting Worse ({investigations.filter((i) => i.failureRate >= 14).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ACTIVE")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-1.5 font-medium select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400",
                activeTab === "ACTIVE"
                  ? "bg-violet-950/60 text-white border border-violet-500/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#120e22] border border-transparent"
              )}
            >
              <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
              <span>Diagnosing ({investigations.filter((i) => i.status !== "VERIFIED").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("VERIFIED")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-1.5 font-medium select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400",
                activeTab === "VERIFIED"
                  ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#120e22] border border-transparent"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Clean ({investigations.filter((i) => i.status === "VERIFIED").length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Filter tests by name, file, or ID"
              placeholder="Filter by test, file, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0715] border border-[rgba(139,92,246,0.18)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-violet-500/60 font-mono transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[rgba(139,92,246,0.12)] bg-[#070510]/80 text-zinc-400 text-[11px] uppercase tracking-wider">
              <th className="py-3 px-5 font-medium">Test &amp; Repository Scope</th>
              <th className="py-3 px-4 font-medium text-center">Instability Rate</th>
              <th className="py-3 px-4 font-medium">Suspected Root Cause</th>
              <th className="py-3 px-4 font-medium text-center">Repro State</th>
              <th className="py-3 px-5 font-medium text-right">Workspace Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(139,92,246,0.08)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-zinc-400 font-mono text-xs">
                  No investigations match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-[#120e24] transition-colors group cursor-pointer"
                >
                  {/* Test & ID & Path */}
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-violet-400 font-bold tracking-tight">
                          {inv.id}
                        </span>
                        <Link
                          href={`/investigations/${inv.id}`}
                          className="font-sans font-medium text-zinc-200 group-hover:text-violet-300 transition-colors truncate max-w-sm sm:max-w-md"
                        >
                          {inv.testName}
                        </Link>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-1">
                        <span className="truncate max-w-xs">{inv.testFile}</span>
                        <span className="text-zinc-600">•</span>
                        <div className="flex items-center space-x-1 text-zinc-400">
                          <GitBranch className="w-3 h-3 text-zinc-400" />
                          <span>{inv.repository}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Failure Rate Badge & Trend */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-bold border",
                            inv.failureRate >= 15
                              ? "bg-rose-950/60 text-rose-300 border-rose-800/60 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                              : inv.failureRate >= 8
                              ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                              : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                          )}
                        >
                          {inv.failureRate.toFixed(1)}% Flaky
                        </span>
                        {inv.failureRate >= 15 && (
                          <span
                            title="Test failure frequency is worsening in CI"
                            className="text-rose-400 font-bold"
                          >
                            ↑
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1">
                        {inv.failedExecutions}/{inv.totalExecutions} failed runs
                      </span>
                    </div>
                  </td>

                  {/* Root Category */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-200 font-sans font-medium">
                        {inv.hypothesis ? inv.hypothesis.category : "Automated Diagnosis Pending"}
                      </span>
                      {inv.hypothesis && (
                        <div className="text-[10px] text-violet-300 font-mono mt-0.5 flex items-center space-x-1.5">
                          <Cpu className="w-3 h-3 text-violet-400" />
                          <span>{inv.hypothesis.confidence}% confidence</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Reproduction Status */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <StatusBadge status={inv.status} size="sm" />
                      {inv.minimization?.reproductionSeed && (
                        <button
                          type="button"
                          onClick={(e) =>
                            handleCopySeed(e, inv.minimization?.reproductionSeed || "")
                          }
                          title="Click to copy reproduction seed"
                          className="text-[10px] text-zinc-400 font-mono mt-1 hover:text-violet-300 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Seed: {inv.minimization.reproductionSeed.slice(0, 8)}...</span>
                          {copiedSeed === inv.minimization.reproductionSeed ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/investigations/${inv.id}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#140f26] hover:bg-violet-900/40 text-zinc-200 hover:text-white border border-[rgba(139,92,246,0.22)] hover:border-violet-500/50 text-xs font-mono font-medium transition-all shadow-[0_0_10px_rgba(0,0,0,0.3)] focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
