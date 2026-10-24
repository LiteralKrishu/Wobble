"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { VerificationResult } from "@/types";
import { cn } from "@/lib/utils";

interface FixVerificationCardProps {
  investigationId: string;
  verification: VerificationResult;
  onRunVerification: (runsCount: number) => Promise<void>;
  className?: string;
}

export function FixVerificationCard({
  investigationId,
  verification,
  onRunVerification,
  className,
}: FixVerificationCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedBatchSize, setSelectedBatchSize] = useState(20);

  const progressPercent = Math.min(
    100,
    Math.round((verification.totalRuns / (verification.targetThreshold || 50)) * 100)
  );

  const handleTrigger = async () => {
    try {
      setIsRunning(true);
      await onRunVerification(selectedBatchSize);
      setIsRunning(false);
    } catch {
      setIsRunning(false);
    }
  };

  return (
    <div className={cn("rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,92,246,0.12)] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Fix Empirical Verification Suite
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Statistical stress validation under scheduler jitter and clock skew perturbations
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center space-x-2">
          {verification.isVerified ? (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>FIX VERIFIED (100% CLEAN)</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>UNVERIFIED ({verification.totalRuns}/{verification.targetThreshold} RUNS)</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress towards verification threshold */}
      <div className="my-3.5 p-3.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] space-y-2.5 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
            Target Verification Iterations
          </span>
          <span className="text-zinc-200 font-semibold">
            {verification.passedRuns} / {verification.targetThreshold} Clean Runs
          </span>
        </div>

        <div className="h-2 w-full rounded bg-[#141122] overflow-hidden border border-[rgba(139,92,246,0.14)]">
          <div
            className={cn(
              "h-full rounded transition-all duration-300",
              verification.isVerified ? "bg-emerald-500" : "bg-amber-500"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span>0 Runs</span>
          <span className="text-zinc-400">{progressPercent}% confidence threshold (p &lt; 0.001)</span>
          <span>{verification.targetThreshold} Runs</span>
        </div>
      </div>

      {/* Perturbation Parameters Under Test */}
      <div className="space-y-2 mb-3.5">
        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Stress Perturbations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.10)]">
            <span className="text-zinc-500 text-[10px] block">Thread Jitter</span>
            <span className={verification.perturbationParams.threadJitter ? "text-emerald-400 font-medium" : "text-zinc-500"}>
              {verification.perturbationParams.threadJitter ? "ACTIVE (±25ms)" : "OFF"}
            </span>
          </div>
          <div className="p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.10)]">
            <span className="text-zinc-500 text-[10px] block">Clock Drift</span>
            <span className="text-zinc-200 font-medium">
              &plusmn;{verification.perturbationParams.clockSkewMs}ms
            </span>
          </div>
          <div className="p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.10)]">
            <span className="text-zinc-500 text-[10px] block">CPU Quota</span>
            <span className="text-zinc-200 font-medium">
              {verification.perturbationParams.cpuThrottlePercent}% quota
            </span>
          </div>
          <div className="p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.10)]">
            <span className="text-zinc-500 text-[10px] block">Memory Spikes</span>
            <span className="text-zinc-200 font-medium">
              {verification.perturbationParams.memoryPressureMb}MB spike
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Trigger Button Strip */}
      <div className="pt-3 border-t border-[rgba(139,92,246,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
          <span>Batch:</span>
          {[10, 20, 50].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setSelectedBatchSize(count)}
              className={cn(
                "px-2.5 py-1 rounded border text-xs cursor-pointer transition-colors",
                selectedBatchSize === count
                  ? "bg-violet-950/40 border-violet-500/40 text-violet-200 font-semibold"
                  : "bg-[#090812] border-[rgba(139,92,246,0.12)] text-zinc-400 hover:text-zinc-200"
              )}
            >
              +{count}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleTrigger}
          disabled={isRunning}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium font-mono transition-colors cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating Perturbation Batch...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Run +{selectedBatchSize} Verification Runs</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Log */}
      {verification.verificationLog.length > 0 && (
        <div
          data-lenis-prevent
          className="mt-3.5 p-3 rounded bg-[#090812] border border-[rgba(139,92,246,0.10)] font-mono text-[11px] text-zinc-400 max-h-32 overflow-y-auto space-y-0.5"
        >
          {verification.verificationLog.map((log, idx) => (
            <div
              key={idx}
              className={cn(
                "leading-relaxed",
                log.includes("SUCCESS") || log.includes("VERIFIED")
                  ? "text-emerald-400 font-medium"
                  : "text-zinc-400"
              )}
            >
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
