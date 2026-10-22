"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Search,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Investigation } from "@/types";

interface TriageWorklistProps {
  investigations: Investigation[];
}

type FilterTab = "ALL" | "CRITICAL" | "UNREPRODUCED" | "ACTIVE" | "VERIFIED";

export function TriageWorklist({ investigations }: TriageWorklistProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = investigations.filter((inv) => {
    // Search query filter
    const matchesSearch =
      inv.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.testFile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.repository.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "CRITICAL") return inv.failureRate >= 15;
    if (activeTab === "UNREPRODUCED") return inv.status === "INVESTIGATING" || inv.stage === "DETECT";
    if (activeTab === "ACTIVE") return inv.status !== "VERIFIED";
    if (activeTab === "VERIFIED") return inv.status === "VERIFIED";
    return true;
  });

  return (
    <div className="rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Header and Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-[rgba(139,92,246,0.10)] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Flaky Test Triage Queue</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/40">
                {filtered.length} prioritized
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prioritized worklist of non-deterministic tests requiring reproduction, isolation, or empirical verification
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/investigations"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center space-x-1"
            >
              <span>Full Investigation Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Filters & Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-[#181328] text-white border border-violet-500/40 font-medium shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-violet-950/20 border border-transparent"
              }`}
            >
              All Tests ({investigations.length})
            </button>
            <button
              onClick={() => setActiveTab("CRITICAL")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "CRITICAL"
                  ? "bg-rose-950/40 text-rose-300 border border-rose-800/60 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-violet-950/20 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>High Severity Flakes</span>
            </button>
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                activeTab === "ACTIVE"
                  ? "bg-[#181328] text-white border border-violet-500/40 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-violet-950/20 border border-transparent"
              }`}
            >
              In Progress ({investigations.filter((i) => i.status !== "VERIFIED").length})
            </button>
            <button
              onClick={() => setActiveTab("VERIFIED")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "VERIFIED"
                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-violet-950/20 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Verified Fixes ({investigations.filter((i) => i.status === "VERIFIED").length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by test, file, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c0a14] border border-[rgba(139,92,246,0.14)] rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-violet-500/60 font-mono transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[rgba(139,92,246,0.10)] bg-[#0c0a14]/80 text-zinc-400 text-[11px] tracking-wide">
              <th className="py-2.5 px-4 font-medium">Test &amp; Repository Context</th>
              <th className="py-2.5 px-3 font-medium text-center">Failure Rate</th>
              <th className="py-2.5 px-3 font-medium">Root Category</th>
              <th className="py-2.5 px-3 font-medium text-center">Reproduction State</th>
              <th className="py-2.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(139,92,246,0.08)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                  No investigations match the selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-[#151126] transition-colors group cursor-pointer"
                >
                  {/* Test & ID & Path */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-violet-400 font-semibold">{inv.id}</span>
                        <Link
                          href={`/investigations/${inv.id}`}
                          className="font-sans font-medium text-zinc-200 group-hover:text-violet-300 transition-colors truncate max-w-md"
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

                  {/* Failure Rate Badge */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          inv.failureRate >= 15
                            ? "bg-rose-950/50 text-rose-300 border border-rose-800/60"
                            : inv.failureRate >= 8
                            ? "bg-amber-950/50 text-amber-300 border border-amber-800/60"
                            : "bg-emerald-950/50 text-emerald-300 border border-emerald-800/60"
                        }`}
                      >
                        {inv.failureRate.toFixed(1)}% Flaky
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">
                        {inv.failedExecutions}/{inv.totalExecutions} failed
                      </span>
                    </div>
                  </td>

                  {/* Root Category */}
                  <td className="py-3 px-3">
                    <span className="text-xs text-zinc-300 font-sans">
                      {inv.hypothesis ? inv.hypothesis.category : "Under Diagnosis"}
                    </span>
                    {inv.hypothesis && (
                      <div className="text-[10px] text-violet-400 font-mono mt-0.5">
                        {inv.hypothesis.confidence}% confidence
                      </div>
                    )}
                  </td>

                  {/* Reproduction Status */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <StatusBadge status={inv.status} size="sm" />
                      {inv.minimization?.reproductionSeed && (
                        <span className="text-[10px] text-zinc-400 font-mono mt-1">
                          Seed: {inv.minimization.reproductionSeed}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/investigations/${inv.id}`}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#161226] hover:bg-violet-900/30 text-zinc-200 hover:text-white border border-[rgba(139,92,246,0.18)] hover:border-violet-500/40 text-xs font-medium transition-all"
                    >
                      <span>Workspace</span>
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
