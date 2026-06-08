import type { RecommendationTheme } from "@/types/dashboard";

interface RecommendationTableProps {
  recommendations: RecommendationTheme[];
}

export default function RecommendationTable({
  recommendations,
}: RecommendationTableProps) {
  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 p-5 text-sm text-slate-400">
        No emerging themes to display yet.
      </div>
    );
  }

  const maxFrequency = Math.max(...recommendations.map((r) => r.frequency), 1);

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Emerging Themes</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Themes repeatedly raised across pulse feedback over time
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              {["Theme", "Mentions", "Recurrence", "Suggested Response"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recommendations.map((r, i) => (
              <tr
                key={r.theme}
                className={[
                  "border-b border-slate-100/60 hover:bg-slate-50/30 transition-colors",
                  i % 2 !== 0 ? "bg-slate-50/40" : "",
                ].join(" ")}
              >
                <td className="px-5 py-2.5 font-semibold text-slate-800">{r.theme}</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full bg-[var(--status-stable)]"
                      style={{ width: `${Math.min(r.frequency * 6, 72)}px` }}
                    />
                    <span className="text-slate-400 tabular-nums">{r.frequency}</span>
                  </div>
                </td>
                <td className="px-5 py-2.5">
                  {r.pulsesActive !== undefined ? (
                    <span
                      className={[
                        "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
                        r.pulsesActive >= 3
                          ? "bg-[var(--status-concern)]/10 text-[var(--status-concern)]"
                          : r.pulsesActive === 2
                          ? "bg-[var(--status-watch)]/10 text-[var(--status-watch)]"
                          : "bg-slate-100 text-slate-400",
                      ].join(" ")}
                    >
                      {r.pulsesActive}×
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-5 py-2.5 text-slate-500">{r.suggestedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
