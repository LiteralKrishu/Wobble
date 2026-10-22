import React from "react";
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { RootCauseHypothesis } from "@/types";
import { cn } from "@/lib/utils";

interface RootCauseCardProps {
  hypothesis: RootCauseHypothesis;
  className?: string;
}

export function RootCauseCard({ hypothesis, className }: RootCauseCardProps) {
  return (
    <GlassPanel hasCorners glow="violet" className={cn("p-5 sm:p-6", className)}>
      {/* Header with Distinction Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
                Root-Cause Diagnostic Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated empirical failure hypothesis and proof points
            </p>
          </div>
        </div>

        {/* AI Hypothesis vs Confirmed Empirical Finding Pill */}
        <div className="flex items-center space-x-2">
          {hypothesis.isConfirmed ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,245,150,0.25)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONFIRMED FINDING</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>AI HYPOTHESIS (UNVERIFIED)</span>
            </span>
          )}
        </div>
      </div>

      {/* Suspected Cause Title & Confidence Gauge */}
      <div className="my-5 p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400">
              Primary Suspected Mechanism
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {hypothesis.title}
            </h4>
          </div>

          <div className="flex items-center space-x-3 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 shrink-0 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
              <div className="text-lg font-bold text-violet-300">
                {hypothesis.confidence}%
              </div>
            </div>
            <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full"
                style={{ width: `${hypothesis.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          {hypothesis.description}
        </p>
      </div>

      {/* Cause Category Distribution Breakdown */}
      <div className="mb-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Root-Cause Probability Breakdown</span>
          <span>Normalized Weights</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-white/10">
          {hypothesis.categoryDistribution.map((cat, idx) => (
            <div
              key={idx}
              title={`${cat.category}: ${cat.percentage}%`}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-mono">
          {hypothesis.categoryDistribution.map((cat, idx) => (
            <span key={idx} className="flex items-center space-x-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-slate-300">{cat.category}:</span>
              <span className="font-bold text-white">{cat.percentage}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Supporting Evidence Points */}
      <div className="space-y-3">
        <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Supporting Empirical Evidence ({hypothesis.evidencePoints.length})
        </h5>
        <div className="space-y-2.5">
          {hypothesis.evidencePoints.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between text-cyan-300">
                <span className="font-bold">{ev.label}</span>
                {ev.file && (
                  <span className="text-slate-400 text-[11px]">
                    {ev.file}{ev.line ? `:${ev.line}` : ""}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs font-sans leading-normal">
                {ev.detail}
              </p>

              {ev.snippet && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-white/10 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  <div className="text-[10px] text-cyan-400 uppercase mb-1">
                    Differential Trace Snippet:
                  </div>
                  <pre className="text-xs">{ev.snippet}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Fix */}
      <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
        <div className="flex items-center space-x-2 text-emerald-300 text-xs font-mono font-bold mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Recommended Remediation</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {hypothesis.recommendedFix}
        </p>
      </div>
    </GlassPanel>
  );
}
