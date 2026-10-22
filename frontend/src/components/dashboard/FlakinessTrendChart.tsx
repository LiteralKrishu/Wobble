"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { MOCK_TREND_DATA } from "@/mock/data";

interface FlakinessTrendChartProps {
  data?: typeof MOCK_TREND_DATA;
}

export function FlakinessTrendChart({
  data = MOCK_TREND_DATA,
}: FlakinessTrendChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] p-6 h-[290px] flex items-center justify-center font-mono text-xs text-zinc-400">
        Loading release stability &amp; flakiness trajectory...
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] p-5 sm:p-6 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Decorative Technical Crosshair */}
      <div className="absolute top-2 right-2 text-[9px] font-mono text-violet-400/40 select-none pointer-events-none" aria-hidden="true">
        +
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[rgba(139,92,246,0.12)] gap-2">
        <div>
          <div className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-semibold">
            [ REGRESSION TRAJECTORY ]
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5">
            Flakiness Trajectory &amp; Empirical Resolution
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            30-day historical flakiness recurrence vs verified clean passes
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
            <span className="text-zinc-300">Active Flakes</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            <span className="text-zinc-300">Verified Fixes</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[210px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFlaky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 2"
              stroke="rgba(139, 92, 246, 0.08)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              fontFamily="var(--font-jetbrains-mono)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              fontFamily="var(--font-jetbrains-mono)"
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-xl bg-[#0d091a] border border-[rgba(139,92,246,0.3)] shadow-[0_8px_30px_rgba(0,0,0,0.8)] font-mono text-xs space-y-1.5">
                      <div className="text-zinc-300 font-semibold border-b border-zinc-800 pb-1">
                        {label}
                      </div>
                      <div className="flex items-center justify-between space-x-4 text-rose-300">
                        <span>Flaky Tests:</span>
                        <span className="font-bold">{payload[0]?.value}</span>
                      </div>
                      {payload[1] && (
                        <div className="flex items-center justify-between space-x-4 text-emerald-300">
                          <span>Verified Fixes:</span>
                          <span className="font-bold">{payload[1]?.value}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="flakyCount"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFlaky)"
              name="Flaky Tests"
            />
            <Area
              type="monotone"
              dataKey="verifiedCount"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVerified)"
              name="Verified Clean"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
