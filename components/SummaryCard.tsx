interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "amber" | "red" | "blue";
  icon?: React.ReactNode;
}

const accentBorder: Record<NonNullable<SummaryCardProps["accent"]>, string> = {
  green: "border-l-[var(--status-strong)]",
  amber: "border-l-[var(--status-watch)]",
  red:   "border-l-[var(--status-concern)]",
  blue:  "border-l-[var(--status-stable)]",
};

export default function SummaryCard({ label, value, sub, accent, icon }: SummaryCardProps) {
  const borderClass = accent ? accentBorder[accent] : "";
  return (
    <div className={`rounded-lg border border-slate-200/60 bg-white px-4 py-3 flex flex-col gap-1 border-l-2 ${borderClass}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-base font-bold text-slate-900 text-balance">{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}
