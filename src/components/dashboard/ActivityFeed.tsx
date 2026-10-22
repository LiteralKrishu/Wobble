"use client";

import React from "react";
import Link from "next/link";
import { Radio, Zap, ShieldCheck, Minimize2, Cpu, RefreshCw } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TelemetryEvent } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  events: TelemetryEvent[];
  className?: string;
}

export function ActivityFeed({ events, className }: ActivityFeedProps) {
  return (
    <GlassPanel hasCorners className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block absolute inset-0" />
          </div>
          <div>
            <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
              Live Investigation Telemetry Feed
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Real-time diagnostic event bus events
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          STREAM ACTIVE
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {events.map((ev) => {
          let icon = <Zap className="w-3.5 h-3.5 text-cyan-400" />;
          let tagColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";

          if (ev.type === "VERIFICATION") {
            icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
            tagColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
          } else if (ev.type === "MINIMIZATION") {
            icon = <Minimize2 className="w-3.5 h-3.5 text-teal-400" />;
            tagColor = "bg-teal-500/20 text-teal-300 border-teal-500/30";
          } else if (ev.type === "DIAGNOSIS") {
            icon = <Cpu className="w-3.5 h-3.5 text-violet-400" />;
            tagColor = "bg-violet-500/20 text-violet-300 border-violet-500/30";
          } else if (ev.type === "REPRODUCTION") {
            icon = <RefreshCw className="w-3.5 h-3.5 text-amber-400" />;
            tagColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
          }

          return (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start space-x-3 hover:bg-slate-900/90 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5">
                {icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {ev.investigationId ? (
                      <Link
                        href={`/investigations/${ev.investigationId}`}
                        className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                      >
                        {ev.investigationId}
                      </Link>
                    ) : (
                      <span className="text-slate-400 font-bold">{ev.type}</span>
                    )}

                    {ev.tag && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded text-[10px] font-bold border",
                          tagColor
                        )}
                      >
                        {ev.tag}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {formatRelativeTime(ev.timestamp)}
                  </span>
                </div>

                <p className="text-slate-300 text-xs font-sans leading-normal">
                  {ev.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
