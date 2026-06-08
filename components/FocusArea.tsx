interface FocusAreaProps {
  area: string;
  score: number;
  suggestedAction?: string;
  pulsesAtRisk?: number;
}

function borderColor(score: number) {
  if (score >= 4.0) return "border-emerald-400 bg-emerald-50/40";
  if (score >= 3.5) return "border-blue-400 bg-blue-50/40";
  if (score >= 3.0) return "border-amber-400 bg-amber-50/40";
  return "border-rose-400 bg-rose-50/40";
}

function scoreTextColor(score: number) {
  if (score >= 4.0) return "text-emerald-600";
  if (score >= 3.5) return "text-blue-600";
  if (score >= 3.0) return "text-amber-600";
  return "text-rose-600";
}

export default function FocusArea({ area, score, suggestedAction, pulsesAtRisk }: FocusAreaProps) {
  return (
    <div
      className={`rounded-xl border-l-4 p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${borderColor(score)}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Focus This Pulse
          </p>
          {pulsesAtRisk !== undefined && pulsesAtRisk >= 2 && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              ⚠ {pulsesAtRisk} pulses
            </span>
          )}
        </div>
        <p className="text-lg font-bold text-slate-800">{area}</p>
        {suggestedAction && (
          <p className="text-sm text-slate-600 mt-1">
            Suggested: {suggestedAction}
          </p>
        )}
      </div>
      <div className="sm:shrink-0 sm:text-right">
        <p className={`text-4xl font-extrabold ${scoreTextColor(score)}`}>
          {score.toFixed(1)}
        </p>
        <p className="text-xs text-slate-400">out of 5</p>
      </div>
    </div>
  );
}
