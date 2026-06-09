"use client";
import { AlertTriangle } from "lucide-react";
import type { RoleSplitRow } from "@/types/dashboard";

interface Props {
  rows: RoleSplitRow[];
}

function scoreColor(score: number): string {
  if (score >= 4.0) return "text-[var(--status-strong)]";
  if (score >= 3.5) return "text-[var(--status-stable)]";
  if (score >= 3.0) return "text-[var(--status-watch)]";
  return "text-[var(--status-concern)]";
}

export default function RoleSplitHeatmap({ rows }: Props) {
  if (!rows || rows.length === 0) return null;

  const groups = Object.keys(rows[0].scores);

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Role Split Comparison</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Larger gaps indicate differing team experiences across roles
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 shrink-0 sm:pt-0.5">
          {[
            { label: "Strong",  color: "var(--status-strong)"  },
            { label: "Stable",  color: "var(--status-stable)"  },
            { label: "Watch",   color: "var(--status-watch)"   },
            { label: "At Risk", color: "var(--status-concern)" },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="size-1.5 rounded-full inline-block" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Pulse Area
              </th>
              {groups.map((g) => (
                <th key={g} className="px-4 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {g}
                </th>
              ))}
              <th className="px-4 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Role Gap
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.area}
                className={[
                  "border-b border-slate-100/60 hover:bg-slate-50/30 transition-colors",
                  i % 2 !== 0 ? "bg-slate-50/40" : "",
                ].join(" ")}
              >
                <td className="px-5 py-2.5 font-medium text-slate-700">{row.area}</td>
                {groups.map((g) => {
                  const score = row.scores[g];
                  return (
                    <td key={g} className={`px-4 py-2.5 text-center font-semibold tabular-nums ${scoreColor(score)}`}>
                      {score !== undefined ? score.toFixed(1) : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 text-center">
                  <span className={[
                    "inline-flex items-center gap-1 font-semibold tabular-nums",
                    row.roleGap >= 0.7 ? "text-[var(--status-concern)]" : "text-slate-400",
                  ].join(" ")}>
                    {row.roleGap >= 0.7 && <AlertTriangle className="size-3" />}
                    {row.roleGap.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
