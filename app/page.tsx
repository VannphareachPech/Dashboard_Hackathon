import { fetchDashboardData } from "@/lib/fetchDashboard";
import Header from "@/components/Header";
import SummaryCard from "@/components/SummaryCard";
import ScoreChart from "@/components/ScoreChart";
import TrendChart from "@/components/TrendChart";
import RecommendationTable from "@/components/RecommendationTable";
import ActionTracker from "@/components/ActionTracker";
import PulseQuestionTrendChart from "@/components/PulseQuestionTrendChart";
import type { SummaryData } from "@/types/dashboard";

// Determine accent colour for the Overall Status card
function statusAccent(
  status: string
): "green" | "amber" | "red" | "blue" {
  const s = status.toLowerCase();
  if (s === "strong") return "green";
  if (s === "stable") return "blue";
  if (s === "watch") return "amber";
  if (s === "at risk") return "red";
  return "blue";
}

// Section wrapper for consistent spacing + heading style
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  const { cycle, generatedDate, summary, areaScores, trends, recommendations, actions, responseAllRawData } = data;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* ── Header ────────────────────────────────────── */}
      <Header cycle={cycle} generatedDate={generatedDate} />

      {/* ── Summary Cards ─────────────────────────────── */}
      <Section title="At a Glance">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Responses"
            value={summary.totalResponses}
            accent="blue"
          />
          <SummaryCard
            label="Overall Status"
            value={summary.overallStatus}
            sub={`Score: ${summary.overallScore.toFixed(1)} / 5`}
            accent={statusAccent(summary.overallStatus)}
          />
          <SummaryCard
            label="Highest Area"
            value={summary.highestArea}
            accent="green"
          />
          <SummaryCard
            label="Lowest Area"
            value={summary.lowestArea}
            accent="amber"
          />
        </div>
      </Section>

      {/* ── Pulse Question Score Trends ──────────────── */}
      <Section title="Trends by Survey Area">
        <PulseQuestionTrendChart responseAllRawData={responseAllRawData ?? []} />
      </Section>

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

      {/* ── Recommendation Themes ─────────────────────── */}
      <Section title="Recommendation Themes">
        <RecommendationTable recommendations={recommendations} />
      </Section>

      {/* ── Action Tracker ────────────────────────────── */}
      <Section title="Action Tracker">
        <ActionTracker actions={actions} />
      </Section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="text-center text-xs text-slate-300 pt-4 border-t border-slate-100">
        B2CSS Pulse Dashboard · Data sourced from Google Sheets · {cycle}
      </footer>
    </main>
  );
}
