"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { ResponseRawData } from "@/types/dashboard";

const AREA_NAMES = [
  "Direction & Priorities",
  "Value & Focus",
  "Ownership & Empowerment",
  "Ways of Working",
  "Collaboration & Support",
  "Workload & Sustainability",
  "Team Climate & Safety",
];

interface ChartRow {
  pulseLabel: string;
  Positive: number;
  Mixed: number;
  Negative: number;
}

function computeChartData(records: ResponseRawData[]): ChartRow[] {
  if (!records || records.length === 0) return [];

  // Group by "Pulse Cycle"
  const groupMap = new Map<string, { positive: number; mixed: number; negative: number; total: number }>();

  records.forEach((record) => {
    const pulseLabel = String(record["Pulse Cycle"] ?? "").trim();
    if (!pulseLabel) return;

    if (!groupMap.has(pulseLabel)) {
      groupMap.set(pulseLabel, { positive: 0, mixed: 0, negative: 0, total: 0 });
    }
    const group = groupMap.get(pulseLabel)!;

    // Aggregate sentiment across ALL areas for this record
    AREA_NAMES.forEach((area) => {
      const val = record[area];
      if (typeof val !== "number" || isNaN(val)) return;
      group.total += 1;
      if (val >= 4) group.positive += 1;
      else if (val === 3) group.mixed += 1;
      else group.negative += 1;
    });
  });

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pulseLabel, { positive, mixed, negative, total }]) => {
      if (total === 0) return { pulseLabel, Positive: 0, Mixed: 0, Negative: 0 };
      const posPct = Math.round((positive / total) * 100);
      const mixPct = Math.round((mixed / total) * 100);
      const negPct = 100 - posPct - mixPct;
      return { pulseLabel, Positive: posPct, Mixed: mixPct, Negative: negPct };
    });
}

const BarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || value < 5) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + 5}
      fill="#fff"
      fontSize={12}
      fontWeight={600}
      textAnchor="middle"
    >
      {value}%
    </text>
  );
};

interface Props {
  responseAllRawData: ResponseRawData[];
}

export default function OverallResponseMixTrendChart({ responseAllRawData }: Props) {
  const chartData = computeChartData(responseAllRawData);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Overall Response Mix Trend
        </h3>
        <p className="text-sm text-slate-400">No response data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-slate-700">
          Overall Response Mix Trend
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Aggregated sentiment across all survey areas · grouped by pulse cycle
        </p>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
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
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            stroke="#94a3b8"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            label={{
              value: "Share of Responses (%)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "#475569", fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value, name) => [`${Number(value ?? 0)}%`, String(name)]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
          />

          <Bar dataKey="Positive" stackId="a" fill="#1f77b4" isAnimationActive={false}>
            <LabelList content={<BarLabel />} />
          </Bar>
          <Bar dataKey="Mixed" stackId="a" fill="#ff7f0e" isAnimationActive={false}>
            <LabelList content={<BarLabel />} />
          </Bar>
          <Bar dataKey="Negative" stackId="a" fill="#2ca02c" isAnimationActive={false} radius={[4, 4, 0, 0]}>
            <LabelList content={<BarLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
