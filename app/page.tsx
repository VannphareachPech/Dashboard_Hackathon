import { fetchDashboardData } from "@/lib/fetchDashboard";
import { CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import HeroScore from "@/components/HeroScore";
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

function Section({ title, label, id, children }: { title: string; label?: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 scroll-mt-20">
      <div>
        {label && (
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">{label}</h2>
        )}
        <p className="text-xl font-bold tracking-tight text-slate-900">{title}</p>
      </div>
      {children}
    </section>
  );
}

function GroupDivider() {
  return <div className="mt-8 border-t border-slate-100" />;
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();
  const { cycle, generatedDate, narrativeSummary, summary, areaScores, trends, recommendations, actions, roleSplit, responseCounts, responseMix } = data;

  const prevCycle = trends.length >= 2 ? trends[trends.length - 2].cycle : undefined;

  const lowestAreaData = areaScores.find((a) => a.area === summary.lowestArea);
  const lowestScore = lowestAreaData?.score ?? 0;
  const lowestPulsesAtRisk = lowestAreaData?.pulsesAtRisk;

  const focusSuggestion =
    recommendations.find((r) => r.areaLink === summary.lowestArea)?.suggestedAction ??
    recommendations.find((r) =>
      summary.lowestArea &&
      r.theme.toLowerCase().includes(summary.lowestArea.split(" ")[0].toLowerCase())
    )?.suggestedAction;

  return (
    <>
      <SectionNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <main>
          <section id="overview" className="space-y-4 scroll-mt-20">
            <Header
              cycle={cycle}
              generatedDate={generatedDate}
              totalResponses={summary.totalResponses}
              teamSize={summary.teamSize}
            />

            <HeroScore summary={summary} prevCycle={prevCycle} narrativeSummary={narrativeSummary} />

            <div className="grid grid-cols-3 gap-3">
              <SummaryCard
                label="Overall Status"
                value={summary.overallStatus}
                sub={`Score ${summary.overallScore.toFixed(1)} / 5`}
                accent="blue"
                icon={<CheckCircle className="size-3" />}
              />
              <SummaryCard
                label="Strongest Area"
                value={summary.highestArea}
                accent="green"
                icon={<TrendingUp className="size-3" />}
              />
              <SummaryCard
                label="Needs Attention"
                value={summary.lowestArea}
                accent="red"
                icon={<AlertTriangle className="size-3" />}
              />
            </div>

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

            <section id="movement" className="scroll-mt-20">
              <SignalStrip areaScores={areaScores} />
            </section>
          </section>

          <GroupDivider />
          <div className="mt-5 space-y-5">
            {responseCounts && responseCounts.length > 0 && (
              <Section id="participation-trend" label="Participation" title="Response Trend">
                <ResponseCountChart data={responseCounts} summary={summary} />
              </Section>
            )}

            <Section label="Scores" title="Score Over Time">
              <TrendChart trends={trends} />
            </Section>
          </div>

          <GroupDivider />
          <div className="mt-5 space-y-5">
            <Section id="area-scores" label="Scores" title="Pulse Area Breakdown">
              <ScoreChart areaScores={areaScores} />
            </Section>

            {responseMix && responseMix.length > 0 && (
              <Section id="response-mix" label="Sentiment" title="Team Sentiment by Area">
                <ResponseMixChart data={responseMix} />
              </Section>
            )}

            {roleSplit && roleSplit.length > 0 && (
              <Section id="role-split" label="Roles" title="Score by Role Group">
                <RoleSplitHeatmap rows={roleSplit} />
              </Section>
            )}
          </div>

          <GroupDivider />
          <section id="next-steps" className="mt-5 space-y-4 scroll-mt-20">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Next Steps</h2>
              <p className="text-xl font-bold tracking-tight text-slate-900">Themes &amp; Leadership Actions</p>
            </div>

            <div>
              <RecommendationTable recommendations={recommendations} />
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100/80">
              <ActionTracker actions={actions} />
            </div>
          </section>

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
