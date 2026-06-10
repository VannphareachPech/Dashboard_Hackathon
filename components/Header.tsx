interface HeaderProps {
  cycle: string;
  generatedDate: string;
  totalResponses?: number;
  teamSize?: number;
  participationTextOverride?: string;
}

const STALE_THRESHOLD_DAYS = 7;

export default function Header({ cycle, generatedDate, totalResponses, teamSize, participationTextOverride }: HeaderProps) {
  const formatted = new Date(generatedDate).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const computedParticipation =
    totalResponses && teamSize
      ? `${totalResponses} of ${teamSize} (${Math.round((totalResponses / teamSize) * 100)}%)`
      : totalResponses
      ? `${totalResponses} responses`
      : null;

  const participation = participationTextOverride?.trim() || computedParticipation;

  const isStale = (() => {
    const generated = new Date(generatedDate);
    const now = new Date();
    const diffDays = (now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > STALE_THRESHOLD_DAYS;
  })();

  return (
    <header>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400 mb-1">
            Internal Survey Report
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            B2CSS Pulse Dashboard
          </h1>
        </div>
        <div className="text-left sm:text-right max-w-xl">
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs leading-none">
              <span className="font-medium text-slate-500">Cycle:</span>
              <span className="font-semibold text-slate-800">{cycle}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs leading-none">
              <span className="font-medium text-slate-500">Generated:</span>
              <span className="font-semibold text-slate-800">{formatted}</span>
            </span>
            {participation && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs leading-none">
                <span className="font-medium text-slate-500">Participation:</span>
                <span className="font-semibold text-slate-800">{participation}</span>
              </span>
            )}
            {isStale && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                <span aria-hidden="true">⚠</span> Data may be outdated
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 h-px bg-slate-200" />
    </header>
  );
}
