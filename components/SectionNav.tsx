"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "overview",            label: "Overview" },
  { id: "participation-trend", label: "Participation" },
  { id: "area-scores",         label: "Scores" },
  { id: "response-mix",        label: "Sentiment" },
  { id: "role-split",          label: "Roles" },
  { id: "comments-themes",     label: "AI Insights" },
  { id: "next-steps",          label: "Action Items" },
] as const;

export default function SectionNav() {
  const [activeId, setActiveId] = useState<string>("overview");
  const [availableIds, setAvailableIds] = useState<Set<string>>(
    () => new Set(SECTIONS.map((s) => s.id))
  );
  const lockedId = useRef<string | null>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const detectAvailableSections = () => {
      const ids = SECTIONS
        .filter(({ id }) => !!document.getElementById(id))
        .map(({ id }) => id);
      setAvailableIds(new Set(ids.length ? ids : [SECTIONS[0].id]));
    };
    detectAvailableSections();
    window.addEventListener("resize", detectAvailableSections);
    return () => window.removeEventListener("resize", detectAvailableSections);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (lockedId.current) return;

      const threshold = window.innerHeight * 0.35;
      const visibleSections = SECTIONS.filter(({ id }) => availableIds.has(id));
      let current: string = visibleSections[0]?.id ?? SECTIONS[0].id;

      for (const { id } of visibleSections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= threshold) {
          current = id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [availableIds]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Lock active tab for long enough that smooth scroll finishes
    lockedId.current = id;
    setActiveId(id);
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => {
      lockedId.current = null;
    }, 1500);

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-slate-50/85 backdrop-blur-md"
      aria-label="Page sections"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center justify-center gap-1.5 py-3 min-w-max mx-auto">
            {SECTIONS.filter(({ id }) => availableIds.has(id)).map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    aria-current={isActive ? "location" : undefined}
                    className={[
                      "whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-[13px]",
                      "font-medium transition-all duration-300 cursor-pointer",
                      isActive
                        ? "text-slate-900 bg-white shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/50",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
