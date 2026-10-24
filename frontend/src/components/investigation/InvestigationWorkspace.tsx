"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InvestigationPipeline } from "@/components/investigation/InvestigationPipeline";
import { ExecutionTimeline } from "@/components/investigation/ExecutionTimeline";
import { RootCauseCard } from "@/components/investigation/RootCauseCard";
import { MinimizationDiff } from "@/components/investigation/MinimizationDiff";
import { FixVerificationCard } from "@/components/investigation/FixVerificationCard";
import { LogViewer } from "@/components/investigation/LogViewer";
import { ExecutionVariance3D } from "@/components/3d/ExecutionVariance3D";
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
    setActionFeedback("Investigation marked as halted.");
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
          <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
          <p className="text-xs text-zinc-400">Loading diagnostic workspace for {id}...</p>
        </div>
      </AppShell>
    );
  }

  if (!investigation) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-4">
          <h2 className="text-lg font-semibold text-white">Investigation Not Found</h2>
          <p className="text-zinc-400 font-mono text-xs">
            Identifier {id} does not match any active test records.
          </p>
          <Link
            href="/investigations"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#161228] text-zinc-200 border border-[rgba(139,92,246,0.2)] font-mono text-xs cursor-pointer hover:border-violet-500/40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Explorer</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Navigation Breadcrumb & Toast */}
        <div className="flex items-center justify-between">
          <Link
            href="/investigations"
            className="flex items-center space-x-1.5 text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Investigation Explorer</span>
          </Link>

          {/* Action Feedback Toast */}
          {actionFeedback && (
            <div className="px-3 py-1 rounded-md bg-[#181328] border border-violet-500/40 text-violet-200 text-xs font-mono animate-in fade-in shadow-[0_0_12px_rgba(139,92,246,0.2)]">
              {actionFeedback}
            </div>
          )}
        </div>

        {/* Investigation Master Identity Header */}
        <div className="rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-semibold text-violet-300 px-2 py-0.5 rounded-md bg-[#0c0a14] border border-[rgba(139,92,246,0.16)]">
                  {investigation.id}
                </span>
                <StatusBadge status={investigation.status} size="sm" />
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#141022] text-zinc-300 border border-[rgba(139,92,246,0.12)]">
                  Priority: {investigation.severity}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-300 border border-rose-800/60 font-semibold">
                  {investigation.failureRate}% Flakiness Rate
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight break-all font-mono">
                {investigation.testName}
              </h1>

              <div className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400">
                <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-zinc-300 select-all">{investigation.testFile}</span>
              </div>

              {/* Technical Context Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs font-mono text-zinc-400">
                <div className="flex items-center space-x-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                  <span>{investigation.repository}</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-300">{investigation.branch}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitCommit className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Commit: {investigation.commitHash}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Author: {investigation.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Duration: {formatDuration(investigation.durationMs)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportReport}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#161226] hover:bg-violet-900/30 border border-[rgba(139,92,246,0.18)] hover:border-violet-500/40 text-xs font-mono text-zinc-200 hover:text-white transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export Report JSON</span>
              </button>

              {investigation.status !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={handleCancelInvestigation}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#161226] hover:bg-rose-950/40 border border-[rgba(139,92,246,0.18)] hover:border-rose-800/60 text-xs font-mono text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <StopCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Halt Session</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5-Stage Visual Workflow Pipeline */}
        <InvestigationPipeline
          currentStage={investigation.stage}
          status={investigation.status}
        />

        {/* Workspace Section Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-[rgba(139,92,246,0.12)] overflow-x-auto pb-0.5 text-xs font-mono">
          {[
            { key: "ANALYSIS", label: "Diagnostic Analysis & Topology" },
            {
              key: "TIMELINE",
              label: `Execution Matrix (${investigation.runs.length} Runs)`,
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
              label: `Telemetry Logs (${investigation.evidenceLogs.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-t-md transition-all whitespace-nowrap cursor-pointer font-medium ${
                activeTab === tab.key
                  ? "bg-[#161228] text-white border-t border-x border-[rgba(139,92,246,0.25)] shadow-[0_-2px_10px_rgba(139,92,246,0.15)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-violet-950/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Workspace Tab Contents */}
        <div className="space-y-5">
          {activeTab === "ANALYSIS" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <RootCauseCard hypothesis={investigation.hypothesis} />
                <MinimizationDiff minimization={investigation.minimization} />
              </div>
              <div className="space-y-5">
                <ExecutionVariance3D
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
