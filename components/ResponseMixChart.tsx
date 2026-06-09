"use client";

import type { ResponseMixRow } from "@/types/dashboard";

interface Props {
  data: ResponseMixRow[];
}

type SentimentLevel = "strong" | "watch" | "concern";

function getSentiment(positive: number): SentimentLevel {
  if (positive >= 65) return "strong";
  if (positive >= 50) return "watch";
  return "concern";
}

const SENTIMENT_CONFIG: Record<
  SentimentLevel,
  { label: string; pill: string; badge: string }
> = {
  strong:  { label: "Strong",  pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",  badge: "text-emerald-700" },
  watch:   { label: "Watch",   pill: "bg-amber-50  text-amber-700  ring-amber-200",  badge: "text-amber-700"  },
  concern: { label: "Concern", pill: "bg-rose-50   text-rose-700   ring-rose-200",   badge: "text-rose-700"   },
};

export default function ResponseMixChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  // Sort: highest positive % first so concerns naturally sink to the bottom
  const sorted = [...data].sort((a, b) => b.positive - a.positive);
  const sampleN = sorted[0]?.total ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Current Pulse Response Mix by Question</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Response sentiment by area · current pulse · n={sampleN}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5">
          {[
            { color: "bg-emerald-400", label: "Positive" },
            { color: "bg-amber-200",   label: "Mixed"    },
            { color: "bg-rose-300",    label: "Negative" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Rows ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        {sorted.map((row) => {
          const level = getSentiment(row.positive);
          const cfg   = SENTIMENT_CONFIG[level];

          return (
            <div key={row.area}>
              {/* Area name row */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-700 font-medium">{row.area}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.pill}`}
                  >
                    {cfg.label}
                  </span>
                  <span className={`text-sm font-bold tabular-nums w-10 text-right ${cfg.badge}`}>
                    {row.positive}%
                  </span>
                </div>
              </div>

              {/* 3-segment bar */}
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-100">
                {row.positive > 0 && (
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${row.positive}%` }}
                    title={`Positive: ${row.positive}%`}
                  />
                )}
                {row.mixed > 0 && (
                  <div
                    className="h-full bg-amber-200"
                    style={{ width: `${row.mixed}%` }}
                    title={`Mixed: ${row.mixed}%`}
                  />
                )}
                {row.negative > 0 && (
                  <div
                    className="h-full bg-rose-300"
                    style={{ width: `${row.negative}%` }}
                    title={`Negative: ${row.negative}%`}
                  />
                )}
              </div>

              {/* Sub-label: mixed + negative breakdown, only shown when notable */}
              {(row.mixed + row.negative) > 20 && (
                <div className="flex gap-3 mt-1 text-[11px] text-slate-400">
                  {row.mixed > 0 && <span>{row.mixed}% mixed</span>}
                  {row.negative > 0 && <span className="text-rose-400">{row.negative}% negative</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer note ────────────────────────────────────────── */}
      <p className="text-[11px] text-slate-300 mt-6 text-right">
        Strong ≥ 65% · Watch ≥ 50% · Concern &lt; 50%
      </p>
    </div>
  );
}