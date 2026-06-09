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
  ReferenceArea,
} from "recharts";
import type { TrendPoint } from "@/types/dashboard";

interface TrendChartProps {
  trends: TrendPoint[];
}

function dotColor(score: number): string {
  if (score >= 4.0) return "#6ee7b7";
  if (score >= 3.5) return "#7dd3fc";
  if (score >= 3.0) return "#fde68a";
  return "#fca5a5";
}

export default function TrendChart({ trends }: TrendChartProps) {
  if (!trends.length) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5 text-sm text-slate-500">
        No pulse history available yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Score Over Time</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Overall sentiment score across pulse runs — shaded band = stable zone
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={trends}
          margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
        >
          {/* Stable zone band 3.5 – 4.0 */}
          <ReferenceArea y1={3.5} y2={4.0} fill="#f0f9ff" fillOpacity={0.6} strokeOpacity={0} />

          <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
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
          <ReferenceLine
            y={3.5}
            stroke="#bfdbfe"
            strokeDasharray="4 4"
            label={{ value: "3.5", position: "insideTopRight", fontSize: 10, fill: "#93c5fd" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as TrendPoint;
              const color = dotColor(d.overallScore);
              return (
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-sm">
                  <p className="font-semibold text-slate-700">{d.cycle}</p>
                  <p className="text-slate-500">
                    Score:{" "}
                    <span className="font-bold" style={{ color }}>
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
            stroke="#94a3b8"
            strokeWidth={2}
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, payload } = props as { cx: number; cy: number; payload: TrendPoint };
              const fill = dotColor(payload.overallScore);
              return (
                <circle
                  key={payload.cycle}
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={fill}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
