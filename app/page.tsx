import { fetchDashboardData } from "@/lib/fetchDashboard";
import Header from "@/components/Header";
import HeroScore from "@/components/HeroScore";
import NarrativeBlock from "@/components/NarrativeBlock";
import SignalStrip from "@/components/SignalStrip";
import FocusArea from "@/components/FocusArea";
import SummaryCard from "@/components/SummaryCard";
import ScoreChart from "@/components/ScoreChart";
import TrendChart from "@/components/TrendChart";
import RecommendationTable from "@/components/RecommendationTable";
import ActionTracker from "@/components/ActionTracker";
import RoleSplitHeatmap from "@/components/RoleSplitHeatmap";
import ResponseCountChart from "@/components/ResponseCountChart";
import ResponseMixChart from "@/components/ResponseMixChart";
import SectionNav from "@/components/SectionNav";

function statusAccent(status: string): "green" | "amber" | "red" | "blue" {
  const s = status.toLowerCase();
  if (s === "strong") return "green";
  if (s === "stable") return "blue";
  if (s === "watch") return "amber";
  if (s === "at risk") return "red";
  return "blue";
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-2.5 scroll-mt-20">
      <h2 className="text-base font-semibold tracking-tight text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function GroupDivider() {
  return <div className="mt-8 border-t border-slate-100" />;
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  // Show no data state if fetch failed or no data available
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">No Data Available</h1>
          <p className="text-slate-600 mb-6 max-w-md">
            The dashboard is not configured with a data source. Please set up the Apps Script endpoint in your environment variables to load pulse survey data.
          </p>
          <div className="text-sm text-slate-500 font-mono bg-slate-100 p-4 rounded inline-block text-left">
            Set APPS_SCRIPT_URL in .env.local
          </div>
        </div>
      </div>
    );
  }

  const { cycle, generatedDate, narrativeSummary, summary, areaScores, trends, recommendations, actions, roleSplit, responseCounts, responseMix } = data;

  const prevCycle = trends.length >= 2 ? trends[trends.length - 2].cycle : undefined;

  const lowestAreaData = areaScores.find((a) => a.area === summary.lowestArea);
  const lowestScore    = lowestAreaData?.score ?? 0;
  const lowestPulsesAtRisk = lowestAreaData?.pulsesAtRisk;

  const focusSuggestion =
    // Prefer explicit areaLink field set by Apps Script (reliable)
    recommendations.find((r) => r.areaLink === summary.lowestArea)?.suggestedAction ??
    // Fallback: fuzzy word-match for backward compatibility with older data
    recommendations.find((r) =>
      summary.lowestArea &&
      r.theme.toLowerCase().includes(summary.lowestArea.split(" ")[0].toLowerCase())
    )?.suggestedAction;

  return (
    <>
      {/* ── Sticky nav lives outside every container so sticky works full-page ── */}
      <SectionNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <main>

          {/* ════════════════════════════════════════════════════════
               GROUP 1 — Executive Snapshot
               Header → Hero → Summary → At a Glance → Movement → Focus
          ════════════════════════════════════════════════════════ */}
          <section id="overview" className="space-y-4 scroll-mt-20">

            <Header
              cycle={cycle}
              generatedDate={generatedDate}
              totalResponses={summary.totalResponses}
              teamSize={summary.teamSize}
            />

            {/* Overall Team Sentiment */}
            <HeroScore summary={summary} prevCycle={prevCycle} />

            {/* Executive Summary — flows directly under score */}
            {narrativeSummary && (
              <section id="executive-summary" className="scroll-mt-20">
                <NarrativeBlock text={narrativeSummary} />
              </section>
            )}

            {/* At a Glance */}
            <section className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">At a Glance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <SummaryCard
                  label="Overall Status"
                  value={summary.overallStatus}
                  sub={`Score: ${summary.overallScore.toFixed(1)} / 5`}
                  accent={statusAccent(summary.overallStatus)}
                />
                <SummaryCard label="Strongest Area" value={summary.highestArea} accent="green" />
                <SummaryCard label="Needs Attention" value={summary.lowestArea}  accent="amber" />
              </div>
            </section>

            {/* Focus This Pulse */}
            {summary.lowestArea && (
              <section id="focus" className="scroll-mt-20">
                <FocusArea
                  area={summary.lowestArea}
                  score={lowestScore}
                  pulsesAtRisk={lowestPulsesAtRisk}
                  suggestedAction={focusSuggestion}
                />
              </section>
            )}

            {/* Movement Since Last Pulse */}
            <section id="movement" className="scroll-mt-20">
              <SignalStrip areaScores={areaScores} />
            </section>

          </section>

          {/* ════════════════════════════════════════════════════════
               GROUP 2 — Trends
               Participation Trend → Pulse History (visually paired)
          ════════════════════════════════════════════════════════ */}
          <GroupDivider />
          <div className="mt-5 space-y-5">

            {responseCounts && responseCounts.length > 0 && (
              <Section id="participation-trend" title="Participation Trend">
                <ResponseCountChart data={responseCounts} />
              </Section>
            )}

            <Section title="Pulse History">
              <TrendChart trends={trends} />
            </Section>

          </div>

          {/* ════════════════════════════════════════════════════════
               GROUP 3 — Diagnostic Insights
               Area Scores → Response Mix → Role Split
          ════════════════════════════════════════════════════════ */}
          <GroupDivider />
          <div className="mt-5 space-y-5">

            <Section id="area-scores" title="Area Scores">
              <ScoreChart areaScores={areaScores} />
            </Section>

            {responseMix && responseMix.length > 0 && (
              <Section id="response-mix" title="Sentiment">
                <ResponseMixChart data={responseMix} />
              </Section>
            )}

            {roleSplit && roleSplit.length > 0 && (
              <Section id="role-split" title="Role Split">
                <RoleSplitHeatmap rows={roleSplit} />
              </Section>
            )}

          </div>

          {/* ════════════════════════════════════════════════════════
               GROUP 4 — Leadership Actions
               Recurring Signals → Commitments
          ════════════════════════════════════════════════════════ */}
          <GroupDivider />
          <section id="next-steps" className="mt-5 space-y-0 scroll-mt-20">

            <div className="mb-4">
              <h2 className="text-base font-semibold tracking-tight text-slate-800">Next Steps</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Themes and leadership responses to carry forward
              </p>
            </div>

            <div>
              <RecommendationTable recommendations={recommendations} />
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100/80">
              <ActionTracker actions={actions} currentCycle={cycle} />
            </div>

          </section>

          {/* ── Footer ──────────────────────────────────────────── */}
          <footer className="mt-10 pt-5 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-slate-400">
              <span className="font-medium text-slate-500">B2CSS Pulse Dashboard</span>
              <span>Data sourced from Google Sheets &middot; {cycle}</span>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}
