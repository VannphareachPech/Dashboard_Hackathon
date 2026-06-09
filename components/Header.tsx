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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400 mb-1">
            Internal Survey Report
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            B2CSS Pulse Dashboard
          </h1>
        </div>
        <div className="text-left sm:text-right text-xs leading-5 text-slate-500 sm:self-end max-w-xl">
          <p>
            <span className="font-medium text-slate-600">Cycle:</span> {cycle}
            <span className="mx-2 text-slate-300">·</span>
            <span className="font-medium text-slate-600">Generated:</span> {formatted}
            {participation && (
              <>
                <span className="mx-2 text-slate-300">·</span>
                <span className="font-medium text-slate-600">Participation:</span> {participation}
              </>
            )}
            {isStale && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                <span aria-hidden="true">⚠</span> Data may be outdated
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="mt-4 h-px bg-slate-200" />
    </header>
  );
}
