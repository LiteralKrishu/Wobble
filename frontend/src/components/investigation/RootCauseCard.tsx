import React from "react";
import {
  ShieldCheck,
  FileCode,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { RootCauseHypothesis } from "@/types";
import { cn } from "@/lib/utils";

interface RootCauseCardProps {
  hypothesis: RootCauseHypothesis;
  className?: string;
}

export function RootCauseCard({ hypothesis, className }: RootCauseCardProps) {
  return (
    <div className={cn("rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]", className)}>
      {/* Header with Distinction Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[rgba(139,92,246,0.10)] gap-3">
        <div>
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Root-Cause Diagnostic Analysis
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated empirical failure hypothesis and proof points
          </p>
        </div>

        {/* AI Hypothesis vs Confirmed Empirical Finding Pill */}
        <div className="flex items-center space-x-2">
          {hypothesis.isConfirmed ? (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONFIRMED FINDING</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-violet-950/40 border border-violet-800/50 text-violet-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>AI HYPOTHESIS (UNVERIFIED)</span>
            </span>
          )}
        </div>
      </div>

      {/* Suspected Cause Title & Confidence Gauge */}
      <div className="my-4 p-4 rounded-lg bg-[#0c0a14] border border-[rgba(139,92,246,0.12)] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400">
              Primary Identified Mechanism
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-white mt-0.5">
              {hypothesis.title}
            </h4>
          </div>

          <div className="flex items-center space-x-3 bg-[#130f24] px-3 py-1.5 rounded-md border border-[rgba(139,92,246,0.16)] shrink-0 font-mono">
            <div>
              <div className="text-[9px] text-zinc-400 uppercase">Confidence</div>
              <div className="text-sm font-semibold text-violet-300">
                {hypothesis.confidence}%
              </div>
            </div>
            <div className="w-14 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full"
                style={{ width: `${hypothesis.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
          {hypothesis.description}
        </p>
      </div>

      {/* Supporting Evidence Points */}
      <div className="space-y-3">
        <h5 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
          Supporting Empirical Evidence ({hypothesis.evidencePoints.length})
        </h5>
        <div className="space-y-2.5">
          {hypothesis.evidencePoints.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-lg bg-[#0c0a14] border border-[rgba(139,92,246,0.10)] space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between text-zinc-200">
                <span className="font-semibold text-xs text-violet-300">{ev.label}</span>
                {ev.file && (
                  <span className="text-zinc-400 text-[11px]">
                    {ev.file}{ev.line ? `:${ev.line}` : ""}
                  </span>
                )}
              </div>
              <p className="text-zinc-300 text-xs font-sans leading-normal">
                {ev.detail}
              </p>

              {ev.snippet && (
                <div className="mt-2.5 p-3 rounded-md bg-[#08070d] border border-[rgba(139,92,246,0.12)] text-[11px] font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                  <pre
                    data-lenis-prevent
                    className="text-xs text-zinc-300"
                  >
                    {ev.snippet}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Fix */}
      <div className="mt-4 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
        <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-mono font-medium mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recommended Remediation</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          {hypothesis.recommendedFix}
        </p>
      </div>
    </div>
  );
}
