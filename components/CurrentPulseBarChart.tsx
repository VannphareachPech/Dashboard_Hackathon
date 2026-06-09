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
  Cell,
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
  area: string;
  Positive: number;
  Mixed: number;
  Negative: number;
}

function computeChartData(records: ResponseRawData[]): ChartRow[] {
  if (!records || records.length === 0) return [];

  return AREA_NAMES.map((area) => {
    let positive = 0;
    let mixed = 0;
    let negative = 0;
    let total = 0;

    records.forEach((record) => {
      const val = record[area];
      if (typeof val !== "number" || isNaN(val)) return;
      total += 1;
      if (val >= 4) positive += 1;
      else if (val === 3) mixed += 1;
      else negative += 1;
    });

    if (total === 0) return { area, Positive: 0, Mixed: 0, Negative: 0 };

    const posPct = Math.round((positive / total) * 100);
    const mixPct = Math.round((mixed / total) * 100);
    const negPct = 100 - posPct - mixPct;

    return { area, Positive: posPct, Mixed: mixPct, Negative: negPct };
  });
}

// Render % label inside each bar segment (only show if >= 5% to avoid clutter)
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
  responseCurrentRawData: ResponseRawData[];
}

export default function CurrentPulseBarChart({ responseCurrentRawData }: Props) {
  const chartData = computeChartData(responseCurrentRawData);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Current Pulse Response Mix by Question
        </h3>
        <p className="text-sm text-slate-400">No response data available</p>
      </div>
    );
  }

  const sampleN = responseCurrentRawData.length;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-slate-700">
          Current Pulse Response Mix by Question
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Response sentiment by area · current pulse · n={sampleN}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="area"
            stroke="#94a3b8"
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            interval={0}
            width={60}
            angle={0}
            tickFormatter={(v: string) => {
              // Wrap long labels by replacing " & " and spaces for display
              return v;
            }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            stroke="#94a3b8"
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickFormatter={(v: number) => `${v}`}
            label={{
              value: "Share of Responses (%)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "#475569", fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}%`, name]}
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
