import React from "react";
import { Check, Loader2, X } from "lucide-react";
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
        "rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(139,92,246,0.10)]">
        <div>
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Diagnostic Workflow Lifecycle
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            5-stage automated progression from initial CI failure to verified clean fix
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-zinc-400">STATE:</span>
          <span
            className={cn(
              "font-medium",
              status === "VERIFIED"
                ? "text-emerald-400"
                : status === "FAILED"
                ? "text-rose-400"
                : "text-violet-400"
            )}
          >
            {status}
          </span>
        </div>
      </div>

      {/* 5-Stage Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 relative">
        {STAGES.map((s, idx) => {
          const isCompleted = idx < currentIndex || status === "VERIFIED";
          const isActive = idx === currentIndex && status !== "VERIFIED" && status !== "FAILED";
          const isFailed = idx === currentIndex && status === "FAILED";
          const isPending = idx > currentIndex && status !== "VERIFIED";

          return (
            <div
              key={s.key}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg border text-center transition-all",
                isCompleted && "bg-emerald-950/20 border-emerald-800/40 text-emerald-300",
                isActive && "bg-violet-950/40 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]",
                isFailed && "bg-rose-950/30 border-rose-800/60 text-rose-300",
                isPending && "bg-[#0c0a14] border-[rgba(139,92,246,0.10)] text-zinc-400"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-semibold mb-1.5",
                  isCompleted && "bg-emerald-500 text-zinc-950",
                  isActive && "bg-violet-500 text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]",
                  isFailed && "bg-rose-500 text-white",
                  isPending && "bg-zinc-800 text-zinc-400 border border-zinc-700"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                ) : isFailed ? (
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span className="text-xs font-mono font-medium tracking-wide">
                {s.title}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                {s.desc}
              </span>

              <span
                className={cn(
                  "mt-2 text-[9px] font-mono px-1.5 py-0.2 rounded uppercase tracking-wider",
                  isCompleted && "text-emerald-400 bg-emerald-950/60",
                  isActive && "text-violet-300 bg-violet-950/60 font-semibold",
                  isFailed && "text-rose-400 bg-rose-950/60",
                  isPending && "text-zinc-400 bg-zinc-900"
                )}
              >
                {isCompleted
                  ? "Completed"
                  : isActive
                  ? "Running"
                  : isFailed
                  ? "Halted"
                  : "Queued"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
