import type { SummaryData } from "@/types/dashboard";

interface HeroScoreProps {
  summary: SummaryData;
  prevCycle?: string;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; scoreColor: string; label: string }
> = {
  strong:    { bg: "bg-emerald-50", text: "text-emerald-700", scoreColor: "text-emerald-600", label: "Strong" },
  stable:    { bg: "bg-blue-50",    text: "text-blue-700",    scoreColor: "text-blue-600",    label: "Stable" },
  watch:     { bg: "bg-amber-50",   text: "text-amber-700",   scoreColor: "text-amber-600",   label: "Watch" },
  "at risk": { bg: "bg-rose-50",    text: "text-rose-700",    scoreColor: "text-rose-600",    label: "At Risk" },
};

export default function HeroScore({ summary, prevCycle }: HeroScoreProps) {
  const { overallScore, overallStatus, scoreDelta } = summary;
  const cfg = statusConfig[overallStatus.toLowerCase()] ?? statusConfig["stable"];
  const hasScore = overallScore > 0;

  const deltaUp   = scoreDelta !== undefined && scoreDelta > 0;
  const deltaDown = scoreDelta !== undefined && scoreDelta < 0;
  const deltaFlat = scoreDelta !== undefined && scoreDelta === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Overall Team Sentiment
      </p>

      <div className="flex flex-wrap items-end gap-4">
        {/* Big score number */}
        <div className="flex items-end gap-2">
          <span className={`text-6xl font-extrabold leading-none tracking-tight ${hasScore ? cfg.scoreColor : "text-slate-300"}`}>
            {hasScore ? overallScore.toFixed(1) : "—"}
          </span>
          <span className="text-2xl font-medium text-slate-300 mb-1">/ 5</span>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-1 ${cfg.bg} ${cfg.text}`}
        >
          {cfg.label}
        </span>

        {/* Delta vs previous cycle */}
        {scoreDelta !== undefined && (
          <span
            className={`text-sm font-medium mb-1 ${
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
  );
}
