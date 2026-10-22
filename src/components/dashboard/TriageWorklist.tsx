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
    <div className="rounded-lg bg-[#111317] border border-[#1e2229] overflow-hidden">
      {/* Header and Filter Bar */}
      <div className="p-4 border-b border-[#1e2229] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Flaky Test Triage Queue
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prioritized worklist of non-deterministic tests requiring reproduction, isolation, or verification
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/investigations"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center space-x-1"
            >
              <span>Full Investigation Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Filters & Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-[#181c23] text-zinc-100 border border-[#2a303c] font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
              }`}
            >
              All Tests ({investigations.length})
            </button>
            <button
              onClick={() => setActiveTab("CRITICAL")}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "CRITICAL"
                  ? "bg-red-950/40 text-red-300 border border-red-800/60 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>High Severity Flakes</span>
            </button>
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeTab === "ACTIVE"
                  ? "bg-[#181c23] text-zinc-100 border border-[#2a303c] font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
              }`}
            >
              In Progress ({investigations.filter((i) => i.status !== "VERIFIED").length})
            </button>
            <button
              onClick={() => setActiveTab("VERIFIED")}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "VERIFIED"
                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
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
              className="w-full bg-[#0c0d10] border border-[#1e2229] rounded pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[#1e2229] bg-[#0c0d10] text-zinc-400 text-[11px] tracking-wide">
              <th className="py-2.5 px-4 font-medium">Test &amp; Repository Context</th>
              <th className="py-2.5 px-3 font-medium text-center">Failure Rate</th>
              <th className="py-2.5 px-3 font-medium">Root Category</th>
              <th className="py-2.5 px-3 font-medium text-center">Reproduction State</th>
              <th className="py-2.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2229]">
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
                  className="hover:bg-[#151921] transition-colors group cursor-pointer"
                >
                  {/* Test & ID & Path */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-zinc-400 font-semibold">{inv.id}</span>
                        <Link
                          href={`/investigations/${inv.id}`}
                          className="font-sans font-medium text-zinc-200 group-hover:text-amber-400 transition-colors truncate max-w-md"
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
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          inv.failureRate >= 15
                            ? "bg-red-950/60 text-red-400 border border-red-800/70"
                            : inv.failureRate >= 8
                            ? "bg-amber-950/60 text-amber-400 border border-amber-800/70"
                            : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/70"
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
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
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
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#181c23] hover:bg-[#20252f] text-zinc-200 border border-[#2a303c] text-xs font-medium transition-colors"
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
