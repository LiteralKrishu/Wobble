"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Search,
  ArrowRight,
  GitBranch,
  Play,
  FileCode,
} from "lucide-react";
import { api } from "@/services/api";
import { FlakyTestSummary, Repository } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

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

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,92,246,0.12)] gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Flaky Test Directory &amp; Confidence Registry
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Empirical registry of non-deterministic tests with 95% binomial confidence intervals
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] text-zinc-300">
              Active Signatures: <strong className="text-violet-400 font-semibold">{filteredTests.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-3.5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            <div className="relative md:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by test identifier, file path, or suspected cause..."
                className="w-full pl-8 pr-3 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] text-xs font-mono text-zinc-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
              >
                <option value="ALL">All Repositories</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.name} className="bg-[#0f0d18]">
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={minRate}
                onChange={(e) => setMinRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] text-xs font-mono text-zinc-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
              >
                <option value={0} className="bg-[#0f0d18]">Any Flakiness Rate</option>
                <option value={10} className="bg-[#0f0d18]">Min 10% Flakiness</option>
                <option value={15} className="bg-[#0f0d18]">Min 15% Flakiness (High)</option>
                <option value={20} className="bg-[#0f0d18]">Min 20% Flakiness (Critical)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="space-y-3">
          {filteredTests.map((t) => (
            <div
              key={t.id}
              className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 hover:border-[rgba(139,92,246,0.35)] transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-zinc-300 px-2 py-0.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)]">
                      {t.id}
                    </span>
                    <StatusBadge status={t.investigationStatus} size="sm" />
                    <span className="text-xs font-mono text-zinc-500">
                      Last failure: {formatRelativeTime(t.lastObservedFailure)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-zinc-100 hover:text-violet-300 transition-colors font-mono">
                    {t.name}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                    <FileCode className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="text-zinc-300">{t.file}</span>
                    <span className="text-zinc-600">•</span>
                    <span>{t.repository}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">{t.branch}</span>
                  </div>

                  {/* Suspected Cause */}
                  <div className="pt-1.5 text-xs text-zinc-300 flex items-start space-x-1.5 font-sans">
                    <span className="font-semibold text-amber-400 text-xs">Identified Cause:</span>
                    <span className="text-zinc-300">{t.suspectedCause}</span>
                  </div>
                </div>

                {/* Quantitative Measurement & CI Interval */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-[rgba(139,92,246,0.12)] pt-3 lg:pt-0 lg:pl-5 shrink-0 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
                      Flakiness Rate
                    </span>
                    <div className="text-base font-semibold text-amber-400 mt-0.5">
                      {t.flakinessRate.toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      95% CI: [{t.confidenceInterval[0]}% - {t.confidenceInterval[1]}%]
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
                      Observed Runs
                    </span>
                    <div className="text-sm font-semibold text-zinc-200 mt-0.5">
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
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-violet-950/40 hover:bg-violet-900/40 text-violet-200 border border-violet-500/30 transition-all font-mono text-xs font-medium"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
                      </Link>
                    ) : (
                      <Link
                        href="/investigations"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#141122] hover:bg-[#1c172e] text-zinc-300 border border-[rgba(139,92,246,0.16)] transition-all font-mono text-xs"
                      >
                        <span>Investigate</span>
                        <Play className="w-3 h-3 fill-current text-zinc-400" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
