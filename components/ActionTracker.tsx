import { CheckCircle, Clock, Calendar } from "lucide-react";
import type { ActionItem, ActionStatus } from "@/types/dashboard";

interface ActionTrackerProps {
  actions: ActionItem[];
}

const statusConfig: Record<ActionStatus, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  "In Progress": {
    label: "In Progress",
    className: "bg-[var(--status-stable)]/10 text-[var(--status-stable)] border border-[var(--status-stable)]/20",
    icon: <Clock className="size-2.5" />,
  },
  Planned: {
    label: "Planned",
    className: "bg-[var(--status-watch)]/10 text-[var(--status-watch)] border border-[var(--status-watch)]/20",
    icon: <Calendar className="size-2.5" />,
  },
  Completed: {
    label: "Completed",
    className: "bg-[var(--status-strong)]/10 text-[var(--status-strong)] border border-[var(--status-strong)]/20",
    icon: <CheckCircle className="size-2.5" />,
  },
};

export default function ActionTracker({ actions }: ActionTrackerProps) {
  if (!actions.length) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 p-5 text-sm text-slate-400">
        No leadership actions tracked yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Leadership Actions</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Actions currently underway in response to pulse feedback
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              {["Action", "Focus Area", "Started", "Owner", "Status"].map((h) => (
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
            {actions.map((a, i) => {
              const cfg = statusConfig[a.status] ?? statusConfig["Planned"];
              return (
                <tr
                  key={i}
                  className={[
                    "border-b border-slate-100/60 hover:bg-slate-50/30 transition-colors",
                    i % 2 !== 0 ? "bg-slate-50/40" : "",
                  ].join(" ")}
                >
                  <td className="px-5 py-2.5 font-medium text-slate-800">{a.suggestedAction}</td>
                  <td className="px-5 py-2.5 text-slate-500">{a.area ?? "—"}</td>
                  <td className="px-5 py-2.5 text-slate-500 tabular-nums">{a.pulseOpened ?? "—"}</td>
                  <td className="px-5 py-2.5 text-slate-500">{a.owner}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold py-0.5 px-1.5 rounded ${cfg.className}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
