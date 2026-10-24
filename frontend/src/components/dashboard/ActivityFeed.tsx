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
    <div className={cn("rounded-lg bg-[#111317] border border-[#1e2229] p-4", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2229] mb-3">
        <div>
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Recent Diagnostic Activity
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Log of automated reproductions, delta-debug reductions, and verification passes
          </p>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
          Telemetry Active
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {events.slice(0, 4).map((ev) => {
          let icon = <Zap className="w-3.5 h-3.5 text-zinc-400" />;
          let tagColor = "bg-zinc-800 text-zinc-300 border-zinc-700";

          if (ev.type === "VERIFICATION") {
            icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
            tagColor = "bg-emerald-950/40 text-emerald-300 border-emerald-800/60";
          } else if (ev.type === "MINIMIZATION") {
            icon = <Minimize2 className="w-3.5 h-3.5 text-sky-400" />;
            tagColor = "bg-sky-950/40 text-sky-300 border-sky-800/60";
          } else if (ev.type === "DIAGNOSIS") {
            icon = <Cpu className="w-3.5 h-3.5 text-amber-400" />;
            tagColor = "bg-amber-950/40 text-amber-300 border-amber-800/60";
          } else if (ev.type === "REPRODUCTION") {
            icon = <RefreshCw className="w-3.5 h-3.5 text-amber-400" />;
            tagColor = "bg-amber-950/40 text-amber-300 border-amber-800/60";
          }

          return (
            <div
              key={ev.id}
              className="p-2.5 rounded bg-[#0c0d10] border border-[#1e2229] flex items-start space-x-3 hover:border-zinc-700 transition-colors"
            >
              <div className="p-1 rounded bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                {icon}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {ev.investigationId ? (
                      <Link
                        href={`/investigations/${ev.investigationId}`}
                        className="text-amber-400 hover:underline font-semibold"
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
