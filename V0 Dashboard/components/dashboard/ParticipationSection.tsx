"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { dashboardData } from "@/lib/dashboard-data"

const CustomTooltip = ({
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
        <p className="text-primary mt-0.5">{payload[0].value} responses</p>
      </div>
    )
  }
  return null
}

export function ParticipationSection() {
  const { participationTrend, meta } = dashboardData
  const latest = participationTrend[participationTrend.length - 1]

  return (
    <section id="participation" className="space-y-4 scroll-mt-16">
      {/* Section header */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Participation</h2>
        <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">Response Trend</p>
      </div>

      {/* KPI row — compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Latest Responses</p>
          <p className="text-2xl font-bold text-primary mt-1 tabular-nums">{latest.count}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{latest.pulse}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Team Size</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{meta.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total members</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Response Rate</p>
          <p className="text-2xl font-bold text-[var(--status-strong)] mt-1 tabular-nums">{meta.participationPct}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">{meta.participation} responded</p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-1 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Response Count by Pulse</CardTitle>
          <CardDescription className="text-xs">Number of responses received each pulse cycle</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="w-full" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationTrend} barCategoryGap="38%">
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
                  domain={[30, 55]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {participationTrend.map((entry, index) => (
                    <Cell
                      key={entry.pulse}
                      fill={
                        index === participationTrend.length - 1
                          ? "#6366f1"
                          : "#6366f133"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
