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
  let bgClass = "bg-zinc-800/60 text-zinc-300 border-zinc-700/80";
  let icon = <Clock className="w-3 h-3 text-zinc-400" />;

  switch (norm) {
    case "VERIFIED":
      label = "VERIFIED";
      bgClass = "bg-emerald-950/50 text-emerald-400 border-emerald-800/70";
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      break;
    case "DIAGNOSED":
      label = "DIAGNOSED";
      bgClass = "bg-sky-950/50 text-sky-400 border-sky-800/70";
      icon = <Cpu className="w-3 h-3 text-sky-400" />;
      break;
    case "MINIMIZED":
      label = "MINIMIZED";
      bgClass = "bg-zinc-900 text-zinc-300 border-zinc-700";
      icon = <GitCommit className="w-3 h-3 text-zinc-400" />;
      break;
    case "REPRODUCED":
      label = "REPRODUCED";
      bgClass = "bg-amber-950/50 text-amber-400 border-amber-800/70";
      icon = <RefreshCw className="w-3 h-3 text-amber-400" />;
      break;
    case "INVESTIGATING":
      label = "INVESTIGATING";
      bgClass = "bg-amber-950/50 text-amber-400 border-amber-800/70";
      icon = <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />;
      break;
    case "FAILED":
      label = "FAILED";
      bgClass = "bg-red-950/50 text-red-400 border-red-800/70";
      icon = <XCircle className="w-3 h-3 text-red-400" />;
      break;
    case "PASSED":
      label = "PASSED";
      bgClass = "bg-emerald-950/50 text-emerald-400 border-emerald-800/70";
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      break;
    case "TIMEOUT":
      label = "TIMEOUT";
      bgClass = "bg-amber-950/50 text-amber-400 border-amber-800/70";
      icon = <AlertTriangle className="w-3 h-3 text-amber-400" />;
      break;
    case "INCONCLUSIVE":
      label = "INCONCLUSIVE";
      bgClass = "bg-zinc-900 text-zinc-400 border-zinc-700";
      icon = <HelpCircle className="w-3 h-3 text-zinc-400" />;
      break;
    // Stages
    case "DETECT":
      label = "DETECT";
      bgClass = "bg-zinc-900 text-zinc-300 border-zinc-700";
      icon = <Clock className="w-3 h-3 text-zinc-400" />;
      break;
    case "REPRODUCE":
      label = "REPRODUCE";
      bgClass = "bg-amber-950/50 text-amber-400 border-amber-800/70";
      icon = <RefreshCw className="w-3 h-3 text-amber-400" />;
      break;
    case "MINIMIZE":
      label = "MINIMIZE";
      bgClass = "bg-zinc-900 text-zinc-300 border-zinc-700";
      icon = <GitCommit className="w-3 h-3 text-zinc-400" />;
      break;
    case "DIAGNOSE":
      label = "DIAGNOSE";
      bgClass = "bg-sky-950/50 text-sky-400 border-sky-800/70";
      icon = <Cpu className="w-3 h-3 text-sky-400" />;
      break;
    case "VERIFY":
      label = "VERIFY";
      bgClass = "bg-emerald-950/50 text-emerald-400 border-emerald-800/70";
      icon = <ShieldCheck className="w-3 h-3 text-emerald-400" />;
      break;
    default:
      label = norm;
  }

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] space-x-1",
    md: "px-2 py-0.5 text-xs space-x-1.5",
    lg: "px-2.5 py-1 text-xs space-x-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-medium rounded border select-none",
        bgClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && icon}
      <span className="tracking-wide text-[11px]">{label}</span>
    </span>
  );
}
