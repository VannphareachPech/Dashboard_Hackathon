interface SummaryCardProps {
  label: string;
  value: string | number;
  /** Optional sub-label shown below the value */
  sub?: string;
  /** Optional colour accent: "green" | "amber" | "red" | "blue" */
  accent?: "green" | "amber" | "red" | "blue";
}

const accentStyles: Record<NonNullable<SummaryCardProps["accent"]>, string> = {
  green: "border-l-4 border-emerald-400",
  amber: "border-l-4 border-amber-400",
  red:   "border-l-4 border-rose-400",
  blue:  "border-l-4 border-blue-400",
};

export default function SummaryCard({
  label,
  value,
  sub,
  accent,
}: SummaryCardProps) {
  return (
    <div
      className={[
        "bg-white rounded-xl shadow-sm p-5 flex flex-col gap-1",
        accent ? accentStyles[accent] : "border border-slate-100",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
