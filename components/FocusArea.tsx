interface FocusAreaProps {
  area: string;
  score: number;
  suggestedAction?: string;
  pulsesAtRisk?: number;
}

function focusAccent() {
  return "border-amber-400 bg-amber-50/45";
}

function scoreTextColor() {
  return "text-amber-700";
}

export default function FocusArea({ area, score, suggestedAction, pulsesAtRisk }: FocusAreaProps) {
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
        <div className="flex items-end gap-1.5 sm:shrink-0">
          <span className={`text-4xl sm:text-5xl font-bold leading-none tracking-tight ${scoreTextColor()}`}>
            {score.toFixed(1)}
          </span>
          <span className="mb-1 text-lg font-medium text-slate-400">/ 5</span>
        </div>

        <div className="flex-1">
        <p className="text-lg font-semibold text-slate-900">{area}</p>
        {suggestedAction && (
          <p className="text-sm text-slate-600 mt-1">
            Suggested: {suggestedAction}
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
