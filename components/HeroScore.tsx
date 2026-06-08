import type { SummaryData } from "@/types/dashboard";

interface HeroScoreProps {
  summary: SummaryData;
  prevCycle?: string;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; scoreColor: string; label: string }
> = {
  strong:    { bg: "bg-indigo-50", text: "text-indigo-700", scoreColor: "text-indigo-600", label: "Strong" },
  stable:    { bg: "bg-indigo-50", text: "text-indigo-700", scoreColor: "text-indigo-600", label: "Stable" },
  watch:     { bg: "bg-indigo-50", text: "text-indigo-700", scoreColor: "text-indigo-600", label: "Watch" },
  "at risk": { bg: "bg-indigo-50", text: "text-indigo-700", scoreColor: "text-indigo-600", label: "At Risk" },
};

export default function HeroScore({ summary, prevCycle }: HeroScoreProps) {
  const { overallScore, overallStatus, scoreDelta } = summary;
  const cfg = statusConfig[overallStatus.toLowerCase()] ?? statusConfig["stable"];
  const hasScore = overallScore > 0;

  const deltaUp   = scoreDelta !== undefined && scoreDelta > 0;
  const deltaDown = scoreDelta !== undefined && scoreDelta < 0;
  const deltaFlat = scoreDelta !== undefined && scoreDelta === 0;

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2.5">
        Overall Team Sentiment
      </p>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Big score number */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-end gap-2">
            <span className={`text-4xl sm:text-5xl font-bold leading-none tracking-tight transition-colors duration-300 ${hasScore ? cfg.scoreColor : "text-slate-300"}`}>
              {hasScore ? overallScore.toFixed(1) : "—"}
            </span>
            <span className="text-lg font-medium text-slate-400">/ 5</span>
          </div>

          <span
            className={`mb-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
          >
            {cfg.label}
          </span>

          {scoreDelta !== undefined && (
            <span
              className={`mb-1 text-xs font-medium ${
                deltaUp   ? "text-emerald-600" :
                deltaDown ? "text-rose-600"    :
                            "text-slate-400"
              }`}
            >
              {deltaUp   && "↑ +"}
              {deltaDown && "↓ "}
              {deltaFlat && "→ "}
              {Math.abs(scoreDelta).toFixed(1)}
              {prevCycle && ` from ${prevCycle}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
