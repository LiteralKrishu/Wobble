"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { FlakinessTrendChart } from "@/components/dashboard/FlakinessTrendChart";
import { SeverityDistributionChart } from "@/components/dashboard/SeverityDistributionChart";
import { RecentInvestigationsTable } from "@/components/dashboard/RecentInvestigationsTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Activity,
  Layers,
  GitBranch,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { api, DashboardMetrics } from "@/services/api";
import { Investigation, Repository, TelemetryEvent } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Control Bar & Project Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Project Observability Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Flaky Test Intelligence Engine
            </h1>
          </div>

          {/* Repository Selector Dropdown & Health score */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Target:</span>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">
                  All Repositories (5 Active)
                </option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.name} className="bg-slate-900">
                    {repo.name} ({repo.healthScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Health: 98.4% Passing</span>
            </div>
          </div>
        </div>

        {/* Top 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Tests Scanned"
            value={metrics?.totalScanned.toLocaleString() || "14,820"}
            delta={{ value: "+12.4%", isPositive: true, label: "vs last sprint" }}
            icon={Search}
            glow="none"
          />
          <MetricCard
            title="Flaky Tests Detected"
            value={metrics?.flakyCount || "38"}
            delta={{ value: "-4 flakes", isPositive: true, label: "reduced this week" }}
            icon={ShieldAlert}
            glow="none"
          />
          <MetricCard
            title="Active Investigations"
            value={metrics?.investigationsInProgress || "4"}
            delta={{ value: "2 in reproduction", isNeutral: true }}
            icon={RefreshCw}
            glow="violet"
          />
          <MetricCard
            title="Empirically Verified Fixes"
            value={metrics?.verifiedFixes || "29"}
            delta={{ value: "+6 verified", isPositive: true, label: "100% clean" }}
            icon={CheckCircle2}
            glow="lime"
          />
        </div>

        {/* Charts Grid: Trend and Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FlakinessTrendChart data={metrics?.trendData} />
          </div>
          <div>
            <SeverityDistributionChart data={metrics?.severityDistribution} />
          </div>
        </div>

        {/* Recent Investigations & Live Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentInvestigationsTable investigations={investigations} />
          </div>
          <div>
            <ActivityFeed events={telemetry} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
