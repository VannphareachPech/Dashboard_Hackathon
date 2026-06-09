"use client";
import type { ResponseCountPoint, SummaryData } from "@/types/dashboard";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: ResponseCountPoint[];
  summary?: SummaryData;
}

export default function ResponseCountChart({ data, summary }: Props) {
  if (!data || data.length === 0) return null;

  const counts = data.map((d) => d.responseCount);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const yMin = Math.max(0, Math.floor((minCount - 8) / 5) * 5);
  const yMax = Math.ceil((maxCount + 6) / 5) * 5;
  const latestCycle = data[data.length - 1]?.cycle;
  const latestCount = data[data.length - 1]?.responseCount;
  const teamSize = summary?.teamSize;
  const participationPct = teamSize && latestCount
    ? Math.round((latestCount / teamSize) * 100)
    : undefined;

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">

      {/* KPI stats row */}
      {(latestCount !== undefined || teamSize || participationPct !== undefined) && (
        <div className="grid grid-cols-3 gap-px border-b border-slate-100">
          <div className="px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Latest Responses</p>
            <p className="text-2xl font-bold text-[var(--status-stable)] mt-1 tabular-nums">{latestCount ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-0.5">{latestCycle}</p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Team Size</p>
            <p className="text-2xl font-bold text-slate-800 mt-1 tabular-nums">{teamSize ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total members</p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Response Rate</p>
            <p className="text-2xl font-bold text-[var(--status-strong)] mt-1 tabular-nums">
              {participationPct !== undefined ? `${participationPct}%` : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{latestCount} responded</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Response Count by Pulse</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Number of responses received each pulse cycle
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }} barCategoryGap="38%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="cycle"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-slate-200 rounded-md px-3 py-2 shadow-md text-xs">
                    <p className="font-semibold text-slate-700">{label}</p>
                    <p className="text-indigo-500 mt-0.5">{payload[0].value} responses</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="responseCount" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="responseCount"
                position="top"
                style={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
              />
              {data.map((entry) => (
                <Cell
                  key={entry.cycle}
                  fill={entry.cycle === latestCycle ? "#6366f1" : "#6366f133"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


