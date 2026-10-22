"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Minimize2, Cpu, RefreshCw } from "lucide-react";
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
        "rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(139,92,246,0.10)] mb-3.5">
        <div>
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Recent Diagnostic Activity
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Log of automated reproductions, delta-debug reductions, and verification passes
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/50 text-violet-300 border border-violet-800/40">
          Telemetry Active
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        {events.slice(0, 4).map((ev) => {
          let icon = <Zap className="w-3.5 h-3.5 text-zinc-400" />;
          let tagColor = "bg-zinc-900 text-zinc-300 border-zinc-800";

          if (ev.type === "VERIFICATION") {
            icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
            tagColor = "bg-emerald-950/40 text-emerald-300 border-emerald-800/60";
          } else if (ev.type === "MINIMIZATION") {
            icon = <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />;
            tagColor = "bg-indigo-950/40 text-indigo-300 border-indigo-800/60";
          } else if (ev.type === "DIAGNOSIS") {
            icon = <Cpu className="w-3.5 h-3.5 text-violet-400" />;
            tagColor = "bg-violet-950/40 text-violet-300 border-violet-800/60";
          } else if (ev.type === "REPRODUCTION") {
            icon = <RefreshCw className="w-3.5 h-3.5 text-amber-400" />;
            tagColor = "bg-amber-950/40 text-amber-300 border-amber-800/60";
          }

          return (
            <div
              key={ev.id}
              className="p-3 rounded-lg bg-[#0c0a14] border border-[rgba(139,92,246,0.10)] flex items-start space-x-3 hover:border-[rgba(139,92,246,0.25)] transition-colors"
            >
              <div className="p-1.5 rounded-md bg-[#130f24] border border-[rgba(139,92,246,0.14)] shrink-0 mt-0.5">
                {icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {ev.investigationId ? (
                      <Link
                        href={`/investigations/${ev.investigationId}`}
                        className="text-violet-400 hover:text-violet-300 font-semibold"
                      >
                        {ev.investigationId}
                      </Link>
                    ) : (
                      <span className="text-zinc-400 font-semibold">{ev.type}</span>
                    )}

                    {ev.tag && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded text-[10px] font-medium border",
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
