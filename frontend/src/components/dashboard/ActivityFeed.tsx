"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Minimize2, Cpu, RefreshCw, ArrowUpRight } from "lucide-react";
import { TelemetryEvent } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  events: TelemetryEvent[];
  className?: string;
}

export function ActivityFeed({ events, className }: ActivityFeedProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(139,92,246,0.12)] mb-4">
        <div>
          <div className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-semibold">
            [ CI TELEMETRY STREAM ]
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5">
            Recent Diagnostic &amp; Empirical Activity
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time feed of automated reproductions, delta-debug reductions, and stress verifications
          </p>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Pulse</span>
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {events.slice(0, 4).map((ev) => {
          let icon = <Zap className="w-3.5 h-3.5 text-zinc-400" />;
          let tagColor = "bg-zinc-900 text-zinc-300 border-zinc-800";

          if (ev.type === "VERIFICATION") {
            icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
            tagColor = "bg-emerald-950/50 text-emerald-300 border-emerald-700/60";
          } else if (ev.type === "MINIMIZATION") {
            icon = <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />;
            tagColor = "bg-indigo-950/50 text-indigo-300 border-indigo-700/60";
          } else if (ev.type === "DIAGNOSIS") {
            icon = <Cpu className="w-3.5 h-3.5 text-violet-400" />;
            tagColor = "bg-violet-950/50 text-violet-300 border-violet-700/60";
          } else if (ev.type === "REPRODUCTION") {
            icon = <RefreshCw className="w-3.5 h-3.5 text-amber-400" />;
            tagColor = "bg-amber-950/50 text-amber-300 border-amber-700/60";
          }

          return (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl bg-[#0c0818]/90 border border-[rgba(139,92,246,0.12)] flex items-start space-x-3.5 hover:border-[rgba(139,92,246,0.3)] hover:bg-[#110d22] transition-all group"
            >
              <div className="p-2 rounded-lg bg-[#140f26] border border-[rgba(139,92,246,0.18)] shrink-0 mt-0.5">
                {icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {ev.investigationId ? (
                      <Link
                        href={`/investigations/${ev.investigationId}`}
                        className="text-violet-400 hover:text-violet-300 font-bold flex items-center space-x-1"
                      >
                        <span>{ev.investigationId}</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-violet-300 transition-colors" />
                      </Link>
                    ) : (
                      <span className="text-zinc-400 font-bold">{ev.type}</span>
                    )}

                    {ev.tag && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border",
                          tagColor
                        )}
                      >
                        {ev.tag}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-400">
                    {formatRelativeTime(ev.timestamp)}
                  </span>
                </div>

                <p className="text-zinc-300 text-xs font-sans leading-normal">
                  {ev.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
