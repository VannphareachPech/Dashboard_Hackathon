import { Zap } from "lucide-react";

interface FocusAreaProps {
  area: string;
  score: number;
  suggestedAction?: string;
  pulsesAtRisk?: number;
}

export default function FocusArea({ area, score, suggestedAction, pulsesAtRisk }: FocusAreaProps) {
  return (
    <div className="rounded-lg border border-[var(--status-watch)]/25 bg-amber-50/40 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded border border-[var(--status-watch)]/30 text-[var(--status-watch)] bg-transparent w-fit shrink-0">
        <Zap className="size-2.5" />
        Focus{pulsesAtRisk !== undefined ? ` · ${pulsesAtRisk} pulses` : ""}
      </span>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--status-watch)]">{score.toFixed(1)}</span>
        <span className="text-sm text-slate-400">/ 5</span>
        <span className="text-sm font-semibold text-slate-900">{area}</span>
        {suggestedAction && (
          <span className="text-xs text-slate-500">— {suggestedAction}</span>
        )}
      </div>
    </div>
  );
}
