"use client";

import {
  LineChart,
  Line,
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-sm text-slate-400">
        No trend data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-base font-semibold text-slate-700 mb-1">
        Score Trend
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Overall average score across survey cycles
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={trends}
          margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="cycle"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[2.5, 5]}
            ticks={[2.5, 3, 3.5, 4, 4.5, 5]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          {/* Reference line at the "Stable" threshold */}
          <ReferenceLine
            y={3.5}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            label={{ value: "3.5 threshold", position: "insideTopRight", fontSize: 10, fill: "#cbd5e1" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as TrendPoint;
              return (
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-sm">
                  <p className="font-semibold text-slate-700">{d.cycle}</p>
                  <p className="text-slate-500">
                    Score:{" "}
                    <span className="font-bold text-slate-900">
                      {d.overallScore.toFixed(1)}
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="overallScore"
            stroke="#4F6EF7"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "#4F6EF7", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
