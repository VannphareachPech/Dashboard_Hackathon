"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TrendPoint } from "@/types/dashboard";

interface TrendChartProps {
  trends: TrendPoint[];
}

export default function TrendChart({ trends }: TrendChartProps) {
  if (!trends.length) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5 text-sm text-slate-500">
        No pulse history available yet.
      </div>
    );
  }

  const scores = trends.map((t) => t.overallScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const yMin = Math.floor((minScore - 0.2) * 5) / 5;
  const yMax = Math.ceil((maxScore + 0.2) * 5) / 5;

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Score Over Time</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Overall sentiment across pulse runs — dashed band = stable zone (3.5–4.0)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={trends}
          margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="cycle"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickCount={6}
            tickFormatter={(v) => v.toFixed(1)}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={3.5} stroke="#22c55e50" strokeDasharray="4 4" />
          <ReferenceLine y={4.0} stroke="#22c55e50" strokeDasharray="4 4" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-slate-200 rounded-md px-3 py-2 shadow-md text-xs">
                  <p className="font-semibold text-slate-700">{label}</p>
                  <p className="text-indigo-500 mt-0.5">{(payload[0].value as number).toFixed(1)} / 5</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="overallScore"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
