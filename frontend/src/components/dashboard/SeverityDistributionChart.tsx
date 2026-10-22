"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MOCK_SEVERITY_DISTRIBUTION } from "@/mock/data";

interface SeverityDistributionChartProps {
  data?: typeof MOCK_SEVERITY_DISTRIBUTION;
}

// Sophisticated violet-centric palette for failure causes
const RESTRAINED_COLORS = [
  "#8b5cf6", // Electric Violet (Race Conditions)
  "#6366f1", // Indigo (Shared Mutable State)
  "#38bdf8", // Sky Blue (Timing & Sleeps)
  "#f43f5e", // Rose (Order Dependencies)
];

export function SeverityDistributionChart({
  data = MOCK_SEVERITY_DISTRIBUTION,
}: SeverityDistributionChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 h-[280px] flex items-center justify-center font-mono text-xs text-zinc-500">
        Loading failure taxonomy...
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="pb-3.5 border-b border-[rgba(139,92,246,0.10)]">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Failure Mechanism Taxonomy
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Breakdown of non-deterministic failure causes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 mt-3">
        {/* Pie Canvas */}
        <div className="h-[150px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                stroke="#0f0d18"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={RESTRAINED_COLORS[index % RESTRAINED_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-lg bg-[#140f24] border border-[rgba(139,92,246,0.25)] shadow-xl font-mono text-xs">
                        <div className="text-white font-semibold">{item.name}</div>
                        <div className="text-violet-300 mt-0.5">
                          {item.value}% ({item.count} tests)
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
        <div className="space-y-1.5 font-mono text-xs">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-1.5 rounded-md hover:bg-violet-950/20 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{
                    backgroundColor:
                      RESTRAINED_COLORS[idx % RESTRAINED_COLORS.length],
                  }}
                />
                <span className="text-zinc-300 text-xs">{item.name}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-white">{item.value}%</span>
                <span className="text-[10px] text-zinc-400">({item.count})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
