"use client";
import type { ResponseCountPoint } from "@/types/dashboard";
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

interface Props {
  data: ResponseCountPoint[];
}

function getPulseNumber(label: string): number | null {
  const m = String(label).match(/pulse\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

export default function ResponseCountChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  // Keep timeline left-to-right (Pulse 1 -> Pulse 2) when pulse numbers exist.
  const chartData = [...data].sort((a, b) => {
    const aPulse = getPulseNumber(a.cycle);
    const bPulse = getPulseNumber(b.cycle);
    if (aPulse !== null && bPulse !== null) return aPulse - bPulse;
    return String(a.cycle).localeCompare(String(b.cycle));
  });

  return (
    <div className="h-full bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5 flex flex-col">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-700">Participation by Pulse</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Number of responses received per pulse cycle.
        </p>
      </div>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }} barCategoryGap="45%">
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="cycle"
            interval={0}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => {
              var n = typeof value === "number" ? value : Number(value || 0);
              return [`${n} responses`, "Count"];
            }}
          />
          <Bar
            dataKey="responseCount"
            fill="#818cf8"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
            minPointSize={6}
          >
            <LabelList
              dataKey="responseCount"
              position="top"
              style={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
