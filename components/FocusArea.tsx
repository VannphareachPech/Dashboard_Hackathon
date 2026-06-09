interface FocusAreaProps {
  area: string;
  score: number;
  suggestedAction?: string;
  pulsesAtRisk?: number;
  areaRank?: number;
  totalAreas?: number;
  gapFromOverall?: number;
  previousScore?: number;
}

function focusAccent() {
  return "border-amber-400 bg-amber-50/45";
}

function scoreTextColor() {
  return "text-amber-700";
}

export default function FocusArea({
  area,
  score,
  suggestedAction,
  pulsesAtRisk,
  areaRank,
  totalAreas,
  gapFromOverall,
  previousScore,
}: FocusAreaProps) {
  var hasPrevious = typeof previousScore === "number" && !Number.isNaN(previousScore);
  var trendDelta = hasPrevious ? Math.round((score - (previousScore as number)) * 10) / 10 : undefined;

  var gapLabel = "On par with overall";
  if (typeof gapFromOverall === "number" && !Number.isNaN(gapFromOverall)) {
    if (gapFromOverall < 0) {
      gapLabel = `${Math.abs(gapFromOverall).toFixed(1)} below overall`;
    } else if (gapFromOverall > 0) {
      gapLabel = `+${gapFromOverall.toFixed(1)} above overall`;
    }
  }

  return (
    <div
      className={`rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-l-4 px-4 py-3.5 ${focusAccent()}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Focus This Pulse
        </p>
        {pulsesAtRisk !== undefined && pulsesAtRisk >= 2 && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            ⚠ {pulsesAtRisk} pulses
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-col items-start sm:shrink-0 gap-1">
          <div className="flex items-end gap-1.5">
            <span className={`text-4xl sm:text-5xl font-bold leading-none tracking-tight ${scoreTextColor()}`}>
              {score.toFixed(1)}
            </span>
            <span className="mb-1 text-lg font-medium text-slate-400">/ 5</span>
          </div>
          {typeof areaRank === "number" && typeof totalAreas === "number" && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              Lowest of {totalAreas} areas
            </span>
          )}
        </div>

        <div className="flex-1">
        <p className="text-lg font-semibold text-slate-900">{area}</p>
        <div className="mt-2 flex flex-wrap gap-2">
        </div>

        {hasPrevious && (
          <p className="mt-2 text-xs text-slate-500">
            Last pulse: {(previousScore as number).toFixed(1)} 
            <span className="mx-1 text-slate-300">→</span>
            {score.toFixed(1)}
            {typeof trendDelta === "number" && (
              <span className={trendDelta > 0 ? "text-emerald-600" : trendDelta < 0 ? "text-rose-600" : "text-slate-500"}>
                {trendDelta > 0 ? ` (+${trendDelta.toFixed(1)})` : trendDelta < 0 ? ` (${trendDelta.toFixed(1)})` : " (0.0)"}
              </span>
            )}
          </p>
        )}

        <div className="mt-2 rounded-md border border-amber-200/70 bg-amber-50/60 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">Recommended Next Step</p>
          <p className="mt-1 text-sm text-slate-700">
            {suggestedAction || "Define one concrete action with owner and target date before the next pulse."}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
