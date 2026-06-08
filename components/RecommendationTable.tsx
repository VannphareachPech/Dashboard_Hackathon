import type { RecommendationTheme } from "@/types/dashboard";

interface RecommendationTableProps {
  recommendations: RecommendationTheme[];
}

export default function RecommendationTable({
  recommendations,
}: RecommendationTableProps) {
  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-sm text-slate-400">
        No recommendation themes available yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-base font-semibold text-slate-700 mb-1">
        Recommendation Themes
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Grouped from open-text responses — highest frequency first
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 pr-4 font-semibold text-slate-500 w-[30%]">
                Theme
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-500 w-[15%]">
                Frequency
              </th>
              <th className="text-left py-2 font-semibold text-slate-500">
                Suggested Action
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
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-sm">
                    {r.frequency}
                  </span>
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
