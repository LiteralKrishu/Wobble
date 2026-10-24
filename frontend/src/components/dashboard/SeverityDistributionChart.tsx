"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MOCK_SEVERITY_DISTRIBUTION } from "@/mock/data";

interface SeverityDistributionChartProps {
  data?: typeof MOCK_SEVERITY_DISTRIBUTION;
}

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
      <div className="rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] p-6 h-[290px] flex items-center justify-center font-mono text-xs text-zinc-400">
        Loading failure taxonomy...
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl bg-[#090714]/85 backdrop-blur-xl border border-[rgba(139,92,246,0.18)] p-5 sm:p-6 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Decorative Technical Crosshair */}
      <div className="absolute top-2 right-2 text-[9px] font-mono text-violet-400/40 select-none pointer-events-none" aria-hidden="true">
        +
      </div>

      <div className="pb-3.5 border-b border-[rgba(139,92,246,0.12)]">
        <div className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-semibold">
          [ ROOT CAUSE CLASSIFICATION ]
        </div>
        <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5">
          Failure Mechanism Taxonomy
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Breakdown of isolated root-cause failure vectors
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 mt-4">
        {/* Pie Canvas */}
        <div className="h-[150px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={4}
                dataKey="value"
                stroke="#090714"
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
                      <div className="p-3 rounded-xl bg-[#0d091a] border border-[rgba(139,92,246,0.3)] shadow-[0_8px_30px_rgba(0,0,0,0.8)] font-mono text-xs">
                        <div className="text-white font-semibold">{item.name}</div>
                        <div className="text-violet-300 mt-0.5 font-bold">
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
        <div className="space-y-2 font-mono text-xs">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#120e24] transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor:
                      RESTRAINED_COLORS[idx % RESTRAINED_COLORS.length],
                    boxShadow: `0 0 6px ${RESTRAINED_COLORS[idx % RESTRAINED_COLORS.length]}60`,
                  }}
                />
                <span className="text-zinc-300 truncate max-w-[110px] text-[11px]">
                  {item.name}
                </span>
              </div>
              <span className="text-zinc-400 font-bold text-[11px]">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
