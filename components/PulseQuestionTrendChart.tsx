"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ResponseRawData } from "@/types/dashboard";

// Area names matching the Apps Script AREA_NAMES constant
const AREA_NAMES = [
  "Direction & Priorities",
  "Value & Focus",
  "Ownership & Empowerment",
  "Ways of Working",
  "Collaboration & Support",
  "Workload & Sustainability",
  "Team Climate & Safety",
];

// Color palette for each area (matching the chart design)
const AREA_COLORS: Record<string, string> = {
  "Direction & Priorities": "#2563eb",      // blue
  "Value & Focus": "#f97316",               // orange
  "Ownership & Empowerment": "#16a34a",     // green
  "Ways of Working": "#dc2626",             // red
  "Collaboration & Support": "#9333ea",     // purple
  "Workload & Sustainability": "#78716c",   // brown/gray
  "Team Climate & Safety": "#ec4899",       // pink
};

interface Props {
  responseAllRawData: ResponseRawData[];
}

export default function PulseQuestionTrendChart({ responseAllRawData }: Props) {
  if (!responseAllRawData || responseAllRawData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Pulse Question Score Trends
        </h3>
        <p className="text-sm text-slate-400">No trend data available</p>
      </div>
    );
  }

  // Group records by "Pulse Cycle" and compute average score per area
  const groupMap = new Map<string, { sums: Record<string, number>; counts: Record<string, number> }>();

  responseAllRawData.forEach((record) => {
    const pulseLabel = String(record["Pulse Cycle"] ?? "").trim();
    if (!pulseLabel) return;

    if (!groupMap.has(pulseLabel)) {
      groupMap.set(pulseLabel, { sums: {}, counts: {} });
    }
    const group = groupMap.get(pulseLabel)!;

    AREA_NAMES.forEach((area) => {
      const val = record[area];
      if (typeof val === "number" && !isNaN(val)) {
        group.sums[area] = (group.sums[area] ?? 0) + val;
        group.counts[area] = (group.counts[area] ?? 0) + 1;
      }
    });
  });

  // Build chart data array sorted by pulse label
  const chartData = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pulseLabel, { sums, counts }]) => {
      const dataPoint: Record<string, string | number> = { pulseLabel };
      AREA_NAMES.forEach((area) => {
        if (counts[area] > 0) {
          dataPoint[area] = Math.round((sums[area] / counts[area]) * 10) / 10;
        }
      });
      return dataPoint;
    });

    console.log("Processed chart data:", chartData);

  // Custom label component to show values on the last point
  const CustomLabel = (props: any) => {
    const { x, y, value, dataKey, index } = props;
    const isLastPoint = index === chartData.length - 1;
    
    if (!isLastPoint || value == null) return null;
    
    return (
      <text
        x={x}
        y={y - 10}
        fill="#475569"
        fontSize={11}
        fontWeight={600}
        textAnchor="middle"
      >
        {value.toFixed(1)}
      </text>
    );
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Pulse Question Score Trends
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="pulseLabel"
            stroke="#94a3b8"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            domain={[1.0, 5.0]}
            ticks={[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]}
            stroke="#94a3b8"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            label={{
              value: "Average Score",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#475569", fontSize: 12 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: any) => value.toFixed(1)}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            iconType="line"
          />
          
          {/* Render a line for each area */}
          {AREA_NAMES.map((area) => (
            <Line
              key={area}
              type="monotone"
              dataKey={area}
              stroke={AREA_COLORS[area]}
              strokeWidth={2}
              dot={{ r: 4, fill: AREA_COLORS[area] }}
              activeDot={{ r: 6 }}
              label={<CustomLabel />}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
