import type { AreaScore } from "@/types/dashboard";

interface SignalStripProps {
  areaScores: AreaScore[];
}

export default function SignalStrip({ areaScores }: SignalStripProps) {
  const withDelta = areaScores.filter((a) => a.delta !== undefined);
  if (!withDelta.length) return null;

  return (
    <div className="rounded-lg border border-slate-200/60 bg-white px-5 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Area Movement
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {withDelta.map((a) => {
          const d = a.delta!;
          const isUp = d > 0;
          const isFlat = d === 0;
          return (
            <div key={a.area} className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{a.area}</span>
              {isFlat ? (
                <span className="text-xs text-slate-400 tabular-nums">→ 0.0</span>
              ) : (
                <span className={`text-xs font-semibold tabular-nums ${
                  isUp ? "text-[var(--status-strong)]" : "text-[var(--status-concern)]"
                }`}>
                  {isUp ? `+${d.toFixed(1)}` : d.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
