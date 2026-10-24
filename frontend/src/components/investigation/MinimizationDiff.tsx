import React from "react";
import { GitCommit, Minimize2, Trash2, Hash } from "lucide-react";
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
    <div className={cn("rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,92,246,0.12)] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Minimize2 className="w-3.5 h-3.5 text-violet-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Delta-Debugging Failure Minimization
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Automated binary reduction isolating minimal sequence triggering non-determinism
          </p>
        </div>

        {/* Reduction Percentage Pill */}
        <div className="flex items-center space-x-2 font-mono">
          <span className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            -{minimization.reductionPercentage.toFixed(1)}% COMPLEXITY REDUCED
          </span>
        </div>
      </div>

      {/* Metric Counters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3.5 p-3 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] font-mono text-xs">
        <div>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Original Harness</span>
          <div className="text-sm font-semibold text-zinc-200 mt-0.5">
            {minimization.originalStepsCount} Fixture Steps
          </div>
        </div>
        <div>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Minimal Reproducer</span>
          <div className="text-sm font-semibold text-amber-400 mt-0.5">
            {minimization.minimizedStepsCount} Critical Steps
          </div>
        </div>
        <div>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Reproduction Seed</span>
          <div className="text-sm font-semibold text-zinc-200 mt-0.5 flex items-center space-x-1">
            <Hash className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-200">{minimization.reproductionSeed}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 my-3.5">
        {/* Original Sequence */}
        <div className="p-3.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(139,92,246,0.12)] mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                Original Test Fixture ({minimization.originalSequence.length} Steps)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Full Suite</span>
            </div>
            <ul
              data-lenis-prevent
              className="space-y-1 font-mono text-xs text-zinc-400 max-h-56 overflow-y-auto pr-1"
            >
              {minimization.originalSequence.map((step, idx) => (
                <li
                  key={idx}
                  className="py-1 px-2.5 rounded bg-[#141122] border border-[rgba(139,92,246,0.10)] text-[11px] leading-relaxed truncate text-zinc-300"
                >
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[10px] font-mono text-zinc-500 pt-2 border-t border-[rgba(139,92,246,0.10)]">
            16 steps proven non-causal by delta-debugging algorithm.
          </p>
        </div>

        {/* Minimized Sequence */}
        <div className="p-3.5 rounded bg-[#090812] border border-amber-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Isolated Minimal Reproductive Sequence
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                100% Repro
              </span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-zinc-200">
              {minimization.minimizedSequence.map((step, idx) => (
                <li
                  key={idx}
                  className="py-2 px-2.5 rounded bg-[#141122] border border-amber-500/40 text-xs font-medium leading-relaxed flex items-start space-x-2"
                >
                  <span className="text-amber-400 font-bold shrink-0">&gt;</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 p-2.5 rounded bg-[#141122] border border-[rgba(139,92,246,0.12)] text-[11px] font-mono text-zinc-300">
            <span className="text-amber-400 font-medium block mb-0.5">
              Deterministic Reproduction Guarantee:
            </span>
            Running this 2-step sequence with seed{" "}
            <code className="text-violet-200 bg-violet-950/60 border border-violet-800/40 px-1 py-0.2 rounded">
              {minimization.reproductionSeed}
            </code>{" "}
            triggers the panic in &lt;12ms without spinning up external containers.
          </div>
        </div>
      </div>

      {/* Eliminated Steps Breakdown */}
      {minimization.eliminatedSteps.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-[rgba(139,92,246,0.12)] space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block font-medium">
            Pruned Redundant Fixtures ({minimization.eliminatedSteps.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-xs">
            {minimization.eliminatedSteps.map((elim, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.10)] flex items-start space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-300 font-medium block">
                    {elim.step}
                  </span>
                  <span className="text-zinc-500 text-[10px]">
                    Reason: {elim.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
