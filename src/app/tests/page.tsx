"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  GitBranch,
  ShieldAlert,
  Clock,
  Sparkles,
  Play,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { api } from "@/services/api";
import { FlakyTestSummary, Repository } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function FlakyTestsPage() {
  const [tests, setTests] = useState<FlakyTestSummary[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("ALL");
  const [minRate, setMinRate] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"flakinessRate" | "executionCount" | "failureCount">("flakinessRate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [t, repos] = await Promise.all([
        api.getFlakyTests(),
        api.getRepositories(),
      ]);
      setTests(t);
      setRepositories(repos);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredTests = useMemo(() => {
    let result = [...tests];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.file.toLowerCase().includes(q) ||
          t.repository.toLowerCase().includes(q) ||
          t.suspectedCause.toLowerCase().includes(q)
      );
    }

    if (selectedRepo !== "ALL") {
      result = result.filter((t) => t.repository === selectedRepo);
    }

    if (minRate > 0) {
      result = result.filter((t) => t.flakinessRate >= minRate);
    }

    result.sort((a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];
      return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
    });

    return result;
  }, [tests, searchQuery, selectedRepo, minRate, sortBy, sortOrder]);

  const toggleSort = (field: "flakinessRate" | "executionCount" | "failureCount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>CI Telemetry Scan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Flaky Test Inventory
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Systematic catalog of non-deterministic tests with 95% confidence intervals
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300">
              Active Signatures: <strong className="text-cyan-300">{filteredTests.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <GlassPanel hasCorners className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flaky tests by identifier, file path, or suspected cause..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
              />
            </div>

            <div>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
              >
                <option value="ALL">All Repositories</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.name}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={minRate}
                onChange={(e) => setMinRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
              >
                <option value={0}>Any Flakiness Rate</option>
                <option value={10}>Min 10% Flakiness</option>
                <option value={15}>Min 15% Flakiness (High)</option>
                <option value={20}>Min 20% Flakiness (Critical)</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* Inventory Cards / Table */}
        <div className="space-y-4">
          {filteredTests.map((t) => (
            <GlassPanel
              key={t.id}
              hasCorners
              className="p-5 hover:border-cyan-500/30 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-white/10">
                      {t.id}
                    </span>
                    <StatusBadge status={t.investigationStatus} size="sm" />
                    <span className="text-xs font-mono text-slate-500">
                      Last failure: {formatRelativeTime(t.lastObservedFailure)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-sans text-white hover:text-cyan-300 transition-colors">
                    {t.name}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <span>{t.file}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-cyan-400/80">{t.repository}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span>{t.branch}</span>
                  </div>

                  {/* Suspected Cause */}
                  <div className="pt-2 text-xs font-mono text-slate-300 flex items-start space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-violet-300">Suspected Cause:</strong>{" "}
                      {t.suspectedCause}
                    </span>
                  </div>
                </div>

                {/* Quantitative Measurement & CI Interval */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-6 shrink-0 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">
                      Flakiness Rate
                    </span>
                    <div className="text-lg font-bold text-amber-400 mt-0.5">
                      {t.flakinessRate.toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      95% CI: [{t.confidenceInterval[0]}% - {t.confidenceInterval[1]}%]
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">
                      Observed Runs
                    </span>
                    <div className="text-base font-bold text-slate-200 mt-0.5">
                      {t.executionCount}
                    </div>
                    <span className="text-[10px] text-rose-400 block">
                      {t.failureCount} Failures
                    </span>
                  </div>

                  {/* Action CTA */}
                  <div className="shrink-0">
                    {t.activeInvestigationId ? (
                      <Link
                        href={`/investigations/${t.activeInvestigationId}`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all font-mono text-xs font-bold shadow-[0_0_15px_-3px_rgba(0,229,255,0.25)]"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/investigations"
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors font-mono text-xs"
                      >
                        <span>Investigate</span>
                        <Play className="w-3 h-3 fill-current" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
