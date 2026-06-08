interface HeaderProps {
  cycle: string;
  generatedDate: string;
  totalResponses?: number;
  teamSize?: number;
}

const STALE_THRESHOLD_DAYS = 7;

export default function Header({ cycle, generatedDate, totalResponses, teamSize }: HeaderProps) {
  const formatted = new Date(generatedDate).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const participation =
    totalResponses && teamSize
      ? `${totalResponses} of ${teamSize} (${Math.round((totalResponses / teamSize) * 100)}%)`
      : totalResponses
      ? `${totalResponses} responses`
      : null;

  const isStale = (() => {
    const generated = new Date(generatedDate);
    const now = new Date();
    const diffDays = (now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > STALE_THRESHOLD_DAYS;
  })();

  return (
    <header>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Internal Survey Report
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            B2CSS Pulse Dashboard
          </h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-0.5 text-xs text-slate-500 mt-1 sm:mt-0">
          <span>Cycle: <strong className="text-slate-700 font-medium">{cycle}</strong></span>
          <span>Generated: {formatted}</span>
          {participation && (
            <span>Participation: <strong className="text-slate-700 font-medium">{participation}</strong></span>
          )}
          {isStale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              <span aria-hidden="true">⚠</span> Data may be outdated
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
