interface SummaryCardProps {
  label: string;
  value: string | number;
  /** Optional sub-label shown below the value */
  sub?: string;
  /** Optional subtle accent: "green" | "amber" | "red" | "blue" */
  accent?: "green" | "amber" | "red" | "blue";
}

const accentStyles: Record<NonNullable<SummaryCardProps["accent"]>, string> = {
  green: "bg-emerald-300",
  amber: "bg-amber-300",
  red:   "bg-rose-300",
  blue:  "bg-indigo-300",
};

export default function SummaryCard({
  label,
  value,
  sub,
  accent,
}: SummaryCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 px-4 py-3.5 flex flex-col gap-1"
    >
      <div className="flex items-center gap-2">
        {accent && <span className={`h-1.5 w-1.5 rounded-full ${accentStyles[accent]}`} />}
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="text-lg font-semibold text-slate-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}
