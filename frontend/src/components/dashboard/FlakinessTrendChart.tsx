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
      <div className="rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 h-[280px] flex items-center justify-center font-mono text-xs text-zinc-500">
        Loading historical stability trend...
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[rgba(139,92,246,0.10)] gap-2">
        <div>
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Release Stability &amp; Flakiness Trajectory
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            30-day historical flakiness recurrence vs verified fixes
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-sm bg-rose-400" />
            <span className="text-zinc-400">Flaky Tests</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-sm bg-emerald-400" />
            <span className="text-zinc-400">Verified Clean</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[210px] w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFlaky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
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
                    <div className="p-3 rounded-lg bg-[#140f24] border border-[rgba(139,92,246,0.25)] shadow-xl font-mono text-xs">
                      <div className="text-white font-semibold mb-1">{label}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between space-x-4 text-rose-400">
                          <span>Active Flaky Tests:</span>
                          <span className="font-semibold">{payload[0]?.value}</span>
                        </div>
                        <div className="flex items-center justify-between space-x-4 text-emerald-400">
                          <span>Verified Fixes:</span>
                          <span className="font-semibold">{payload[1]?.value}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="flaky"
              stroke="#f43f5e"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorFlaky)"
            />
            <Area
              type="monotone"
              dataKey="verified"
              stroke="#10b981"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorVerified)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
