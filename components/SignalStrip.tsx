import type { AreaScore } from "@/types/dashboard";

interface SignalStripProps {
  areaScores: AreaScore[];
}

export default function SignalStrip({ areaScores }: SignalStripProps) {
  const withDelta = areaScores.filter((a) => a.delta !== undefined);
  if (!withDelta.length) return null;

  // Sort by absolute delta descending so biggest movers appear first
  const sorted = [...withDelta].sort(
    (a, b) => Math.abs(b.delta!) - Math.abs(a.delta!)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2">
        Area Movement
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-1.5">
        {sorted.map((a) => {
          const d = a.delta!;
          const isFlat = d === 0;
          const isUp   = d > 0;
          const isBig  = Math.abs(d) >= 0.3;

          return (
            <div key={a.area} className="flex items-center justify-between gap-2 min-w-0" title={a.area}>
              <span className="text-xs font-medium leading-5 text-slate-700">
                {a.area}
              </span>

              {isFlat ? (
                <span className="text-xs text-slate-400 font-normal shrink-0">No change</span>
              ) : (
                <span
                  className={[
                    "text-xs tabular-nums shrink-0",
                    isUp  && isBig  ? "text-emerald-600 font-semibold" :
                    isUp  && !isBig ? "text-slate-500 font-medium"     :
                    !isUp && isBig  ? "text-rose-600 font-semibold"    :
                                      "text-slate-500 font-medium",
                  ].join(" ")}
                >
                  {isUp ? "↑" : "↓"} {isUp ? "+" : ""}{d.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
