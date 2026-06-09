"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { dashboardData } from "@/lib/dashboard-data"

const ScoreTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-md px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary mt-0.5">{payload[0].value.toFixed(1)} / 5</p>
      </div>
    )
  }
  return null
}

function getBarColor(score: number) {
  if (score >= 4.0) return "#16a34a"
  if (score >= 3.5) return "#6366f1"
  if (score >= 3.0) return "#ca8a04"
  return "#dc2626"
}

export function ScoresSection() {
  const { pulseHistory, areaScores } = dashboardData

  return (
    <section id="scores" className="space-y-4 scroll-mt-16">
      {/* Section header */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Scores</h2>
        <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">Pulse History & Area Breakdown</p>
      </div>

      {/* Score over time */}
      <Card className="border-border/60">
        <CardHeader className="pb-1 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Score Over Time</CardTitle>
          <CardDescription className="text-xs">
            Overall sentiment across pulse runs — dashed band = stable zone (3.5–4.0)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="w-full" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pulseHistory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="pulse"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[3.2, 4.2]}
                  tickCount={6}
                />
                <Tooltip content={<ScoreTooltip />} />
                <ReferenceLine y={3.5} stroke="#22c55e50" strokeDasharray="4 4" />
                <ReferenceLine y={4.0} stroke="#22c55e50" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Area scores */}
      <Card className="border-border/60">
        <CardHeader className="pb-1 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Pulse Area Scores</CardTitle>
          <CardDescription className="text-xs">Score out of 5 across pulse categories</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="w-full" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaScores} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 5]}
                  tickCount={6}
                />
                <Tooltip content={<ScoreTooltip />} />
                <ReferenceLine y={3.5} stroke="#94a3b850" strokeDasharray="3 3" />
                <Bar
                  dataKey="score"
                  radius={[4, 4, 0, 0]}
                  label={{ position: "top", fontSize: 10, fill: "#94a3b8" }}
                >
                  {areaScores.map((entry) => (
                    <Cell key={entry.name} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            {[
              { label: "Strong ≥ 4.0", color: "#16a34a" },
              { label: "Stable ≥ 3.5", color: "#6366f1" },
              { label: "Watch ≥ 3.0", color: "#ca8a04" },
              { label: "Concern < 3.0", color: "#dc2626" },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
