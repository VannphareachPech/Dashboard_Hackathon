interface HeaderProps {
  cycle: string;
  generatedDate: string;
}

export default function Header({ cycle, generatedDate }: HeaderProps) {
  const formatted = new Date(generatedDate).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-1">
            Internal Survey Report
          </p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            B2CSS Pulse Dashboard
          </h1>
        </div>
        <div className="text-right text-sm text-slate-500 space-y-0.5">
          <p>
            <span className="font-medium text-slate-700">Cycle:</span> {cycle}
          </p>
          <p>
            <span className="font-medium text-slate-700">Generated:</span>{" "}
            {formatted}
          </p>
        </div>
      </div>
      <div className="mt-4 h-px bg-slate-200" />
    </header>
  );
}
