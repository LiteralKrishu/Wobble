import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  GitCommit,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InvestigationStatus, InvestigationStage, TestRunStatus } from "@/types";

interface StatusBadgeProps {
  status: InvestigationStatus | InvestigationStage | TestRunStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const norm = String(status).toUpperCase();

  let label = norm;
  let bgClass = "bg-slate-800/80 text-slate-300 border-slate-700";
  let icon = <Clock className="w-3 h-3" />;

  switch (norm) {
    case "VERIFIED":
      label = "VERIFIED";
      bgClass =
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_-2px_rgba(16,245,150,0.3)]";
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      break;
    case "DIAGNOSED":
      label = "DIAGNOSED";
      bgClass =
        "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_-2px_rgba(0,229,255,0.25)]";
      icon = <Cpu className="w-3 h-3 text-cyan-400" />;
      break;
    case "MINIMIZED":
      label = "MINIMIZED";
      bgClass =
        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      icon = <GitCommit className="w-3 h-3 text-cyan-400" />;
      break;
    case "REPRODUCED":
      label = "REPRODUCED";
      bgClass =
        "bg-violet-500/15 text-violet-300 border-violet-500/40 shadow-[0_0_12px_-2px_rgba(168,85,247,0.25)]";
      icon = <RefreshCw className="w-3 h-3 text-violet-400 animate-spin-slow" />;
      break;
    case "INVESTIGATING":
      label = "INVESTIGATING";
      bgClass =
        "bg-violet-500/15 text-violet-300 border-violet-500/30";
      icon = <RefreshCw className="w-3 h-3 text-violet-400 animate-spin" />;
      break;
    case "FAILED":
      label = "FAILED";
      bgClass =
        "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_-2px_rgba(244,63,94,0.3)]";
      icon = <XCircle className="w-3 h-3 text-rose-400" />;
      break;
    case "PASSED":
      label = "PASSED";
      bgClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      break;
    case "TIMEOUT":
      label = "TIMEOUT";
      bgClass = "bg-amber-500/15 text-amber-300 border-amber-500/40";
      icon = <AlertTriangle className="w-3 h-3 text-amber-400" />;
      break;
    case "INCONCLUSIVE":
      label = "INCONCLUSIVE";
      bgClass = "bg-amber-500/15 text-amber-300 border-amber-500/30";
      icon = <HelpCircle className="w-3 h-3 text-amber-400" />;
      break;
    // Stages
    case "DETECT":
      label = "DETECT";
      bgClass = "bg-slate-800 text-slate-300 border-slate-700";
      icon = <Clock className="w-3 h-3" />;
      break;
    case "REPRODUCE":
      label = "REPRODUCE";
      bgClass = "bg-violet-500/15 text-violet-300 border-violet-500/30";
      icon = <RefreshCw className="w-3 h-3 text-violet-400" />;
      break;
    case "MINIMIZE":
      label = "MINIMIZE";
      bgClass = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      icon = <GitCommit className="w-3 h-3 text-cyan-400" />;
      break;
    case "DIAGNOSE":
      label = "DIAGNOSE";
      bgClass = "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      icon = <Cpu className="w-3 h-3 text-indigo-400" />;
      break;
    case "VERIFY":
      label = "VERIFY";
      bgClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
      icon = <ShieldCheck className="w-3 h-3 text-emerald-400" />;
      break;
    default:
      label = norm;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] space-x-1",
    md: "px-2.5 py-1 text-xs space-x-1.5",
    lg: "px-3 py-1.5 text-sm space-x-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-medium rounded-lg border transition-colors select-none",
        bgClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && icon}
      <span className="tracking-wider">{label}</span>
    </span>
  );
}
