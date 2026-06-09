"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "overview",            label: "Overview" },
  { id: "participation-trend", label: "Participation" },
  { id: "area-scores",         label: "Scores" },
  { id: "response-mix",        label: "Sentiment" },
  { id: "role-split",          label: "Roles" },
  { id: "next-steps",          label: "Next Steps" },
] as const;

export default function SectionNav() {
  const [activeId, setActiveId] = useState<string>("overview");

  useEffect(() => {
    const onScroll = () => {
      // If within 60px of the page bottom, always highlight the last section.
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;
      if (nearBottom) {
        setActiveId(SECTIONS[SECTIONS.length - 1].id);
        return;
      }

      const threshold = window.innerHeight * 0.3;
      let current: string = SECTIONS[0].id;

      for (const { id } of SECTIONS) {
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
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-slate-50/85 backdrop-blur-md"
      aria-label="Page sections"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex items-center justify-center gap-1.5 py-3 min-w-max mx-auto">
        {SECTIONS.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={[
                  "group whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-[13px]",
                  "font-medium transition-all duration-150 cursor-pointer",
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
