interface NarrativeBlockProps {
  text: string;
}

export default function NarrativeBlock({ text }: NarrativeBlockProps) {
  return (
    <div className="bg-slate-50 border-l-4 border-blue-300 rounded-r-xl px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
        Executive Summary
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
    </div>
  );
}
