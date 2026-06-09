import type { AreaScore } from "@/types/dashboard";

const SHORT: Record<string, string> = {
  "Direction & Priorities":    "Direction",
  "Value & Focus":             "Value",
  "Ownership & Empowerment":   "Ownership",
  "Ways of Working":           "Ways of Working",
  "Collaboration & Support":   "Collaboration",
  "Workload & Sustainability": "Workload",
  "Team Climate & Safety":     "Climate",
};

function deltaStyle(delta: number) {
  if (delta > 0)  return { chip: "bg-emerald-50 text-emerald-700", arrow: "↑", sign: "+" };
  if (delta < 0)  return { chip: "bg-rose-50 text-rose-700",       arrow: "↓", sign: ""  };
  return          { chip: "bg-slate-100 text-slate-400",           arrow: "→", sign: ""  };
}

interface SignalStripProps {
  areaScores: AreaScore[];
}

export default function SignalStrip({ areaScores }: SignalStripProps) {
  const withDelta = areaScores.filter((a) => a.delta !== undefined);
  if (!withDelta.length) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Movement Since Last Pulse
      </p>
      <div className="flex flex-wrap gap-2">
        {withDelta.map((a) => {
          const d = a.delta!;
          const { chip, arrow, sign } = deltaStyle(d);
          return (
            <div
              key={a.area}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50"
              title={a.area}
            >
              <span className="text-xs font-medium text-slate-600">
                {SHORT[a.area] ?? a.area}
              </span>
              <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded ${chip}`}>
                {arrow} {sign}{Math.abs(d).toFixed(1)}
              </span>
              {a.pulsesAtRisk !== undefined && a.pulsesAtRisk >= 2 && (
                <span className="text-xs text-amber-600 font-medium" title={`${a.pulsesAtRisk} consecutive pulses at Watch or worse`}>
                  ⚠ {a.pulsesAtRisk}p
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
