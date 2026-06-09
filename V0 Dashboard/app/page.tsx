import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { OverviewSection } from "@/components/dashboard/OverviewSection"
import { ParticipationSection } from "@/components/dashboard/ParticipationSection"
import { ScoresSection } from "@/components/dashboard/ScoresSection"
import { SentimentSection } from "@/components/dashboard/SentimentSection"
import { RolesSection } from "@/components/dashboard/RolesSection"
import { NextStepsSection } from "@/components/dashboard/NextStepsSection"
import { Separator } from "@/components/ui/separator"

export default function PulseDashboard() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          <OverviewSection />
          <Separator />
          <ParticipationSection />
          <Separator />
          <ScoresSection />
          <Separator />
          <SentimentSection />
          <Separator />
          <RolesSection />
          <Separator />
          <NextStepsSection />
        </main>

        <footer className="border-t border-border mt-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium">B2CSS Pulse Dashboard</span>
            <span>Data sourced from Google Sheets · Jun &apos;26</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}
