"use client";

import type { ResponseMixRow } from "@/types/dashboard";

interface Props {
  data: ResponseMixRow[];
}

function statusBadge(positive: number): { label: string; className: string } {
  if (positive >= 65) return { label: "Strong",  className: "bg-[var(--status-strong)]/10 text-[var(--status-strong)] border border-[var(--status-strong)]/25" };
  if (positive >= 50) return { label: "Watch",   className: "bg-[var(--status-watch)]/10 text-[var(--status-watch)] border border-[var(--status-watch)]/25" };
  return               { label: "Concern", className: "bg-[var(--status-concern)]/10 text-[var(--status-concern)] border border-[var(--status-concern)]/25" };
}

export default function ResponseMixChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.positive - a.positive);
  const sampleN = sorted[0]?.total ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 p-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Positive, Mixed &amp; Negative Split</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on {sampleN} responses across pulse areas
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full inline-block" style={{ background: "#16a34a" }} /> Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full inline-block" style={{ background: "#ca8a04" }} /> Mixed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full inline-block" style={{ background: "#dc2626" }} /> Negative
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3.5">
        {sorted.map((row) => {
          const badge = statusBadge(row.positive);
          return (
            <div key={row.area}>
              <div className="flex items-center justify-between mb-1.5 gap-4">
                <span className="text-xs font-medium text-slate-700">{row.area}</span>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 tabular-nums w-8 text-right">
                    {row.positive}%
                  </span>
                </div>
              </div>
              <div
                className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-100"
                role="img"
                aria-label={`Positive: ${row.positive}%, Mixed: ${row.mixed}%, Negative: ${row.negative}%`}
              >
                {row.positive > 0 && (
                  <div className="h-full" style={{ width: `${row.positive}%`, background: "#16a34a" }} />
                )}
                {row.mixed > 0 && (
                  <div className="h-full" style={{ width: `${row.mixed}%`, background: "#ca8a04" }} />
                )}
                {row.negative > 0 && (
                  <div className="h-full" style={{ width: `${row.negative}%`, background: "#dc2626" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}