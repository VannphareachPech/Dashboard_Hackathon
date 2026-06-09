"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardData } from "@/lib/dashboard-data"
import { StatusBadge } from "./StatusBadge"
import type { SentimentStatus } from "@/lib/dashboard-data"

function SentimentBar({
  positive,
  mixed,
  negative,
}: {
  positive: number
  mixed: number
  negative: number
}) {
  return (
    <div
      className="flex h-1.5 w-full rounded-full overflow-hidden bg-muted"
      role="img"
      aria-label={`Positive: ${positive}%, Mixed: ${mixed}%, Negative: ${negative}%`}
    >
      <div
        className="h-full"
        style={{ width: `${positive}%`, background: "#16a34a" }}
        title={`Positive: ${positive}%`}
      />
      <div
        className="h-full"
        style={{ width: `${mixed}%`, background: "#ca8a04" }}
        title={`Mixed: ${mixed}%`}
      />
      <div
        className="h-full"
        style={{ width: `${negative}%`, background: "#dc2626" }}
        title={`Negative: ${negative}%`}
      />
    </div>
  )
}

export function SentimentSection() {
  const { sentiment } = dashboardData

  return (
    <section id="sentiment" className="space-y-4 scroll-mt-16">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Sentiment</h2>
        <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">Team Sentiment by Area</p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">Positive, Mixed & Negative Split</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Based on {dashboardData.meta.participation} responses across pulse areas
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: "#16a34a" }} /> Positive
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: "#ca8a04" }} /> Mixed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: "#dc2626" }} /> Negative
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="space-y-3.5">
            {sentiment.map((item) => (
              <div key={item.area}>
                <div className="flex items-center justify-between mb-1.5 gap-4">
                  <span className="text-xs font-medium text-foreground">{item.area}</span>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusBadge status={item.status as SentimentStatus} />
                    <span className="text-xs font-semibold text-foreground tabular-nums w-7 text-right">
                      {item.positive}%
                    </span>
                  </div>
                </div>
                <SentimentBar
                  positive={item.positive}
                  mixed={item.mixed}
                  negative={item.negative}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
