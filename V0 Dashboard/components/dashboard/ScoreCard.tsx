"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SentimentStatus } from "@/lib/dashboard-data"

interface ScoreCardProps {
  title: string
  score: string | number
  trend?: number
  status?: SentimentStatus
  subtitle?: string
  size?: "default" | "large"
  className?: string
}

function getStatusColor(status: SentimentStatus) {
  switch (status) {
    case "Strong":
      return "text-[var(--status-strong)] bg-[var(--status-strong)]/10 border-[var(--status-strong)]/20"
    case "Watch":
      return "text-[var(--status-watch)] bg-[var(--status-watch)]/10 border-[var(--status-watch)]/20"
    case "Concern":
      return "text-[var(--status-concern)] bg-[var(--status-concern)]/10 border-[var(--status-concern)]/20"
    case "Stable":
      return "text-[var(--status-stable)] bg-[var(--status-stable)]/10 border-[var(--status-stable)]/20"
  }
}

export function ScoreCard({
  title,
  score,
  trend,
  status,
  subtitle,
  size = "default",
  className,
}: ScoreCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <div
            className={cn(
              "font-bold text-foreground",
              size === "large" ? "text-5xl" : "text-3xl"
            )}
          >
            {score}
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend > 0 && "text-[var(--status-strong)]",
                trend < 0 && "text-[var(--status-concern)]",
                trend === 0 && "text-muted-foreground"
              )}
            >
              {trend > 0 && <TrendingUp data-icon="inline-start" className="size-4" />}
              {trend < 0 && <TrendingDown data-icon="inline-start" className="size-4" />}
              {trend === 0 && <Minus data-icon="inline-start" className="size-4" />}
              {Math.abs(trend).toFixed(1)}
            </div>
          )}
          {status && (
            <Badge variant="outline" className={cn("ml-auto", getStatusColor(status))}>
              {status}
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
