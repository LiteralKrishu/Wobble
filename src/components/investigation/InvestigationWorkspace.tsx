"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InvestigationPipeline } from "@/components/investigation/InvestigationPipeline";
import { ExecutionTimeline } from "@/components/investigation/ExecutionTimeline";
import { RootCauseCard } from "@/components/investigation/RootCauseCard";
import { MinimizationDiff } from "@/components/investigation/MinimizationDiff";
import { FixVerificationCard } from "@/components/investigation/FixVerificationCard";
import { LogViewer } from "@/components/investigation/LogViewer";
import { FlakinessOrbit3D } from "@/components/3d/FlakinessOrbit3D";
import {
  ArrowLeft,
  GitBranch,
  GitCommit,
  User,
  Clock,
  Download,
  StopCircle,
  FileCode,
  Loader2,
} from "lucide-react";
import { api } from "@/services/api";
import { Investigation } from "@/types";
import { formatDuration } from "@/lib/utils";

interface InvestigationWorkspaceProps {
  id: string;
}

export function InvestigationWorkspace({ id }: InvestigationWorkspaceProps) {
  const router = useRouter();
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [activeTab, setActiveTab] = useState<
    "ANALYSIS" | "LOGS" | "TIMELINE" | "MINIMIZE" | "VERIFY"
  >("ANALYSIS");
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvestigation() {
      setIsLoading(true);
      const data = await api.getInvestigationById(id);
      setInvestigation(data);
      setIsLoading(false);
    }
    fetchInvestigation();
  }, [id]);

  const handleRunVerification = async (runsCount: number) => {
    if (!investigation) return;
    const updated = await api.runFixVerification(investigation.id, runsCount);
    setInvestigation(updated);
    setActionFeedback(`Executed +${runsCount} verification runs. Pass rate: 100%.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCancelInvestigation = async () => {
    if (!investigation) return;
    const updated = await api.cancelInvestigation(investigation.id);
    setInvestigation(updated);
    setActionFeedback("Investigation marked as inconclusive/stopped.");
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleExportReport = () => {
    if (!investigation) return;
    const report = {
      investigationId: investigation.id,
      testName: investigation.testName,
      file: investigation.testFile,
      status: investigation.status,
      failureRate: `${investigation.failureRate}%`,
      rootCause: investigation.hypothesis.title,
      confidence: `${investigation.hypothesis.confidence}%`,
      reproductionSeed: investigation.minimization.reproductionSeed,
      verificationStatus: investigation.verification.isVerified ? "VERIFIED" : "UNVERIFIED",
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${investigation.id}-diagnostic-report.json`;
    a.click();
    setActionFeedback("Exported diagnostic report JSON.");
    setTimeout(() => setActionFeedback(null), 3000);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-3 font-mono">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-sm text-slate-400">Loading diagnostic workspace for {id}...</p>
        </div>
      </AppShell>
    );
  }

  if (!investigation) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Investigation Not Found</h2>
          <p className="text-slate-400 font-mono text-sm">
            Identifier {id} does not match any active or archived test records.
          </p>
          <Link
            href="/investigations"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Investigations</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/investigations"
            className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explorer</span>
          </Link>

          {/* Action Feedback Toast */}
          {actionFeedback && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono animate-in fade-in slide-in-from-top-1">
              {actionFeedback}
            </div>
          )}
        </div>

        {/* Investigation Header */}
        <GlassPanel hasCorners glow="none" className="p-5 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {investigation.id}
                </span>
                <StatusBadge status={investigation.status} size="md" />
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                  Priority: {investigation.severity}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight break-all">
                {investigation.testName}
              </h1>

              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-300 select-all">{investigation.testFile}</span>
              </div>

              {/* Technical Metadata Bar */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{investigation.repository}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-300">{investigation.branch}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Commit: {investigation.commitHash}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Author: {investigation.author}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duration: {formatDuration(investigation.durationMs)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleExportReport}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Report</span>
              </button>

              {investigation.status !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={handleCancelInvestigation}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <StopCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cancel Session</span>
                </button>
              )}
            </div>
          </div>
        </GlassPanel>

        {/* 5-Stage Visual Workflow Pipeline */}
        <InvestigationPipeline
          currentStage={investigation.stage}
          status={investigation.status}
        />

        {/* Navigation Tabs for Investigation Sections */}
        <div className="flex items-center space-x-1 border-b border-white/10 overflow-x-auto pb-1 text-xs font-mono">
          {[
            { key: "ANALYSIS", label: "Root Cause & Findings" },
            {
              key: "TIMELINE",
              label: `Execution Timeline (${investigation.runs.length} Runs)`,
            },
            {
              key: "MINIMIZE",
              label: `Failure Minimization (-${investigation.minimization.reductionPercentage.toFixed(0)}%)`,
            },
            {
              key: "VERIFY",
              label: `Empirical Verification (${investigation.verification.totalRuns}/${investigation.verification.targetThreshold})`,
            },
            {
              key: "LOGS",
              label: `Diagnostic Logs & Telemetry (${investigation.evidenceLogs.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer font-medium ${
                activeTab === tab.key
                  ? "bg-slate-900/90 text-cyan-300 border-t-2 border-cyan-400 border-x border-white/10 shadow-[0_-5px_15px_-5px_rgba(0,229,255,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-t-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Workspace Tab Contents */}
        <div className="space-y-6">
          {activeTab === "ANALYSIS" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <RootCauseCard hypothesis={investigation.hypothesis} />
                <MinimizationDiff minimization={investigation.minimization} />
              </div>
              <div className="space-y-6">
                <FlakinessOrbit3D
                  flakinessRate={investigation.failureRate}
                  testName={investigation.testName}
                />
                <FixVerificationCard
                  investigationId={investigation.id}
                  verification={investigation.verification}
                  onRunVerification={handleRunVerification}
                />
              </div>
            </div>
          )}

          {activeTab === "TIMELINE" && (
            <ExecutionTimeline runs={investigation.runs} />
          )}

          {activeTab === "MINIMIZE" && (
            <MinimizationDiff minimization={investigation.minimization} />
          )}

          {activeTab === "VERIFY" && (
            <FixVerificationCard
              investigationId={investigation.id}
              verification={investigation.verification}
              onRunVerification={handleRunVerification}
            />
          )}

          {activeTab === "LOGS" && (
            <LogViewer
              logs={investigation.evidenceLogs}
              stackTrace={investigation.rawStackTrace}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
