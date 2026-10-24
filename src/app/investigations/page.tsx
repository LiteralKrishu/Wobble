"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/services/api";
import { Investigation, FlakinessSeverity, InvestigationStatus, Repository } from "@/types";
import { cn, formatDuration, formatRelativeTime } from "@/lib/utils";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<FlakinessSeverity | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"startedAt" | "failureRate" | "totalExecutions">("startedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [invs, repos] = await Promise.all([
        api.getInvestigations(),
        api.getRepositories(),
      ]);
      setInvestigations(invs);
      setRepositories(repos);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Filter & Sort
  const filteredInvestigations = useMemo(() => {
    let result = [...investigations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.testName.toLowerCase().includes(q) ||
          i.testFile.toLowerCase().includes(q) ||
          i.repository.toLowerCase().includes(q) ||
          i.branch.toLowerCase().includes(q)
      );
    }

    if (selectedRepo !== "ALL") {
      result = result.filter((i) => i.repository === selectedRepo);
    }

    if (selectedStatus !== "ALL") {
      result = result.filter((i) => i.status === selectedStatus);
    }

    if (selectedSeverity !== "ALL") {
      result = result.filter((i) => i.severity === selectedSeverity);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "failureRate") {
        return sortOrder === "asc"
          ? a.failureRate - b.failureRate
          : b.failureRate - a.failureRate;
      }
      if (sortBy === "totalExecutions") {
        return sortOrder === "asc"
          ? a.totalExecutions - b.totalExecutions
          : b.totalExecutions - a.totalExecutions;
      }
      return sortOrder === "asc"
        ? new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        : new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

    return result;
  }, [
    investigations,
    searchQuery,
    selectedRepo,
    selectedStatus,
    selectedSeverity,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredInvestigations.length / pageSize) || 1;
  const paginatedList = filteredInvestigations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: "startedAt" | "failureRate" | "totalExecutions") => {
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Workspace Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Flaky Test Investigations Explorer
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Active diagnostic sessions, failure minimization results, and verified fixes
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300">
              Total Records: <strong className="text-white">{filteredInvestigations.length}</strong>
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <GlassPanel hasCorners className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by test, file, repo, branch, or investigation ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Repository Filter */}
            <div>
              <select
                value={selectedRepo}
                onChange={(e) => {
                  setSelectedRepo(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="REPRODUCED">REPRODUCED</option>
                <option value="MINIMIZED">MINIMIZED</option>
                <option value="DIAGNOSED">DIAGNOSED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="FAILED">FAILED</option>
                <option value="INCONCLUSIVE">INCONCLUSIVE</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs font-mono">
            <span className="text-slate-500 text-[11px] uppercase mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("ALL");
                setSelectedRepo("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg border transition-colors cursor-pointer",
                selectedStatus === "ALL" && selectedRepo === "ALL" && !searchQuery
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                  : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
              )}
            >
              All Investigations
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("VERIFIED");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg border transition-colors cursor-pointer",
                selectedStatus === "VERIFIED"
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                  : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
              )}
            >
              Verified Fixes Only
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("REPRODUCED");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg border transition-colors cursor-pointer",
                selectedStatus === "REPRODUCED"
                  ? "bg-violet-500/20 border-violet-400 text-violet-300 font-bold"
                  : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
              )}
            >
              In Reproduction
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("DIAGNOSED");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg border transition-colors cursor-pointer",
                selectedStatus === "DIAGNOSED"
                  ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold"
                  : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
              )}
            >
              Diagnosed Root Causes
            </button>
          </div>
        </GlassPanel>

        {/* Data Table */}
        <GlassPanel hasCorners className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-medium">Investigation / Test</th>
                  <th className="py-3 px-3 font-medium">Repository</th>
                  <th
                    className="py-3 px-3 font-medium text-center cursor-pointer hover:text-white"
                    onClick={() => toggleSort("failureRate")}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Failure Rate</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 font-medium text-center cursor-pointer hover:text-white"
                    onClick={() => toggleSort("totalExecutions")}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Executions</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 font-medium text-center">Stage</th>
                  <th className="py-3 px-3 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                      No investigations matching selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      {/* Test & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="text-cyan-300 font-bold group-hover:text-cyan-200">
                              {inv.id}
                            </span>
                            <span className="text-white font-sans font-semibold group-hover:text-cyan-100 truncate max-w-sm">
                              {inv.testName}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px] truncate max-w-md mt-0.5">
                            {inv.testFile}
                          </span>
                        </div>
                      </td>

                      {/* Repository */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-1.5 text-slate-300 text-xs">
                          <GitBranch className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{inv.repository}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {inv.branch}
                        </span>
                      </td>

                      {/* Flakiness Rate */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded font-bold ${
                            inv.failureRate > 20
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : inv.failureRate > 10
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {inv.failureRate.toFixed(1)}%
                        </span>
                      </td>

                      {/* Total Executions */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="text-slate-200 font-semibold">{inv.totalExecutions} runs</span>
                        <div className="text-[10px] text-slate-400">
                          ({inv.failedExecutions} failed)
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={inv.stage} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/investigations/${inv.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors border border-white/10 group-hover:border-cyan-400/40"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-slate-900/50 text-xs font-mono text-slate-400">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </AppShell>
  );
}
