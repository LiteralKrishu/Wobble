import React from "react";
import { Check, Loader2, X, Circle, ShieldCheck } from "lucide-react";
import { InvestigationStage, InvestigationStatus } from "@/types";
import { cn } from "@/lib/utils";

interface InvestigationPipelineProps {
  currentStage: InvestigationStage;
  status: InvestigationStatus;
  className?: string;
}

const STAGES: {
  key: InvestigationStage;
  title: string;
  desc: string;
}[] = [
  { key: "DETECT", title: "DETECT", desc: "Signature Isolation" },
  { key: "REPRODUCE", title: "REPRODUCE", desc: "Seed Fuzzing" },
  { key: "MINIMIZE", title: "MINIMIZE", desc: "Delta Debugging" },
  { key: "DIAGNOSE", title: "DIAGNOSE", desc: "Root Cause" },
  { key: "VERIFY", title: "VERIFY", desc: "Perturbation Suite" },
];

export function InvestigationPipeline({
  currentStage,
  status,
  className,
}: InvestigationPipelineProps) {
  const stageOrder: InvestigationStage[] = [
    "DETECT",
    "REPRODUCE",
    "MINIMIZE",
    "DIAGNOSE",
    "VERIFY",
  ];
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-5 sm:p-6 border border-white/10",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            Investigation Workflow Pipeline
          </h3>
          <p className="text-sm font-semibold text-white mt-0.5">
            Automated Lifecycle Progression
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">STATE:</span>
          <span
            className={cn(
              "font-bold",
              status === "VERIFIED"
                ? "text-emerald-400"
                : status === "FAILED"
                ? "text-rose-400"
                : "text-cyan-400"
            )}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Responsive grid / flex container */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentIndex || status === "VERIFIED";
            const isActive = idx === currentIndex && status !== "VERIFIED" && status !== "FAILED";
            const isFailed = idx === currentIndex && status === "FAILED";
            const isPending = idx > currentIndex && status !== "VERIFIED";

            return (
              <div
                key={s.key}
                className={cn(
                  "relative flex flex-col items-center p-3.5 rounded-xl transition-all duration-300 border text-center",
                  isCompleted &&
                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
                  isActive &&
                    "bg-cyan-500/15 border-cyan-400/50 text-cyan-200 shadow-[0_0_20px_-3px_rgba(0,229,255,0.35)]",
                  isFailed &&
                    "bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)]",
                  isPending &&
                    "bg-slate-900/40 border-white/5 text-slate-500"
                )}
              >
                {/* Node Indicator Icon */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold mb-2 transition-all",
                    isCompleted &&
                      "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,245,150,0.5)]",
                    isActive &&
                      "bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.6)] animate-pulse",
                    isFailed &&
                      "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]",
                    isPending && "bg-slate-800 text-slate-500 border border-white/10"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  ) : isFailed ? (
                    <X className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>0{idx + 1}</span>
                  )}
                </div>

                <span className="text-xs font-mono font-bold tracking-wider">
                  {s.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-mono leading-tight">
                  {s.desc}
                </span>

                {/* Status Sub-badge */}
                <span
                  className={cn(
                    "mt-2 text-[9px] font-mono px-1.5 py-0.5 rounded tracking-wide uppercase",
                    isCompleted && "bg-emerald-500/20 text-emerald-400",
                    isActive && "bg-cyan-400/20 text-cyan-300 animate-pulse",
                    isFailed && "bg-rose-500/20 text-rose-400",
                    isPending && "bg-slate-800/80 text-slate-500"
                  )}
                >
                  {isCompleted
                    ? "COMPLETED"
                    : isActive
                    ? "ACTIVE"
                    : isFailed
                    ? "HALTED"
                    : "QUEUED"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
