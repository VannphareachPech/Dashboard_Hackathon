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
import type { SummaryData } from "@/types/dashboard";

import RoleSplitHeatmap from "@/components/RoleSplitHeatmap";
import ResponseCountChart from "@/components/ResponseCountChart";
import ResponseMixChart from "@/components/ResponseMixChart";
import CurrentPulseBarChart from "@/components/CurrentPulseBarChart";
import OverallResponseMixTrendChart from "@/components/OverallResponseMixTrendChart";
import ResponseCountByPulseChart from "@/components/ResponseCountByPulseChart";


function statusAccent(status: string): "green" | "amber" | "red" | "blue" {
  const s = status.toLowerCase();
  if (s === "strong") return "green";
  if (s === "stable") return "blue";
  if (s === "watch") return "amber";
  if (s === "at risk") return "red";
  return "blue";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();
  const { cycle, generatedDate, narrativeSummary, summary, areaScores, trends, recommendations, actions, responseAllRawData, responseCurrentRawData, roleSplit, responseCounts, responseMix } = data;

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
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────── */}
      <Header
        cycle={cycle}
        generatedDate={generatedDate}
        totalResponses={summary.totalResponses}
        teamSize={summary.teamSize}
      />

      {/* ── Hero Score ─────────────────────────────────────── */}
      <HeroScore summary={summary} prevCycle={prevCycle} />

      {/* ── Executive Narrative ────────────────────────────── */}
      {narrativeSummary && <NarrativeBlock text={narrativeSummary} />}

      {/* ── Signal Strip — per-area movement ───────────────── */}
      <SignalStrip areaScores={areaScores} />

      {/* ── Focus This Pulse ───────────────────────────────── */}
      {summary.lowestArea && (
        <FocusArea
          area={summary.lowestArea}
          score={lowestScore}
          pulsesAtRisk={lowestPulsesAtRisk}
          suggestedAction={focusSuggestion}
        />
      )}

      {/* ── At a Glance — supporting metrics ───────────────── */}
      <Section title="At a Glance">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Overall Status"
            value={summary.overallStatus}
            sub={`Score: ${summary.overallScore.toFixed(1)} / 5`}
            accent={statusAccent(summary.overallStatus)}
          />
          <SummaryCard label="Strongest Area" value={summary.highestArea} accent="green" />
          <SummaryCard label="Needs Attention" value={summary.lowestArea}  accent="amber" />
        </div>
      </Section>

      {/* ── Pulse Question Score Trends ──────────────── */}
      <Section title="Trends by Survey Area">
        <PulseQuestionTrendChart responseAllRawData={responseAllRawData ?? []} />
      </Section>

      {/* ── Overall Response Mix Trend ─────────────────── */}
      {responseAllRawData && responseAllRawData.length > 0 && (
        <Section title="Overall Response Mix Trend">
          <OverallResponseMixTrendChart responseAllRawData={responseAllRawData} />
        </Section>
      )}

      {/* ── Response Count by Pulse ─────────────────────── */}
      {responseAllRawData && responseAllRawData.length > 0 && (
        <Section title="Response Count by Pulse">
          <ResponseCountByPulseChart responseAllRawData={responseAllRawData} />
        </Section>
      )}

      {/* ── Charts row ────────────────────────────────── */}
      <Section title="Survey Results">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ScoreChart areaScores={areaScores} />
          </div>
          <div className="lg:col-span-1">
            <TrendChart trends={trends} />
          </div>
        </div>
      </Section>

      {/* ── Pulse History — full width ──────────────────────── */}
      <Section title="Pulse History">
        <TrendChart trends={trends} />
      </Section>

      {/* ── Area Scores ─────────────────────────────────────── */}
      <Section title="Area Scores">
        <ScoreChart areaScores={areaScores} />
      </Section>

      {/* ── Current Pulse Response Mix (raw data) ─────────── */}
      {responseCurrentRawData && responseCurrentRawData.length > 0 && (
        <Section title="Current Pulse Response Mix by Question">
          <CurrentPulseBarChart responseCurrentRawData={responseCurrentRawData} />
        </Section>
      )}

      {/* ── Current Pulse Response Mix ─────────────────────── */}
      {responseMix && responseMix.length > 0 && (
        <Section title="Current Pulse Response Mix by Question">
          <ResponseMixChart data={responseMix} />
        </Section>
      )}

      {/* ── Role Split Heatmap ──────────────────────────────── */}
      {roleSplit && roleSplit.length > 0 && (
        <Section title="Role Split">
          <RoleSplitHeatmap rows={roleSplit} />
        </Section>
      )}

      {/* ── Response Count by Pulse ─────────────────────────── */}
      {responseCounts && responseCounts.length > 0 && (
        <Section title="Participation Trend">
          <ResponseCountChart data={responseCounts} />
        </Section>
      )}

      {/* ── Recurring Signals ───────────────────────────────── */}
      <Section title="Recurring Signals">
        <RecommendationTable recommendations={recommendations} />
      </Section>

      {/* ── Commitments ─────────────────────────────────────── */}
      <Section title="Commitments">
        <ActionTracker actions={actions} />
      </Section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="text-center text-xs text-slate-300 pt-4 border-t border-slate-100">
        B2CSS Pulse Dashboard · Data sourced from Google Sheets · {cycle}
      </footer>
    </main>
  );
}
