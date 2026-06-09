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
  ReferenceLine,
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

export default function ScoreChart({ areaScores }: ScoreChartProps) {
  const data = [...areaScores];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <h2 className="text-lg font-semibold text-slate-700 mb-1">
        Pulse Area Scores
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        How each engagement area is scoring this cycle, out of 5.
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
          barCategoryGap="32%"
        >
          <CartesianGrid strokeDasharray="0" stroke="#e2e8f0" strokeOpacity={0.6} horizontal={false} vertical={true} />
          <XAxis
            type="number"
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="area"
            width={190}
            tick={(props) => (
              <text
                x={Number(props.x) - 185}
                y={props.y}
                dy={4}
                textAnchor="start"
                fontSize={14}
                fill="#334155"
                fontWeight={500}
              >
                {props.payload.value}
              </text>
            )}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip active={false} />
          <Bar dataKey="score" radius={[0, 3, 3, 0]}>
            <LabelList
              dataKey="score"
              position="right"
              formatter={(v: unknown) => (typeof v === "number" ? v.toFixed(1) : String(v ?? ""))}
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
