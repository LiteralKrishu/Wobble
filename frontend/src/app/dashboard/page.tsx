"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { TriageWorklist } from "@/components/dashboard/TriageWorklist";
import { FlakinessTrendChart } from "@/components/dashboard/FlakinessTrendChart";
import { SeverityDistributionChart } from "@/components/dashboard/SeverityDistributionChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  RefreshCw,
  GitBranch,
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

  // Restrained GSAP entrance reveal for dashboard content
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
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }, dashboardRoot);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <AppShell>
      <div ref={dashboardRoot} className="space-y-6">
        {/* Top Control Bar & Repository Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(139,92,246,0.12)] gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Flaky Test Triage &amp; Empirical Intelligence
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automated reproduction, delta-debugging reduction, and stress-verification for CI/CD test suites
            </p>
          </div>

          {/* Repository Selector Dropdown & System Health */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-2 bg-[#0f0d18] px-2.5 py-1.5 rounded-md border border-[rgba(139,92,246,0.14)] text-xs font-mono">
              <GitBranch className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-zinc-400">Target:</span>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0f0d18]">
                  All Repositories (5 Active)
                </option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.name} className="bg-[#0f0d18]">
                    {repo.name} ({repo.healthScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-[#0f0d18] border border-emerald-900/40 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">CI Health: 98.4%</span>
            </div>
          </div>
        </div>

        {/* Compact, Purposeful Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="wobble-stagger-card">
            <MetricCard
              title="Total Test Suite"
              value={metrics?.totalScanned.toLocaleString() || "14,820"}
              delta={{ value: "+12.4%", isPositive: true, label: "scanned this sprint" }}
              icon={Search}
            />
          </div>
          <div className="wobble-stagger-card">
            <MetricCard
              title="Active Flaky Tests"
              value={metrics?.flakyCount || "38"}
              delta={{ value: "-4 flakes", isPositive: true, label: "resolved this week" }}
              icon={ShieldAlert}
            />
          </div>
          <div className="wobble-stagger-card">
            <MetricCard
              title="Active Investigations"
              value={metrics?.investigationsInProgress || "4"}
              delta={{ value: "2 in reproduction", isNeutral: true }}
              icon={RefreshCw}
            />
          </div>
          <div className="wobble-stagger-card">
            <MetricCard
              title="Empirically Verified Fixes"
              value={metrics?.verifiedFixes || "29"}
              delta={{ value: "+6 verified", isPositive: true, label: "100% clean passes" }}
              icon={CheckCircle2}
            />
          </div>
        </div>

        {/* Hero Section: The Triage Worklist */}
        <div className="wobble-stagger-card">
          <TriageWorklist investigations={investigations} />
        </div>

        {/* Secondary Analytical Grid: Historical Trend & Failure Taxonomy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 wobble-stagger-card">
          <div className="lg:col-span-2">
            <FlakinessTrendChart data={metrics?.trendData} />
          </div>
          <div>
            <SeverityDistributionChart data={metrics?.severityDistribution} />
          </div>
        </div>

        {/* Diagnostic Activity Feed */}
        <div className="wobble-stagger-card">
          <ActivityFeed events={telemetry} />
        </div>
      </div>
    </AppShell>
  );
}
