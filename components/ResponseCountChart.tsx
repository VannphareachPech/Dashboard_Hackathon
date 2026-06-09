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

export default function ResponseCountChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Response Count by Pulse</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Number of responses received each pulse cycle
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="cycle"
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
          <Bar dataKey="responseCount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="responseCount"
              position="top"
              style={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
