"use client";

import React, { useState } from "react";
import { ExecutionRun } from "@/types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Cpu,
  Hash,
  Copy,
  Check,
} from "lucide-react";
import { cn, formatDuration, formatTimestamp } from "@/lib/utils";

interface ExecutionTimelineProps {
  runs: ExecutionRun[];
  className?: string;
}

export function ExecutionTimeline({ runs, className }: ExecutionTimelineProps) {
  const [filter, setFilter] = useState<"ALL" | "FAILURES" | "PASSES">("ALL");
  const [copiedSeed, setCopiedSeed] = useState(false);
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

  const handleCopySeed = (seed: string) => {
    navigator.clipboard.writeText(seed);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  return (
    <div className={cn("rounded-lg bg-[#111317] border border-[#1e2229] p-4 sm:p-5", className)}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1e2229] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Execution Attempt Matrix
            </h3>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              {runs.length} Iterations
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Interleaved execution outcomes across randomized seeds and worker threads
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors cursor-pointer",
              filter === "ALL"
                ? "bg-[#181c23] text-zinc-100 border border-[#2a303c] font-medium"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            )}
          >
            All ({runs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("FAILURES")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors cursor-pointer",
              filter === "FAILURES"
                ? "bg-red-950/40 text-red-300 border border-red-800/60 font-medium"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            )}
          >
            Failures ({failCount + timeoutCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PASSES")}
            className={cn(
              "px-2 py-0.5 rounded transition-colors cursor-pointer",
              filter === "PASSES"
                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 font-medium"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            )}
          >
            Passes ({passCount})
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 py-2.5 px-3 rounded bg-[#0c0d10] border border-[#1e2229] font-mono text-xs">
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">Empirical Flakiness</span>
          <div className="text-sm font-semibold text-amber-400 mt-0.5">
            {flakinessRate.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">Clean Passes</span>
          <div className="text-sm font-semibold text-emerald-400 mt-0.5">
            {passCount} / {runs.length}
          </div>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">Panics &amp; Races</span>
          <div className="text-sm font-semibold text-red-400 mt-0.5">
            {failCount} runs
          </div>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">Timeouts</span>
          <div className="text-sm font-semibold text-amber-400 mt-0.5">
            {timeoutCount} runs
          </div>
        </div>
      </div>

      {/* 50-Run Interactive Matrix Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Click any run node to inspect seed conditions and panic trace:</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-500/80" />
              <span>Pass</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-sm bg-red-500/80" />
              <span>Fail</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-sm bg-amber-500/80" />
              <span>Timeout</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-25 gap-1 p-2 rounded bg-[#0c0d10] border border-[#1e2229]">
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
                  "relative aspect-square rounded flex items-center justify-center font-mono text-[10px] font-medium transition-colors cursor-pointer focus:outline-none",
                  isPass &&
                    "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/50",
                  !isPass &&
                    !isTimeout &&
                    "bg-red-950/60 text-red-300 hover:bg-red-900/80 border border-red-800/80",
                  isTimeout &&
                    "bg-amber-950/50 text-amber-300 hover:bg-amber-900/70 border border-amber-800/70",
                  isSelected &&
                    "ring-1 ring-zinc-200 border-zinc-200 font-bold z-10"
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
        <div className="mt-4 p-3.5 rounded bg-[#0c0d10] border border-[#1e2229]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#1e2229] gap-2">
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded text-[11px] font-mono font-medium uppercase",
                  selectedRun.status === "PASSED"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                    : selectedRun.status === "TIMEOUT"
                    ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                    : "bg-red-950/60 text-red-400 border border-red-800/60"
                )}
              >
                Run #{selectedRun.runIndex} &mdash; {selectedRun.status}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Duration: {formatDuration(selectedRun.durationMs)}
              </span>
            </div>

            <span className="text-[11px] font-mono text-zinc-400">
              {formatTimestamp(selectedRun.timestamp)}
            </span>
          </div>

          {/* Telemetry metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 text-xs font-mono">
            <div className="p-2 rounded bg-[#111317] border border-[#1e2229] flex items-center justify-between">
              <div>
                <span className="text-zinc-400 text-[10px] block">Random Seed</span>
                <span className="text-amber-400 font-semibold text-xs">
                  {selectedRun.seed}
                </span>
              </div>
              <button
                onClick={() => handleCopySeed(selectedRun.seed)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Copy reproduction seed"
              >
                {copiedSeed ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#1e2229]">
              <span className="text-zinc-400 text-[10px] block">Worker Thread</span>
              <span className="text-zinc-200 font-medium">{selectedRun.workerId}</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#1e2229]">
              <span className="text-zinc-400 text-[10px] block">Execution Order</span>
              <span className="text-zinc-200 font-medium">Seq #{selectedRun.orderIndex}</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#1e2229]">
              <span className="text-zinc-400 text-[10px] block">CPU Jitter / Mem</span>
              <span className="text-zinc-200 font-medium">
                {Math.round(selectedRun.cpuThrottle * 100)}% throttle / {selectedRun.memoryMb}MB
              </span>
            </div>
          </div>

          {/* Captured stdout/stderr snippet */}
          {selectedRun.stderrSnippet && (
            <div className="mt-2.5">
              <div className="text-[10px] font-mono uppercase text-red-400 mb-1 flex items-center space-x-1.5">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Panic / TSAN Data Race Trace</span>
              </div>
              <pre
                data-lenis-prevent
                className="p-2.5 rounded bg-red-950/20 border border-red-900/30 font-mono text-[11px] text-red-300 overflow-x-auto leading-relaxed max-h-48"
              >
                {selectedRun.stderrSnippet}
              </pre>
            </div>
          )}

          {selectedRun.stdoutSnippet && (
            <div className="mt-2.5">
              <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1 flex items-center space-x-1.5">
                <Terminal className="w-3 h-3 text-zinc-400" />
                <span>Standard Output</span>
              </div>
              <pre
                data-lenis-prevent
                className="p-2.5 rounded bg-[#111317] border border-[#1e2229] font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed max-h-36"
              >
                {selectedRun.stdoutSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
