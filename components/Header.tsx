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
            {isStale && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                <span aria-hidden="true">⚠</span> Data may be outdated
              </span>
            )}
          </p>
          {participation && (
            <p>
              <span className="font-medium text-slate-700">Participation:</span>{" "}
              {participation}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 h-px bg-slate-200" />
    </header>
  );
}
