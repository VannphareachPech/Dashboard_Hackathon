import type { RecommendationTheme } from "@/types/dashboard";

interface RecommendationTableProps {
  recommendations: RecommendationTheme[];
}

export default function RecommendationTable({
  recommendations,
}: RecommendationTableProps) {
  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5 text-sm text-slate-500">
        No emerging themes to display yet.
      </div>
    );
  }

  const maxFrequency = Math.max(...recommendations.map((r) => r.frequency), 1);
  const maxPulses    = Math.max(...recommendations.map((r) => r.pulsesActive ?? 0), 1);

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Recommendation Themes</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Themes repeatedly raised across pulse feedback over time
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-[28%]">
                Theme
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-[22%]">
                Mentions
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-[15%]">
                Recurrence
              </th>
              <th className="text-left py-2 font-semibold text-slate-600">
                Response
              </th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((r, i) => (
              <tr
                key={r.theme}
                className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
              >
                <td className="py-3 pr-4 font-medium text-slate-800">
                  {r.theme}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{
                          width: `${Math.round((r.frequency / maxFrequency) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 tabular-nums">
                      {r.frequency}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {r.pulsesActive !== undefined ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.pulsesActive >= 3 ? "bg-amber-400" : "bg-slate-300"
                          }`}
                          style={{
                            width: `${Math.round((r.pulsesActive / maxPulses) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className={`text-xs font-semibold tabular-nums ${
                        r.pulsesActive >= 3 ? "text-amber-600" : "text-slate-500"
                      }`}>
                        {r.pulsesActive}x
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="py-3 text-slate-600">{r.suggestedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
