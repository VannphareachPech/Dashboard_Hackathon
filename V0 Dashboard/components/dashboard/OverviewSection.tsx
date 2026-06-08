import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, AlertTriangle, CheckCircle, Zap } from "lucide-react"
import { dashboardData } from "@/lib/dashboard-data"
import { StatusBadge } from "./StatusBadge"

export function OverviewSection() {
  const { meta, overallScore, previousScore, status, leadershipReadout, atAGlance, focusPulse } =
    dashboardData
  const trend = parseFloat((overallScore - previousScore).toFixed(1))

  return (
    <section id="overview" className="space-y-5 scroll-mt-16">
      {/* Report header */}
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Internal Survey Report
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">B2CSS Pulse Dashboard</h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-0.5 text-xs text-muted-foreground mt-1 sm:mt-0">
          <span>Cycle: <strong className="text-foreground font-medium">{meta.cycle}</strong></span>
          <span>Generated: {meta.generated}</span>
          <span>
            Participation:{" "}
            <strong className="text-foreground font-medium">
              {meta.participation} of {meta.total} ({meta.participationPct}%)
            </strong>
          </span>
        </div>
      </div>

      {/* Hero score */}
      <Card className="border-border/60">
        <CardContent className="py-5 px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Overall Team Sentiment
              </p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-5xl font-bold tracking-tight text-primary">{overallScore}</span>
                <span className="text-lg text-muted-foreground font-light">/ 5</span>
                <StatusBadge status={status} />
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--status-strong)]">
                  <TrendingUp className="size-3.5" />
                  +{trend} vs Apr &apos;26
                </span>
              </div>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-12 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{leadershipReadout}</p>
          </div>
        </CardContent>
      </Card>

      {/* At a glance — compact 3-col */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-1 border-l-2 border-l-[var(--status-stable)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle className="size-3" />
            Overall Status
          </span>
          <span className="text-base font-bold text-foreground">{atAGlance.overallStatus.label}</span>
          <span className="text-xs text-muted-foreground">Score {atAGlance.overallStatus.score}</span>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-1 border-l-2 border-l-[var(--status-strong)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3" />
            Strongest Area
          </span>
          <span className="text-base font-bold text-foreground text-balance">{atAGlance.strongestArea.label}</span>
          <span className="text-xs text-muted-foreground">Score {atAGlance.strongestArea.score} / 5</span>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-1 border-l-2 border-l-[var(--status-concern)]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="size-3" />
            Needs Attention
          </span>
          <span className="text-base font-bold text-foreground text-balance">{atAGlance.needsAttention.label}</span>
          <span className="text-xs text-muted-foreground">Score {atAGlance.needsAttention.score} / 5</span>
        </div>
      </div>

      {/* Focus pulse — inline callout */}
      <div className="rounded-lg border border-[var(--status-watch)]/25 bg-[var(--status-watch)]/4 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
        <Badge
          variant="outline"
          className="shrink-0 text-[var(--status-watch)] border-[var(--status-watch)]/30 bg-transparent text-[10px] font-semibold tracking-wide uppercase gap-1 w-fit"
        >
          <Zap className="size-2.5" />
          Focus · {focusPulse.pulseCount} pulses
        </Badge>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-bold text-[var(--status-watch)]">{focusPulse.score}</span>
          <span className="text-sm text-muted-foreground">/ 5</span>
          <span className="text-sm font-semibold text-foreground">{focusPulse.area}</span>
          <span className="text-xs text-muted-foreground">— {focusPulse.suggestion}</span>
        </div>
      </div>

      {/* Area movement — inline row */}
      <div className="rounded-lg border border-border bg-card px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Area Movement
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {dashboardData.areaMovement.map((area) => (
            <div key={area.name} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{area.name}</span>
              <span className="text-xs font-semibold text-[var(--status-strong)] tabular-nums">
                +{area.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
