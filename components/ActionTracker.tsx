import type { ActionItem, ActionStatus } from "@/types/dashboard";

interface ActionTrackerProps {
  actions: ActionItem[];
}

const statusStyles: Record<ActionStatus, string> = {
  Planned:     "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed:   "bg-emerald-50 text-emerald-700",
};

export default function ActionTracker({ actions }: ActionTrackerProps) {
  if (!actions.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-sm text-slate-400">
        No actions tracked yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-base font-semibold text-slate-700 mb-1">
        Action Tracker
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Follow-up actions from survey insights
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 pr-4 font-semibold text-slate-500 w-[25%]">
                Concern
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-500 w-[35%]">
                Suggested Action
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-500 w-[15%]">
                Owner
              </th>
              <th className="text-left py-2 font-semibold text-slate-500 w-[15%]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
              >
                <td className="py-3 pr-4 font-medium text-slate-800">
                  {a.concern}
                </td>
                <td className="py-3 pr-4 text-slate-600">{a.suggestedAction}</td>
                <td className="py-3 pr-4 text-slate-600">{a.owner}</td>
                <td className="py-3">
                  <span
                    className={[
                      "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                      statusStyles[a.status] ?? "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {a.status}
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
