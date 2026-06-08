import type { ActionItem, ActionStatus } from "@/types/dashboard";

interface ActionTrackerProps {
  actions: ActionItem[];
}

const statusStyles: Record<ActionStatus, string> = {
  Planned:       "bg-slate-100 text-slate-600",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Completed:     "bg-emerald-50 text-emerald-700",
};

export default function ActionTracker({ actions }: ActionTrackerProps) {
  if (!actions.length) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5 text-sm text-slate-500">
        No leadership actions tracked yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Leadership Actions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Actions currently underway in response to pulse feedback
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-[30%]">
                Action
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-[15%]">
                Focus Area
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-[12%]">
                Started
              </th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-[15%]">
                Owner
              </th>
              <th className="text-left py-2 font-semibold text-slate-600 w-[13%]">
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
                  {a.suggestedAction}
                </td>
                <td className="py-3 pr-4 text-slate-500 text-xs">
                  {a.area ?? "—"}
                </td>
                <td className="py-3 pr-4 text-slate-500 text-xs tabular-nums">
                  {a.pulseOpened ?? "—"}
                </td>
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
