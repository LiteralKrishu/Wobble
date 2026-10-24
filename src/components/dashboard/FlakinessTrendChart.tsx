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
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TrendingDown, Activity } from "lucide-react";
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
      <GlassPanel hasCorners className="p-6 h-[320px] flex items-center justify-center font-mono text-xs text-slate-500">
        Loading Telemetry Matrix...
      </GlassPanel>
    );
  }

  return (
    <GlassPanel hasCorners glow="cyan" className="p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
              Flakiness Rate &amp; Resolution Velocity
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              30-day historical flakiness trend vs verified fixes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-400">Flaky Tests</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-slate-400">Verified Fixes</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[240px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFlaky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10f596" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10f596" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              fontFamily="var(--font-jetbrains-mono)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="var(--font-jetbrains-mono)"
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-xl bg-slate-950/95 border border-cyan-400/30 shadow-2xl font-mono text-xs">
                      <div className="text-cyan-300 font-bold mb-1.5">{label}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between space-x-4 text-rose-300">
                          <span>Active Flaky Tests:</span>
                          <span className="font-bold">{payload[0]?.value}</span>
                        </div>
                        <div className="flex items-center justify-between space-x-4 text-emerald-300">
                          <span>Verified Fixes:</span>
                          <span className="font-bold">{payload[1]?.value}</span>
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
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFlaky)"
            />
            <Area
              type="monotone"
              dataKey="verified"
              stroke="#10f596"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVerified)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}
