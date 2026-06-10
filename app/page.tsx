import { fetchDashboardData } from "@/lib/fetchDashboard";
import Header from "@/components/Header";
import HeroScore from "@/components/HeroScore";
import SignalStrip from "@/components/SignalStrip";
import FocusArea from "@/components/FocusArea";
import ScoreChart from "@/components/ScoreChart";
import TrendChart from "@/components/TrendChart";
import ActionTracker from "@/components/ActionTracker";
import RoleSplitHeatmap from "@/components/RoleSplitHeatmap";
import ResponseCountChart from "@/components/ResponseCountChart";
import ResponseMixChart from "@/components/ResponseMixChart";
import SectionNav from "@/components/SectionNav";
import PulseQuestionTrendChart from "@/components/PulseQuestionTrendChart";
import GeminiInsights from "@/components/GeminiInsights";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="h-full min-w-0 flex flex-col space-y-2.5 scroll-mt-20">
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
            The dashboard is not configured with a data source. Please set up the Apps Script endpoint in your environment variables to load pulse survey data.
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
    roleSplit,
    responseCounts,
    responseMix,
    prevCycle,
    focusSuggestion,
  } = data;

  const currentCycleCount =
    responseCounts?.find((r) => r.cycle === cycle)?.responseCount ?? summary.totalResponses;

  const focusAreaEntry = areaScores.find((a) => a.area === summary.lowestArea);
  const focusScore = focusAreaEntry?.score ?? summary.lowestAreaScore ?? 0;
  const focusPulsesAtRisk = focusAreaEntry?.pulsesAtRisk ?? summary.lowestAreaPulsesAtRisk;

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
          <section id="overview" className="space-y-4 scroll-mt-20">
            <Header
              cycle={cycle}
              generatedDate={generatedDate}
              totalResponses={currentCycleCount}
              teamSize={summary.teamSize}
              participationTextOverride={process.env.DEMO_PARTICIPATION_TEXT}
            />

            <section id="executive-summary" className="scroll-mt-20">
              <HeroScore summary={summary} prevCycle={prevCycle} narrativeSummary={narrativeSummary} />
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

          <GroupDivider />
          <div className="mt-5 space-y-5">
            <div className={`grid grid-cols-1 gap-5 items-stretch ${responseCounts && responseCounts.length > 0 ? "lg:grid-cols-2" : ""}`}>
              {responseCounts && responseCounts.length > 0 && (
                <Section id="participation-trend" title="Participation Trends">
                  <ResponseCountChart data={responseCounts} />
                </Section>
              )}

              <Section title="Overall Sentiment Trends">
                <TrendChart trends={trends} />
              </Section>
            </div>

            <Section title="Focus Area Metrics">
              <PulseQuestionTrendChart trends={trends} />
            </Section>
          </div>

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

          <GroupDivider />
          <div className="mt-5 space-y-5">
            <Section id="comments-themes" title="AI Insights">
              <GeminiInsights
                cycle={cycle}
                summary={summary}
                areaScores={areaScores}
                trends={trends}
                recommendations={recommendations}
              />
            </Section>

            <Section id="next-steps" title="Action Items">
              <ActionTracker actions={actions} currentCycle={cycle} />
            </Section>
          </div>

          <footer className="mt-10 pt-5 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-slate-400">
              <span className="font-medium text-slate-500">Built by FAST and FIVE-IOUS & AI</span>
              <span>Data sourced from Google Sheets &middot; {cycle}</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}