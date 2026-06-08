import { cn } from "@/lib/utils"
import type { SentimentStatus } from "@/lib/dashboard-data"

interface StatusBadgeProps {
  status: SentimentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<SentimentStatus, string> = {
    Strong:
      "bg-[var(--status-strong)]/10 text-[var(--status-strong)] border border-[var(--status-strong)]/25",
    Watch:
      "bg-[var(--status-watch)]/10 text-[var(--status-watch)] border border-[var(--status-watch)]/25",
    Concern:
      "bg-[var(--status-concern)]/10 text-[var(--status-concern)] border border-[var(--status-concern)]/25",
    Stable:
      "bg-[var(--status-stable)]/10 text-[var(--status-stable)] border border-[var(--status-stable)]/25",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide",
        styles[status],
        className
      )}
    >
      {status}
    </span>
  )
}
