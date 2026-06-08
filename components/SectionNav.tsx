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
      className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-sm"
      aria-label="Page sections"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center justify-center gap-0 min-w-max mx-auto">
            {SECTIONS.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className={[
                      "relative whitespace-nowrap px-3.5 py-3 text-xs font-medium tracking-wide",
                      "transition-colors duration-150 cursor-pointer focus-visible:outline-none",
                      isActive
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-800",
                    ].join(" ")}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-px bg-slate-900 rounded-full" />
                    )}
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
