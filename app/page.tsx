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
import PulseQuestionTrendChart from "@/components/PulseQuestionTrendChart";
import RoleSplitHeatmap from "@/components/RoleSplitHeatmap";
import ResponseMixChart from "@/components/ResponseMixChart";
import CurrentPulseBarChart from "@/components/CurrentPulseBarChart";
import OverallResponseMixTrendChart from "@/components/OverallResponseMixTrendChart";
import ResponseCountByPulseChart from "@/components/ResponseCountByPulseChart";
import GeminiInsights from "@/components/GeminiInsights";
import SectionNav from "@/components/SectionNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <h2 className="text-xl font-semibold tracking-tight text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function GroupDivider() {
  return <div className="mt-8 border-t border-slate-100" />;
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">No Data Available</h1>
          <p className="text-slate-600 mb-6 max-w-md">
            The dashboard is not configured with a data source. Please set up the Apps Script
            endpoint in your environment variables to load pulse survey data.
          </p>
          <div className="text-sm text-slate-500 font-mono bg-slate-100 p-4 rounded inline-block text-left">
            Set APPS_SCRIPT_URL in .env.local
          </div>
        </div>
      </div>
    );
  }

  const {
    cycle,
    generatedDate,
    narrativeSummary,
    summary,
    areaScores,
    trends,
    recommendations,
    actions,
    responseAllRawData,
    responseCurrentRawData,
    roleSplit,
    responseCounts,
    responseMix,
    prevCycle,
    focusSuggestion,
  } = data;

  const currentCycleCount =
    responseCounts?.find((r) => r.cycle === cycle)?.responseCount ?? summary.totalResponses;

  const lowestAreaData = areaScores.find((a) => a.area === summary.lowestArea);
  const focusScore = lowestAreaData?.score ?? 0;
  const focusPulsesAtRisk = lowestAreaData?.pulsesAtRisk;

  const rankedAreas = [...areaScores].sort((a, b) => a.score - b.score);
  const focusRank = rankedAreas.findIndex((a) => a.area === summary.lowestArea) + 1;

  const gapFromOverall =
    focusScore > 0 && summary.overallScore > 0
      ? Math.round((focusScore - summary.overallScore) * 10) / 10
      : undefined;

  const previousFocusScore = (() => {
    if (!summary.lowestArea || trends.length < 2) return undefined;
    const prev = Number(trends[trends.length - 2][summary.lowestArea]);
    return Number.isNaN(prev) ? undefined : prev;
  })();

  return (
    <>
      <SectionNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <main>

          {/* ── GROUP 1 — Executive Snapshot ─────────────────────── */}
          <section id="overview" className="space-y-4 scroll-mt-20">
            <Header
              cycle={cycle}
              generatedDate={generatedDate}
              totalResponses={currentCycleCount}
              teamSize={summary.teamSize}
              participationTextOverride={process.env.DEMO_PARTICIPATION_TEXT}
            />

            <HeroScore summary={summary} prevCycle={prevCycle} />

            {narrativeSummary && (
              <section id="executive-summary" className="scroll-mt-20">
                <NarrativeBlock text={narrativeSummary} />
              </section>
            )}

            <section className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                At a Glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <SummaryCard
                  label="Overall Status"
                  value={summary.overallStatus}
                  sub={`Score: ${summary.overallScore.toFixed(1)} / 5`}
                  accent={statusAccent(summary.overallStatus)}
                />
                <SummaryCard label="Strongest Area" value={summary.highestArea} accent="green" />
                <SummaryCard label="Needs Attention" value={summary.lowestArea} accent="amber" />
              </div>
            </section>

            {summary.lowestArea && (
              <section id="focus" className="scroll-mt-20">
                <FocusArea
                  area={summary.lowestArea}
                  score={focusScore}
                  pulsesAtRisk={focusPulsesAtRisk}
                  areaRank={focusRank > 0 ? focusRank : undefined}
                  totalAreas={areaScores.length || undefined}
                  gapFromOverall={gapFromOverall}
                  previousScore={previousFocusScore}
                  suggestedAction={focusSuggestion}
                />
              </section>
            )}

            <section id="movement" className="scroll-mt-20">
              <SignalStrip areaScores={areaScores} />
            </section>
          </section>

          {/* ── GROUP 2 — Pulse Analytics ────────────────────────── */}
          <GroupDivider />
          <div id="participation-trend" className="mt-5 space-y-5">

            <Section title="Pulse Analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Pulse Question Score Trends
                  </p>
                  <PulseQuestionTrendChart trends={trends} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Current Response Mix by Question
                  </p>
                  {responseCurrentRawData && responseCurrentRawData.length > 0 ? (
                    <CurrentPulseBarChart responseCurrentRawData={responseCurrentRawData} />
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 h-full flex items-center justify-center">
                      <p className="text-sm text-slate-400">No current pulse data available</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Response Count by Pulse
                  </p>
                  {responseAllRawData && responseAllRawData.length > 0 ? (
                    <ResponseCountByPulseChart responseAllRawData={responseAllRawData} />
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 h-full flex items-center justify-center">
                      <p className="text-sm text-slate-400">No response data available</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Overall Response Mix — Last 5 Pulses
                  </p>
                  {responseAllRawData && responseAllRawData.length > 0 ? (
                    <OverallResponseMixTrendChart responseAllRawData={responseAllRawData} />
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 h-full flex items-center justify-center">
                      <p className="text-sm text-slate-400">No response data available</p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Pulse History">
              <TrendChart trends={trends} />
            </Section>

          </div>

          {/* ── GROUP 3 — Diagnostic Insights ───────────────────── */}
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

          {/* ── GROUP 4 — Leadership Actions ────────────────────── */}
          <GroupDivider />
          <section id="next-steps" className="mt-5 scroll-mt-20 space-y-0">
            <div className="mb-4">
              <h2 className="text-base font-semibold tracking-tight text-slate-800">Next Steps</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Themes and leadership responses to carry forward
              </p>
            </div>

            <RecommendationTable recommendations={recommendations} />

            <div className="pt-5 mt-5 border-t border-slate-100/80">
              <ActionTracker actions={actions} currentCycle={cycle} />
            </div>
          </section>

          {/* ── GROUP 5 — AI Insights ────────────────────────────── */}
          <GroupDivider />
          <div className="mt-5">
            <Section title="AI Insights">
              <GeminiInsights
                cycle={cycle}
                summary={summary}
                areaScores={areaScores}
                trends={trends}
                recommendations={recommendations}
              />
            </Section>
          </div>

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
