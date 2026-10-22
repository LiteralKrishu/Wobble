"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Search,
  ArrowUpDown,
  ArrowRight,
  GitBranch,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/services/api";
import { Investigation, FlakinessSeverity, Repository } from "@/types";
import { cn } from "@/lib/utils";

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
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,92,246,0.12)] gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Flaky Test Investigations Explorer
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Diagnostic workspace sessions, delta-debugging reduction logs, and empirical stress passes
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] text-zinc-300">
              Total Records: <strong className="text-violet-400 font-semibold">{filteredInvestigations.length}</strong>
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-3.5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                aria-label="Search investigations by test name, file path, repository, or ID"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by test, file, repository, or ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-400"
              />
            </div>

            {/* Repository Filter */}
            <div>
              <select
                aria-label="Filter investigations by repository"
                value={selectedRepo}
                onChange={(e) => {
                  setSelectedRepo(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Status Filter */}
            <div>
              <select
                aria-label="Filter investigations by diagnostic status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] text-xs font-mono text-zinc-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
              >
                <option value="ALL" className="bg-[#0f0d18]">All Statuses</option>
                <option value="INVESTIGATING" className="bg-[#0f0d18]">INVESTIGATING</option>
                <option value="REPRODUCED" className="bg-[#0f0d18]">REPRODUCED</option>
                <option value="MINIMIZED" className="bg-[#0f0d18]">MINIMIZED</option>
                <option value="DIAGNOSED" className="bg-[#0f0d18]">DIAGNOSED</option>
                <option value="VERIFIED" className="bg-[#0f0d18]">VERIFIED</option>
                <option value="FAILED" className="bg-[#0f0d18]">FAILED</option>
                <option value="INCONCLUSIVE" className="bg-[#0f0d18]">INCONCLUSIVE</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div role="group" aria-label="Investigation status quick filters" className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[rgba(139,92,246,0.12)] text-xs font-mono">
            <span className="text-zinc-400 text-[11px] mr-1">Filter:</span>
            <button
              type="button"
              aria-pressed={selectedStatus === "ALL" && selectedRepo === "ALL" && !searchQuery}
              onClick={() => {
                setSelectedStatus("ALL");
                setSelectedRepo("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400",
                selectedStatus === "ALL" && selectedRepo === "ALL" && !searchQuery
                  ? "bg-violet-950/40 border-violet-500/40 text-violet-200 font-semibold"
                  : "bg-[#090812] border-[rgba(139,92,246,0.12)] text-zinc-400 hover:text-zinc-200"
              )}
            >
              All
            </button>
            <button
              type="button"
              aria-pressed={selectedStatus === "VERIFIED"}
              onClick={() => {
                setSelectedStatus("VERIFIED");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400",
                selectedStatus === "VERIFIED"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold"
                  : "bg-[#090812] border-[rgba(139,92,246,0.12)] text-zinc-400 hover:text-zinc-200"
              )}
            >
              Verified Fixes
            </button>
            <button
              type="button"
              aria-pressed={selectedStatus === "REPRODUCED"}
              onClick={() => {
                setSelectedStatus("REPRODUCED");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400",
                selectedStatus === "REPRODUCED"
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-300 font-semibold"
                  : "bg-[#090812] border-[rgba(139,92,246,0.12)] text-zinc-400 hover:text-zinc-200"
              )}
            >
              In Reproduction
            </button>
            <button
              type="button"
              aria-pressed={selectedStatus === "DIAGNOSED"}
              onClick={() => {
                setSelectedStatus("DIAGNOSED");
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400",
                selectedStatus === "DIAGNOSED"
                  ? "bg-violet-950/50 border-violet-500/40 text-violet-300 font-semibold"
                  : "bg-[#090812] border-[rgba(139,92,246,0.12)] text-zinc-400 hover:text-zinc-200"
              )}
            >
              Diagnosed
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] overflow-hidden">
          <div className="overflow-x-auto">
            <table aria-label="Investigations directory table" className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[rgba(139,92,246,0.12)] bg-[#090812] text-zinc-400 text-[11px] tracking-wide">
                  <th scope="col" className="py-2.5 px-4 font-medium">Investigation / Test</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Repository</th>
                  <th
                    scope="col"
                    className="py-2.5 px-3 font-medium text-center cursor-pointer hover:text-zinc-200"
                    onClick={() => toggleSort("failureRate")}
                  >
                    <button
                      type="button"
                      aria-label="Sort by failure rate"
                      className="flex items-center justify-center space-x-1 w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 rounded cursor-pointer"
                    >
                      <span>Failure Rate</span>
                      <ArrowUpDown className="w-3 h-3 text-violet-400" />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="py-2.5 px-3 font-medium text-center cursor-pointer hover:text-zinc-200"
                    onClick={() => toggleSort("totalExecutions")}
                  >
                    <button
                      type="button"
                      aria-label="Sort by total executions"
                      className="flex items-center justify-center space-x-1 w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 rounded cursor-pointer"
                    >
                      <span>Executions</span>
                      <ArrowUpDown className="w-3 h-3 text-violet-400" />
                    </button>
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-medium text-center">Stage</th>
                  <th scope="col" className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th scope="col" className="py-2.5 px-4 font-medium text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(139,92,246,0.10)]">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-400 font-mono">
                      No investigations matching selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#141122] transition-colors group cursor-pointer"
                    >
                      {/* Test & ID */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="text-violet-400 font-semibold">
                              {inv.id}
                            </span>
                            <span className="text-zinc-200 font-sans font-medium group-hover:text-violet-300 truncate max-w-sm">
                              {inv.testName}
                            </span>
                          </div>
                          <span className="text-zinc-400 text-[11px] truncate max-w-md mt-0.5">
                            {inv.testFile}
                          </span>
                        </div>
                      </td>

                      {/* Repository */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5 text-zinc-300 text-xs">
                          <GitBranch className="w-3 h-3 text-violet-400 shrink-0" />
                          <span>{inv.repository}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {inv.branch}
                        </span>
                      </td>

                      {/* Flakiness Rate */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-semibold text-xs ${
                            inv.failureRate > 15
                              ? "bg-rose-950/50 text-rose-300 border border-rose-500/30"
                              : inv.failureRate > 8
                              ? "bg-amber-950/50 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {inv.failureRate.toFixed(1)}%
                        </span>
                      </td>

                      {/* Total Executions */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-zinc-200">{inv.totalExecutions} runs</span>
                        <div className="text-[10px] text-zinc-400">
                          ({inv.failedExecutions} failed)
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={inv.stage} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/investigations/${inv.id}`}
                          aria-label={`Open investigation ${inv.id} for ${inv.testName}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#141122] text-zinc-200 hover:text-white hover:bg-violet-950/40 transition-colors border border-[rgba(139,92,246,0.16)] group-hover:border-violet-500/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
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
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[rgba(139,92,246,0.12)] bg-[#090812] text-xs font-mono text-zinc-400">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded border border-[rgba(139,92,246,0.14)] hover:bg-[#141122] disabled:opacity-30 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded border border-[rgba(139,92,246,0.14)] hover:bg-[#141122] disabled:opacity-30 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
