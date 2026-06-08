"use client";
import type { RoleSplitRow } from "@/types/dashboard";

interface Props {
  rows: RoleSplitRow[];
}

// Muted executive color scale — low saturation, readable contrast
function cellColor(score: number): string {
  if (score >= 4.0) return "bg-emerald-50 text-emerald-700";
  if (score >= 3.5) return "bg-sky-50 text-sky-700";
  if (score >= 3.0) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

// Role gap column emphasis — escalating weight and color
function gapStyle(gap: number): string {
  if (gap >= 0.7) return "text-amber-700 font-bold";
  if (gap >= 0.6) return "text-amber-600 font-semibold";
  if (gap >= 0.4) return "text-slate-600 font-medium";
  return "text-slate-400 font-normal";
}

export default function RoleSplitHeatmap({ rows }: Props) {
  if (!rows || rows.length === 0) return null;

  const groups = Object.keys(rows[0].scores);

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">

      {/* ── Header + inline legend ──────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Score by Role Group</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Larger gaps indicate differing team experiences across roles
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 shrink-0 sm:pt-0.5">
          {[
            { swatch: "bg-emerald-100", label: "Strong" },
            { swatch: "bg-sky-100",     label: "Stable" },
            { swatch: "bg-amber-100",   label: "Watch"  },
            { swatch: "bg-rose-100",    label: "At Risk" },
          ].map(({ swatch, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${swatch} inline-block`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/70">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 w-48">
                Pulse Area
              </th>
              {groups.map((g) => (
                <th key={g} className="px-4 py-2.5 text-xs font-semibold text-slate-600 text-center">
                  {g}
                </th>
              ))}
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-700 text-center bg-slate-100/80">
                Role Gap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.area} className="hover:bg-slate-50/40 transition-colors duration-100">
                <td className="px-5 py-3 text-slate-700 text-xs font-medium">{row.area}</td>
                {groups.map((g) => {
                  const score = row.scores[g];
                  return (
                    <td
                      key={g}
                      className={`px-4 py-3 text-center text-xs tabular-nums ${cellColor(score)}`}
                    >
                      {score !== undefined ? score.toFixed(1) : "—"}
                    </td>
                  );
                })}
                <td className={`px-4 py-3 text-center text-xs tabular-nums bg-slate-50/60 ${gapStyle(row.roleGap)}`}>
                  {row.roleGap >= 0.7 && (
                    <span className="mr-1 text-amber-400 text-[10px]" aria-hidden="true">▲</span>
                  )}
                  {row.roleGap.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
