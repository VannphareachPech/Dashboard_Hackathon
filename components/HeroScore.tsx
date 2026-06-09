import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SummaryData } from "@/types/dashboard";

interface HeroScoreProps {
  summary: SummaryData;
  prevCycle?: string;
  narrativeSummary?: string;
}

function statusStyle(status: string): { badge: string; score: string; label: string } {
  switch (status.toLowerCase()) {
    case "strong":  return { badge: "bg-[var(--status-strong)]/10 text-[var(--status-strong)] border border-[var(--status-strong)]/25",  score: "text-[var(--status-strong)]",  label: "Strong"  };
    case "watch":   return { badge: "bg-[var(--status-watch)]/10 text-[var(--status-watch)] border border-[var(--status-watch)]/25",      score: "text-[var(--status-watch)]",   label: "Watch"   };
    case "at risk": return { badge: "bg-[var(--status-concern)]/10 text-[var(--status-concern)] border border-[var(--status-concern)]/25", score: "text-[var(--status-concern)]", label: "At Risk" };
    default:        return { badge: "bg-[var(--status-stable)]/10 text-[var(--status-stable)] border border-[var(--status-stable)]/25",   score: "text-[var(--status-stable)]",  label: "Stable"  };
  }
}

export default function HeroScore({ summary, prevCycle, narrativeSummary }: HeroScoreProps) {
  const { overallScore, overallStatus, scoreDelta } = summary;
  const cfg = statusStyle(overallStatus);
  const hasScore = overallScore > 0;

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 py-5 px-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
        Overall Team Sentiment
      </p>

      <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        {/* Score block */}
        <div className="shrink-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className={`text-5xl font-bold tracking-tight ${hasScore ? cfg.score : "text-slate-300"}`}>
              {hasScore ? overallScore.toFixed(1) : "—"}
            </span>
            <span className="text-lg font-light text-slate-400">/ 5</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${cfg.badge}`}>
              {cfg.label}
            </span>
            {scoreDelta !== undefined && (
              <span className={`flex items-center gap-1 text-xs font-semibold ${
                scoreDelta > 0 ? "text-[var(--status-strong)]" :
                scoreDelta < 0 ? "text-[var(--status-concern)]" :
                "text-slate-400"
              }`}>
                {scoreDelta > 0 && <TrendingUp className="size-3.5" />}
                {scoreDelta < 0 && <TrendingDown className="size-3.5" />}
                {scoreDelta === 0 && <Minus className="size-3.5" />}
                {scoreDelta > 0 ? `+${scoreDelta.toFixed(1)}` : scoreDelta.toFixed(1)}
                {prevCycle && ` vs ${prevCycle}`}
              </span>
            )}
          </div>
        </div>

        {/* Vertical separator + narrative */}
        {narrativeSummary && (
          <>
            <div className="hidden md:block w-px h-12 bg-slate-200 shrink-0" />
            <p className="text-sm text-slate-500 leading-relaxed">{narrativeSummary}</p>
          </>
        )}
      </div>
    </div>
  );
}
