interface NarrativeBlockProps {
  text: string;
}

export default function NarrativeBlock({ text }: NarrativeBlockProps) {
  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-1.5">
        Leadership Readout
      </p>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
