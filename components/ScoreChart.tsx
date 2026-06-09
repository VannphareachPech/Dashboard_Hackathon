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
} from "recharts";
import type { AreaScore } from "@/types/dashboard";

interface ScoreChartProps {
  areaScores: AreaScore[];
}

// Colour each bar based on score value
function barColor(score: number): string {
  if (score >= 4.0) return "#34d399"; // emerald — strong
  if (score >= 3.5) return "#60a5fa"; // blue — stable
  if (score >= 3.0) return "#fbbf24"; // amber — watch
  return "#f87171";                   // red — at risk
}

// Shorten long area names for X-axis readability
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-base font-semibold text-slate-700 mb-1">
        Area Scores
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Score out of 5 — colour indicates health
      </p>

      {/* Colour legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
        {[
          { color: "#34d399", label: "Strong (≥ 4.0)" },
          { color: "#60a5fa", label: "Stable (≥ 3.5)" },
          { color: "#fbbf24", label: "Watch (≥ 3.0)" },
          { color: "#f87171", label: "At Risk (< 3.0)" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 16, left: -8, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="shortArea"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as AreaScore & { shortArea: string };
              return (
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-sm">
                  <p className="font-semibold text-slate-700">{d.area}</p>
                  <p className="text-slate-500">
                    Score:{" "}
                    <span className="font-bold text-slate-900">{d.score.toFixed(1)}</span>
                  </p>
                  {d.delta !== undefined && (
                    <p className={d.delta > 0 ? "text-emerald-600" : d.delta < 0 ? "text-rose-600" : "text-slate-400"}>
                      {d.delta > 0 ? `↑ +${d.delta.toFixed(1)}` : d.delta < 0 ? `↓ ${d.delta.toFixed(1)}` : "→ 0.0"}{" vs last pulse"}
                    </p>
                  )}
                  {d.pulsesAtRisk !== undefined && d.pulsesAtRisk >= 2 && (
                    <p className="text-amber-600">⚠ {d.pulsesAtRisk} consecutive pulses at risk</p>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.area} fill={barColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
