"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "participation", label: "Participation" },
  { id: "scores", label: "Scores" },
  { id: "sentiment", label: "Sentiment" },
  { id: "roles", label: "Roles" },
  { id: "next-steps", label: "Next Steps" },
]

export function DashboardHeader() {
  const [active, setActive] = useState("overview")

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map(({ id }) => document.getElementById(id))
      const scrollY = window.scrollY + 80
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i]
        if (el && el.offsetTop <= scrollY) {
          setActive(NAV_ITEMS[i].id)
          break
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    setActive(id)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex items-center justify-center gap-0" aria-label="Dashboard sections">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={cn(
                "relative px-3.5 py-3 text-xs font-medium tracking-wide transition-colors focus-visible:outline-none",
                active === id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={active === id ? "page" : undefined}
            >
              {label}
              {active === id && (
                <span className="absolute bottom-0 left-3.5 right-3.5 h-px bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
