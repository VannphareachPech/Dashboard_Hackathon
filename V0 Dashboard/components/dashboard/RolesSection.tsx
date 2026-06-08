import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { dashboardData } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

function ScoreCell({ score }: { score: number }) {
  function color(s: number) {
    if (s >= 4.0) return "text-[var(--status-strong)]"
    if (s >= 3.5) return "text-[var(--status-stable)]"
    if (s >= 3.0) return "text-[var(--status-watch)]"
    return "text-[var(--status-concern)]"
  }
  return (
    <td className={cn("px-4 py-2.5 text-center text-xs font-semibold tabular-nums", color(score))}>
      {score.toFixed(1)}
    </td>
  )
}

export function RolesSection() {
  const { roleSplit } = dashboardData

  return (
    <section id="roles" className="space-y-4 scroll-mt-16">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Roles</h2>
        <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">Score by Role Group</p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm font-semibold">Role Split Comparison</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Larger gaps indicate differing team experiences across roles
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              {[
                { label: "Strong", color: "var(--status-strong)" },
                { label: "Stable", color: "var(--status-stable)" },
                { label: "Watch", color: "var(--status-watch)" },
                { label: "At Risk", color: "var(--status-concern)" },
              ].map(({ label, color }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-1 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Pulse Area
                </th>
                <th className="px-4 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Product Mgmt
                </th>
                <th className="px-4 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Product Dev
                </th>
                <th className="px-4 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Shared / Enabled
                </th>
                <th className="px-4 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Role Gap
                </th>
              </tr>
            </thead>
            <tbody>
              {roleSplit.map((row, i) => (
                <tr
                  key={row.area}
                  className={cn(
                    "border-b border-border/40 hover:bg-muted/30 transition-colors",
                    i % 2 !== 0 && "bg-muted/15"
                  )}
                >
                  <td className="px-5 py-2.5 font-medium text-foreground text-xs">{row.area}</td>
                  <ScoreCell score={row.pm} />
                  <ScoreCell score={row.pd} />
                  <ScoreCell score={row.shared} />
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                        row.gapFlag
                          ? "text-[var(--status-concern)]"
                          : "text-muted-foreground"
                      )}
                    >
                      {row.gapFlag && <AlertTriangle className="size-3" />}
                      {row.gap.toFixed(1)}
                    </span>
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
