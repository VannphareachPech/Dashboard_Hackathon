"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { AreaScore } from "@/types/dashboard";

interface ScoreChartProps {
  areaScores: AreaScore[];
}

// Neutral graduated blue scale: deeper = stronger score.
// No semantic red/amber/green — board-friendly and emotionally neutral.
function barColor(score: number): string {
  if (score >= 4.0) return "#4338ca"; // indigo-700 — highest
  if (score >= 3.5) return "#6366f1"; // indigo-500
  if (score >= 3.0) return "#818cf8"; // indigo-400
  return "#a5b4fc";                   // indigo-300 — lowest
}

function shortLabel(area: string): string {
  const map: Record<string, string> = {
    "Direction & Priorities":    "Direction",
    "Value & Focus":             "Value",
    "Ownership & Empowerment":   "Ownership",
    "Ways of Working":           "Ways",
    "Collaboration & Support":   "Collab",
    "Workload & Sustainability": "Workload",
    "Team Climate & Safety":     "Climate",
  };
  return map[area] ?? area;
}

export default function ScoreChart({ areaScores }: ScoreChartProps) {
  const data = areaScores.map((d) => ({
    ...d,
    shortArea: shortLabel(d.area),
  }));

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-1">
        Pulse Area Scores
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Score out of 5 across pulse categories
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 8, left: -8, bottom: 0 }}
          barCategoryGap="32%"
        >
          <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="shortArea"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#cbd5e1" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as AreaScore & { shortArea: string };
              return (
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs">
                  <p className="font-semibold text-slate-700 mb-1">{d.area}</p>
                  <p className="text-slate-500">
                    Score: <span className="font-semibold text-slate-800">{d.score.toFixed(1)} / 5</span>
                  </p>
                  {d.delta !== undefined && (
                    <p className="text-slate-400 mt-0.5">
                      {d.delta > 0 ? `↑ +${d.delta.toFixed(1)}` : d.delta < 0 ? `↓ ${d.delta.toFixed(1)}` : "→ 0.0"}{" vs last pulse"}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey="score" radius={[3, 3, 0, 0]}>
            <LabelList
              dataKey="score"
              position="top"
              formatter={(v: number) => v.toFixed(1)}
              style={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
            />
            {data.map((entry) => (
              <Cell key={entry.area} fill={barColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
