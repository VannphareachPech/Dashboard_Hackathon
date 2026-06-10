"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { ResponseRawData } from "@/types/dashboard";

interface ChartRow {
  pulseLabel: string;
  Responses: number;
}

function computeChartData(records: ResponseRawData[]): ChartRow[] {
  if (!records || records.length === 0) return [];

  const countMap = new Map<string, number>();

  records.forEach((record) => {
    const pulseLabel = String(record["Pulse Cycle"] ?? "").trim();
    if (!pulseLabel) return;
    countMap.set(pulseLabel, (countMap.get(pulseLabel) ?? 0) + 1);
  });

  return Array.from(countMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pulseLabel, count]) => ({ pulseLabel, Responses: count }));
}

interface Props {
  responseAllRawData: ResponseRawData[];
}

export default function ResponseCountByPulseChart({ responseAllRawData }: Props) {
  const chartData = computeChartData(responseAllRawData);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
        <h3 className="text-lg font-semibold text-slate-700">Response Count by Pulse</h3>
        <p className="text-sm text-slate-400 mt-3">No response data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-slate-700">
          Response Count by Pulse
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Number of responses submitted per pulse cycle
        </p>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="pulseLabel"
            stroke="#94a3b8"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            label={{
              value: "Pulse",
              position: "insideBottom",
              offset: -10,
              style: { fill: "#475569", fontSize: 12 },
            }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Responses",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "#475569", fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value) => [Number(value ?? 0), "Responses"]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="Responses" fill="#1f77b4" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="Responses"
              position="top"
              style={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
