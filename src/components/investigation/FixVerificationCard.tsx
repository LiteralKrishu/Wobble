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
  Cpu,
  Clock,
  Sparkles,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { VerificationResult } from "@/types";
import { cn, formatTimestamp } from "@/lib/utils";

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
    <GlassPanel
      hasCorners
      glow={verification.isVerified ? "lime" : "none"}
      className={cn("p-5 sm:p-6", className)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "p-2 rounded-xl border transition-all",
              verification.isVerified
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,245,150,0.3)]"
                : "bg-slate-800 text-slate-400 border-white/10"
            )}
          >
            {verification.isVerified ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
              Fix Empirical Verification Suite
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              High-intensity chaos and scheduler perturbation stress testing
            </p>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center space-x-2">
          {verification.isVerified ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,245,150,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>FIX EMPIRICALLY VERIFIED</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>UNVERIFIED ({verification.totalRuns}/{verification.targetThreshold} RUNS)</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress towards verification threshold */}
      <div className="my-5 p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 uppercase tracking-wider">
            Verification Runs Completed
          </span>
          <span className="text-white font-bold">
            {verification.passedRuns} / {verification.targetThreshold} Target Runs Clean
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden border border-white/10 p-0.5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              verification.isVerified
                ? "bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,245,150,0.5)]"
                : "bg-gradient-to-r from-amber-400 to-cyan-400"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>0 Runs</span>
          <span>{progressPercent}% towards statistical confidence (p &lt; 0.001)</span>
          <span>{verification.targetThreshold} Runs</span>
        </div>
      </div>

      {/* Perturbation Parameters Under Test */}
      <div className="space-y-2 mb-5">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Chaos Perturbations Applied</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-slate-500 text-[10px] block">Thread Jitter</span>
            <span className={verification.perturbationParams.threadJitter ? "text-emerald-400 font-bold" : "text-slate-400"}>
              {verification.perturbationParams.threadJitter ? "ENABLED (+/-25ms)" : "DISABLED"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-slate-500 text-[10px] block">Clock Skew Drift</span>
            <span className="text-cyan-300 font-bold">
              &plusmn;{verification.perturbationParams.clockSkewMs}ms
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-slate-500 text-[10px] block">CPU Throttling</span>
            <span className="text-slate-300 font-bold">
              {verification.perturbationParams.cpuThrottlePercent}% Quota
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-slate-500 text-[10px] block">Memory Pressure</span>
            <span className="text-slate-300 font-bold">
              {verification.perturbationParams.memoryPressureMb}MB Spikes
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Trigger Button Strip */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span>Batch Size:</span>
          {[10, 20, 50].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setSelectedBatchSize(count)}
              className={cn(
                "px-2 py-1 rounded-md border text-xs cursor-pointer transition-colors",
                selectedBatchSize === count
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                  : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
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
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-bold font-mono hover:from-emerald-400 hover:to-teal-300 transition-all duration-200 shadow-[0_0_20px_-3px_rgba(16,245,150,0.4)] cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Simulating Verification Batch...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run {selectedBatchSize} Verification Iterations</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Log */}
      {verification.verificationLog.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto space-y-1">
          {verification.verificationLog.map((log, idx) => (
            <div
              key={idx}
              className={cn(
                "leading-relaxed",
                log.includes("SUCCESS") || log.includes("VERIFIED")
                  ? "text-emerald-300 font-bold"
                  : "text-slate-400"
              )}
            >
              {log}
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
