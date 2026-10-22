import React from "react";
import { GitCommit, Minimize2, Trash2, CheckCircle2, Hash, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MinimizationResult } from "@/types";
import { cn } from "@/lib/utils";

interface MinimizationDiffProps {
  minimization: MinimizationResult;
  className?: string;
}

export function MinimizationDiff({
  minimization,
  className,
}: MinimizationDiffProps) {
  return (
    <GlassPanel hasCorners glow="cyan" className={cn("p-5 sm:p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(0,229,255,0.3)]">
            <Minimize2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
              Delta-Debugging Failure Minimization
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Isolating minimal reproductive sequence that triggers failure
            </p>
          </div>
        </div>

        {/* Reduction Percentage Pill */}
        <div className="flex items-center space-x-2 font-mono">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,245,150,0.3)]">
            -{minimization.reductionPercentage.toFixed(1)}% COMPLEXITY REDUCED
          </span>
        </div>
      </div>

      {/* Metric Counters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3.5 rounded-xl bg-slate-900/60 border border-white/5 font-mono text-xs">
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Original Harness</span>
          <div className="text-base font-bold text-slate-300 mt-0.5">
            {minimization.originalStepsCount} Fixture Steps
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Minimal Reproduction</span>
          <div className="text-base font-bold text-cyan-300 mt-0.5">
            {minimization.minimizedStepsCount} Critical Steps
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Reproduction Seed</span>
          <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center space-x-1">
            <Hash className="w-3.5 h-3.5" />
            <span>{minimization.reproductionSeed}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
        {/* Original Sequence */}
        <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Original Test Sequence ({minimization.originalSequence.length} Steps)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Full Suite</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-slate-400">
              {minimization.originalSequence.map((step, idx) => (
                <li
                  key={idx}
                  className="py-1 px-2 rounded bg-slate-900/40 border border-white/5 text-[11px] leading-relaxed truncate"
                >
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
            16 of these steps were proven non-causal by delta-debugging algorithm.
          </p>
        </div>

        {/* Minimized Sequence */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Isolated Minimal Reproductive Sequence</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                100% Repro
              </span>
            </div>
            <ul className="space-y-2 font-mono text-xs text-cyan-100">
              {minimization.minimizedSequence.map((step, idx) => (
                <li
                  key={idx}
                  className="py-2 px-3 rounded-lg bg-cyan-900/30 border border-cyan-400/40 text-xs font-bold leading-relaxed shadow-[0_0_12px_rgba(0,229,255,0.15)] flex items-start space-x-2"
                >
                  <span className="text-cyan-400 shrink-0">&gt;</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-slate-300">
            <span className="text-cyan-300 font-semibold block mb-0.5">
              Deterministic Reproduction Guarantee:
            </span>
            Running this 2-step sequence with seed{" "}
            <code className="text-emerald-400 bg-emerald-500/10 px-1 rounded">
              {minimization.reproductionSeed}
            </code>{" "}
            triggers the panic in &lt;12ms without spinning up external containers.
          </div>
        </div>
      </div>

      {/* Eliminated Steps Breakdown */}
      {minimization.eliminatedSteps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
            Pruned Redundant Fixtures ({minimization.eliminatedSteps.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
            {minimization.eliminatedSteps.map((elim, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900/40 border border-white/5 flex items-start space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400/70 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">
                    {elim.step}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Reason: {elim.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
