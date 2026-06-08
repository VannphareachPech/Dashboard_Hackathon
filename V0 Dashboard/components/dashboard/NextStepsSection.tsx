import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Calendar } from "lucide-react"
import { dashboardData } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import type { ActionStatus } from "@/lib/dashboard-data"

function ActionStatusBadge({ status }: { status: ActionStatus }) {
  const variants: Record<ActionStatus, { label: string; className: string; icon: React.ReactNode }> = {
    "In Progress": {
      label: "In Progress",
      className: "bg-[var(--status-stable)]/10 text-[var(--status-stable)] border-[var(--status-stable)]/20",
      icon: <Clock className="size-2.5" />,
    },
    Planned: {
      label: "Planned",
      className: "bg-[var(--status-watch)]/10 text-[var(--status-watch)] border-[var(--status-watch)]/20",
      icon: <Calendar className="size-2.5" />,
    },
    Completed: {
      label: "Completed",
      className: "bg-[var(--status-strong)]/10 text-[var(--status-strong)] border-[var(--status-strong)]/20",
      icon: <CheckCircle className="size-2.5" />,
    },
  }

  const v = variants[status]
  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1 text-[10px] font-semibold py-0.5", v.className)}
    >
      {v.icon}
      {v.label}
    </Badge>
  )
}

export function NextStepsSection() {
  const { emergingThemes, leadershipActions } = dashboardData

  return (
    <section id="next-steps" className="space-y-4 scroll-mt-16">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Next Steps</h2>
        <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">Themes & Leadership Actions</p>
      </div>

      {/* Emerging themes */}
      <Card className="border-border/60">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Emerging Themes</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Themes repeatedly raised across pulse feedback over time
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-1 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Theme", "Mentions", "Recurrence", "Suggested Response"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emergingThemes.map((theme, i) => (
                <tr
                  key={theme.theme}
                  className={cn(
                    "border-b border-border/40 hover:bg-muted/30 transition-colors",
                    i % 2 !== 0 && "bg-muted/15"
                  )}
                >
                  <td className="px-5 py-2.5 font-semibold text-foreground">{theme.theme}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${Math.min(theme.mentions * 6, 72)}px` }}
                      />
                      <span className="text-muted-foreground tabular-nums">{theme.mentions}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
                        theme.recurrence >= 3
                          ? "bg-[var(--status-concern)]/10 text-[var(--status-concern)]"
                          : theme.recurrence === 2
                          ? "bg-[var(--status-watch)]/10 text-[var(--status-watch)]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {theme.recurrence}×
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-muted-foreground">{theme.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Leadership actions */}
      <Card className="border-border/60">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Leadership Actions</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Actions currently underway in response to pulse feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-1 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Action", "Focus Area", "Started", "Owner", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leadershipActions.map((action, i) => (
                <tr
                  key={action.action}
                  className={cn(
                    "border-b border-border/40 hover:bg-muted/30 transition-colors",
                    i % 2 !== 0 && "bg-muted/15"
                  )}
                >
                  <td className="px-5 py-2.5 font-medium text-foreground">{action.action}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{action.focusArea}</td>
                  <td className="px-5 py-2.5 text-muted-foreground tabular-nums">{action.started}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{action.owner}</td>
                  <td className="px-5 py-2.5">
                    <ActionStatusBadge status={action.status as ActionStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  )
}
