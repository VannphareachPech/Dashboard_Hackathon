"use client";
import type { RoleSplitRow } from "@/types/dashboard";

interface Props {
  rows: RoleSplitRow[];
}

// Color each cell by score band
function cellColor(score: number): string {
  if (score >= 4.0) return "bg-emerald-100 text-emerald-800";
  if (score >= 3.5) return "bg-green-50 text-green-800";
  if (score >= 3.0) return "bg-amber-50 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

// Color the role gap column
function gapColor(gap: number): string {
  if (gap >= 0.7) return "bg-orange-100 text-orange-800 font-semibold";
  if (gap >= 0.5) return "bg-amber-50 text-amber-700";
  return "text-slate-500";
}

export default function RoleSplitHeatmap({ rows }: Props) {
  if (!rows || rows.length === 0) return null;

  // Derive role group columns from first row
  const groups = Object.keys(rows[0].scores);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Role Split</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Score differences by role group · higher role gap = more divergent experience
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 w-48">
                Pulse question
              </th>
              {groups.map((g) => (
                <th key={g} className="px-4 py-2.5 text-xs font-semibold text-slate-500 text-center">
                  {g}
                </th>
              ))}
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 text-center">
                Role gap
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.area} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <td className="px-4 py-3 text-slate-700 text-xs font-medium">{row.area}</td>
                {groups.map((g) => {
                  const score = row.scores[g];
                  return (
                    <td key={g} className={`px-4 py-3 text-center text-xs rounded-sm ${cellColor(score)}`}>
                      {score !== undefined ? score.toFixed(1) : "—"}
                    </td>
                  );
                })}
                <td className={`px-4 py-3 text-center text-xs ${gapColor(row.roleGap)}`}>
                  {row.roleGap.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-100 inline-block" /> ≥ 4.0 Strong
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-50 border border-green-200 inline-block" /> 3.5 – 4.0 Stable
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200 inline-block" /> 3.0 – 3.5 Watch
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-100 inline-block" /> &lt; 3.0 At Risk
          </span>
        </div>
      </div>
    </div>
  );
}
