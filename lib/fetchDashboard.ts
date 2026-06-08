import type { DashboardData } from "@/types/dashboard";

// ─── Mock data ────────────────────────────────────────────────────────────
// Used when APPS_SCRIPT_URL is not set, or during local development.
// Replace with real Apps Script endpoint values once wired up.

const MOCK_DATA: DashboardData = {
  cycle: "Q2 2026",
  generatedDate: "2026-06-08",
  summary: {
    totalResponses: 42,
    highestArea: "Team Climate & Safety",
    lowestArea: "Workload & Sustainability",
    overallStatus: "Stable",
    overallScore: 3.8,
  },
  areaScores: [
    { area: "Direction & Priorities",     score: 4.1 },
    { area: "Value & Focus",              score: 3.9 },
    { area: "Ownership & Empowerment",    score: 3.7 },
    { area: "Ways of Working",            score: 3.8 },
    { area: "Collaboration & Support",    score: 4.2 },
    { area: "Workload & Sustainability",  score: 3.2 },
    { area: "Team Climate & Safety",      score: 4.4 },
  ],
  trends: [
    { cycle: "Q4 2025", overallScore: 3.4 },
    { cycle: "Q1 2026", overallScore: 3.7 },
    { cycle: "Q2 2026", overallScore: 3.8 },
  ],
  recommendations: [
    {
      theme: "Workload Balance",
      frequency: 12,
      suggestedAction: "Review sprint capacity and backlog prioritisation",
    },
    {
      theme: "Direction Clarity",
      frequency: 8,
      suggestedAction: "Increase frequency of team-level goal reviews",
    },
    {
      theme: "Recognition",
      frequency: 6,
      suggestedAction: "Implement monthly recognition moments in team standup",
    },
  ],
  actions: [
    {
      concern: "Workload consistently high",
      suggestedAction: "Review sprint capacity planning",
      owner: "Eng Lead",
      status: "In Progress",
    },
    {
      concern: "Unclear quarterly priorities",
      suggestedAction: "Monthly OKR review with full team",
      owner: "Product Manager",
      status: "Planned",
    },
    {
      concern: "Low psychological safety signals",
      suggestedAction: "Team retrospective workshop",
      owner: "Scrum Master",
      status: "Completed",
    },
  ],
};

// ─── Fetch ────────────────────────────────────────────────────────────────
// Set APPS_SCRIPT_URL in your .env.local (never expose in client bundle):
//   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
//
// This function runs server-side only (Next.js Server Component).

export async function fetchDashboardData(): Promise<DashboardData> {
  const url = process.env.APPS_SCRIPT_URL;

  if (!url) {
    // No endpoint configured — return mock data for local dev / preview
    return MOCK_DATA;
  }

  try {
    const res = await fetch(url, {
      // Revalidate once per hour; adjust as needed for your survey cadence
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Apps Script fetch failed: ${res.status}`);
      return MOCK_DATA;
    }

    const data: DashboardData = await res.json();
    return data;
  } catch (err) {
    console.error("fetchDashboardData error:", err);
    return MOCK_DATA;
  }
}
