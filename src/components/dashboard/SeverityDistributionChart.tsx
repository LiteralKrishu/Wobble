"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PieChart as PieIcon, Layers } from "lucide-react";
import { MOCK_SEVERITY_DISTRIBUTION } from "@/mock/data";

interface SeverityDistributionChartProps {
  data?: typeof MOCK_SEVERITY_DISTRIBUTION;
}

export function SeverityDistributionChart({
  data = MOCK_SEVERITY_DISTRIBUTION,
}: SeverityDistributionChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <GlassPanel hasCorners className="p-6 h-[320px] flex items-center justify-center font-mono text-xs text-slate-500">
        Loading Category Matrix...
      </GlassPanel>
    );
  }

  return (
    <GlassPanel hasCorners glow="violet" className="p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/30">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
            Flakiness Root Taxonomy
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Empirical breakdown by architectural failure mechanism
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 mt-4">
        {/* Pie Canvas */}
        <div className="h-[180px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="rgba(5, 8, 17, 0.8)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-950/95 border border-white/15 shadow-2xl font-mono text-xs">
                        <div className="text-white font-bold">{item.name}</div>
                        <div className="text-slate-400 mt-1">
                          Share: <span className="text-cyan-300">{item.value}%</span> ({item.count} tests)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 font-mono text-xs">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 text-xs">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{item.value}%</span>
                <span className="text-[11px] text-slate-500">({item.count})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
