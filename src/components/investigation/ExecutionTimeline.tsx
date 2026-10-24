"use client";

import React, { useState } from "react";
import { ExecutionRun, TestRunStatus } from "@/types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Cpu,
  Hash,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn, formatDuration, formatTimestamp } from "@/lib/utils";

interface ExecutionTimelineProps {
  runs: ExecutionRun[];
  className?: string;
}

export function ExecutionTimeline({ runs, className }: ExecutionTimelineProps) {
  const [filter, setFilter] = useState<"ALL" | "FAILURES" | "PASSES">("ALL");
  const [selectedRun, setSelectedRun] = useState<ExecutionRun | null>(
    runs.find((r) => r.status === "FAILED" || r.status === "TIMEOUT") || runs[0] || null
  );

  const filteredRuns = runs.filter((r) => {
    if (filter === "FAILURES") return r.status === "FAILED" || r.status === "TIMEOUT";
    if (filter === "PASSES") return r.status === "PASSED";
    return true;
  });

  const passCount = runs.filter((r) => r.status === "PASSED").length;
  const failCount = runs.filter((r) => r.status === "FAILED").length;
  const timeoutCount = runs.filter((r) => r.status === "TIMEOUT").length;
  const flakinessRate = ((failCount + timeoutCount) / (runs.length || 1)) * 100;

  return (
    <GlassPanel hasCorners className={cn("p-5 sm:p-6", className)}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
              Execution Timeline Matrix
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/20">
              {runs.length} Iterations
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Empirical pass/fail distribution across repeated seed variations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                filter === "ALL"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              All ({runs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("FAILURES")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                filter === "FAILURES"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Failures ({failCount + timeoutCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("PASSES")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                filter === "PASSES"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Passes ({passCount})
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 py-3 px-4 rounded-xl bg-slate-900/50 border border-white/5 font-mono text-xs">
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Flakiness Rate</span>
          <div className="text-base font-bold text-amber-400 mt-0.5">
            {flakinessRate.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Clean Passes</span>
          <div className="text-base font-bold text-emerald-400 mt-0.5">
            {passCount} / {runs.length}
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Total Failures</span>
          <div className="text-base font-bold text-rose-400 mt-0.5">
            {failCount} runs
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Timeouts</span>
          <div className="text-base font-bold text-amber-400 mt-0.5">
            {timeoutCount} runs
          </div>
        </div>
      </div>

      {/* 50-Run Interactive Matrix Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Click any run node to inspect seed telemetry</span>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span>Pass</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Fail</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Timeout</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-25 gap-1.5 p-3 rounded-xl bg-slate-950/80 border border-white/10">
          {filteredRuns.map((r) => {
            const isSelected = selectedRun?.id === r.id;
            const isPass = r.status === "PASSED";
            const isTimeout = r.status === "TIMEOUT";

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRun(r)}
                title={`Run #${r.runIndex} (${r.status}) - Seed: ${r.seed} - ${r.durationMs}ms`}
                className={cn(
                  "relative aspect-square rounded-md flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-300",
                  isPass &&
                    "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-500/40",
                  !isPass &&
                    !isTimeout &&
                    "bg-rose-500/30 text-rose-200 hover:bg-rose-500/50 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse",
                  isTimeout &&
                    "bg-amber-500/30 text-amber-200 hover:bg-amber-500/50 border border-amber-500/60",
                  isSelected &&
                    "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110 z-10 shadow-[0_0_12px_rgba(0,229,255,0.6)]"
                )}
              >
                {r.runIndex}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Run Deep Inspector Drawer */}
      {selectedRun && (
        <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
            <div className="flex items-center space-x-2.5">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase",
                  selectedRun.status === "PASSED"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : selectedRun.status === "TIMEOUT"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                )}
              >
                Run #{selectedRun.runIndex} &mdash; {selectedRun.status}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Duration: {formatDuration(selectedRun.durationMs)}
              </span>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              {formatTimestamp(selectedRun.timestamp)}
            </span>
          </div>

          {/* Telemetry metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-slate-500 text-[10px] block">Random Seed</span>
              <span className="text-cyan-300 font-bold text-sm">
                {selectedRun.seed}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-slate-500 text-[10px] block">Execution Worker</span>
              <span className="text-slate-200 font-bold">{selectedRun.workerId}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-slate-500 text-[10px] block">Order Index</span>
              <span className="text-slate-200 font-bold">#{selectedRun.orderIndex}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-slate-500 text-[10px] block">CPU / Memory</span>
              <span className="text-slate-200 font-bold">
                {Math.round(selectedRun.cpuThrottle * 100)}% CPU / {selectedRun.memoryMb}MB
              </span>
            </div>
          </div>

          {/* Captured output snippet */}
          {selectedRun.stdoutSnippet && (
            <div className="mt-3">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center space-x-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Run Stdout Output</span>
              </div>
              <pre className="p-3 rounded-lg bg-black/70 border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {selectedRun.stdoutSnippet}
              </pre>
            </div>
          )}

          {selectedRun.stderrSnippet && (
            <div className="mt-3">
              <div className="text-[10px] font-mono uppercase text-rose-400 mb-1 flex items-center space-x-1.5">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Run Stderr / Panic Capture</span>
              </div>
              <pre className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 font-mono text-[11px] text-rose-300 overflow-x-auto leading-relaxed">
                {selectedRun.stderrSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
