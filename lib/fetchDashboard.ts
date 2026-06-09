import type { DashboardData, TrendPoint, RoleSplitRow, ResponseCountPoint, ResponseMixRow } from "@/types/dashboard";

const EMPTY_DATA: DashboardData = {
  cycle: "",
  generatedDate: "",
  narrativeSummary: "",
  summary: {
    totalResponses: 0,
    teamSize: undefined,
    highestArea: "",
    lowestArea: "",
    overallStatus: "No Data",
    overallScore: 0,
    scoreDelta: undefined,
  },
  areaScores: [],
  trends: [],
  recommendations: [],
  actions: [],
  roleSplit: [],
  responseCounts: [],
  responseMix: [],
};

function normalizeTrendList(raw: unknown): TrendPoint[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => item as Partial<TrendPoint>)
    .map((t) => ({
      ...t,
      cycle: String(t.cycle || "").trim(),
      overallScore: Number(t.overallScore) || 0,
    }))
    .filter((t) => t.cycle.length > 0 && t.overallScore > 0);
}

function hasUsablePulseHistory(trends: TrendPoint[]): boolean {
  if (trends.length < 2) return false;
  return trends.every((t) => !/unknown/i.test(String(t.cycle || "")));
}

// ─── Mock data ────────────────────────────────────────────────────────────
// Used when APPS_SCRIPT_URL is not set, or during local development.
// Replace with real Apps Script endpoint values once wired up.
const MOCK_DATA: DashboardData = {
  cycle: "Jun '26",
  generatedDate: "2026-06-08",
  narrativeSummary:
    "Team sentiment is stable at 3.8/5, up 0.1 from Apr '26. " +
    "Ways of Working showed the biggest improvement this pulse (+0.4). " +
    "Workload & Sustainability has been flagged for 3 consecutive pulses — a commitment to review sprint capacity is currently In Progress.",
  summary: {
    totalResponses: 42,
    teamSize: 58,
    highestArea: "Team Climate & Safety",
    lowestArea: "Workload & Sustainability",
    overallStatus: "Stable",
    overallScore: 3.8,
    scoreDelta: 0.1,
  },
  areaScores: [
    { area: "Direction & Priorities",    score: 4.1, delta:  0.2, pulsesAtRisk: 0 },
    { area: "Value & Focus",             score: 3.9, delta:  0.1, pulsesAtRisk: 0 },
    { area: "Ownership & Empowerment",   score: 3.7, delta:  0.0, pulsesAtRisk: 0 },
    { area: "Ways of Working",           score: 3.8, delta:  0.4, pulsesAtRisk: 0 },
    { area: "Collaboration & Support",   score: 4.2, delta:  0.1, pulsesAtRisk: 0 },
    { area: "Workload & Sustainability", score: 3.2, delta: -0.2, pulsesAtRisk: 3 },
    { area: "Team Climate & Safety",     score: 4.4, delta:  0.2, pulsesAtRisk: 0 },
  ],
  trends: [
    {
      cycle: "Oct '25", overallScore: 3.3,
      "Direction & Priorities": 3.5, "Value & Focus": 3.4, "Ownership & Empowerment": 3.2,
      "Ways of Working": 3.1, "Collaboration & Support": 3.6, "Workload & Sustainability": 3.0, "Team Climate & Safety": 3.7,
    },
    {
      cycle: "Dec '25", overallScore: 3.4,
      "Direction & Priorities": 3.6, "Value & Focus": 3.5, "Ownership & Empowerment": 3.3,
      "Ways of Working": 3.2, "Collaboration & Support": 3.7, "Workload & Sustainability": 3.1, "Team Climate & Safety": 3.8,
    },
    {
      cycle: "Feb '26", overallScore: 3.5,
      "Direction & Priorities": 3.7, "Value & Focus": 3.6, "Ownership & Empowerment": 3.5,
      "Ways of Working": 3.3, "Collaboration & Support": 3.9, "Workload & Sustainability": 3.2, "Team Climate & Safety": 4.0,
    },
    {
      cycle: "Apr '26", overallScore: 3.7,
      "Direction & Priorities": 3.9, "Value & Focus": 3.8, "Ownership & Empowerment": 3.7,
      "Ways of Working": 3.4, "Collaboration & Support": 4.1, "Workload & Sustainability": 3.4, "Team Climate & Safety": 4.2,
    },
    {
      cycle: "Jun '26", overallScore: 3.8,
      "Direction & Priorities": 4.1, "Value & Focus": 3.9, "Ownership & Empowerment": 3.7,
      "Ways of Working": 3.8, "Collaboration & Support": 4.2, "Workload & Sustainability": 3.2, "Team Climate & Safety": 4.4,
    },
  ],
  recommendations: [
    {
      theme: "Workload Balance",
      frequency: 12,
      pulsesActive: 3,
      areaLink: "Workload & Sustainability",
      suggestedAction: "Review sprint capacity and backlog prioritisation",
    },
    {
      theme: "Direction Clarity",
      frequency: 8,
      pulsesActive: 2,
      areaLink: "Direction & Priorities",
      suggestedAction: "Increase frequency of team-level goal reviews",
    },
    {
      theme: "Recognition",
      frequency: 6,
      pulsesActive: 1,
      suggestedAction: "Implement monthly recognition moments in team standup",
    },
  ],
  actions: [
    {
      concern: "Workload consistently high",
      suggestedAction: "Review sprint capacity planning",
      owner: "Eng Lead",
      status: "In Progress",
      pulseOpened: "Apr '26",
      area: "Workload & Sustainability",
    },
    {
      concern: "Unclear quarterly priorities",
      suggestedAction: "Monthly OKR review with full team",
      owner: "Product Manager",
      status: "Planned",
      pulseOpened: "Jun '26",
      area: "Direction & Priorities",
    },
    {
      concern: "Low psychological safety signals",
      suggestedAction: "Team retrospective workshop",
      owner: "Scrum Master",
      status: "Completed",
      pulseOpened: "Feb '26",
      area: "Team Climate & Safety",
    },
  ],
  roleSplit: [
    { area: "Direction & Priorities",    scores: { "Product Management": 4.1, "Product Development": 3.7, "Shared / Enabled": 3.8 }, roleGap: 0.4 },
    { area: "Value & Focus",             scores: { "Product Management": 3.8, "Product Development": 3.3, "Shared / Enabled": 3.4 }, roleGap: 0.5 },
    { area: "Ownership & Empowerment",   scores: { "Product Management": 3.7, "Product Development": 3.0, "Shared / Enabled": 3.4 }, roleGap: 0.7 },
    { area: "Ways of Working",           scores: { "Product Management": 3.4, "Product Development": 3.0, "Shared / Enabled": 3.2 }, roleGap: 0.4 },
    { area: "Collaboration & Support",   scores: { "Product Management": 3.5, "Product Development": 3.1, "Shared / Enabled": 3.2 }, roleGap: 0.4 },
    { area: "Workload & Sustainability", scores: { "Product Management": 3.1, "Product Development": 2.5, "Shared / Enabled": 2.8 }, roleGap: 0.6 },
    { area: "Team Climate & Safety",     scores: { "Product Management": 4.0, "Product Development": 3.7, "Shared / Enabled": 3.8 }, roleGap: 0.3 },
  ] as RoleSplitRow[],
  responseCounts: [
    { cycle: "Oct '25", responseCount: 42 },
    { cycle: "Dec '25", responseCount: 48 },
    { cycle: "Feb '26", responseCount: 45 },
    { cycle: "Apr '26", responseCount: 47 },
    { cycle: "Jun '26", responseCount: 44 },
  ] as ResponseCountPoint[],
  responseMix: [
    { area: "Direction & Priorities", positive: 72, mixed: 20, negative: 8, total: 44 },
    { area: "Value & Focus", positive: 61, mixed: 27, negative: 12, total: 44 },
    { area: "Ownership & Empowerment", positive: 55, mixed: 31, negative: 14, total: 44 },
    { area: "Ways of Working", positive: 49, mixed: 34, negative: 17, total: 44 },
    { area: "Collaboration & Support", positive: 52, mixed: 32, negative: 16, total: 44 },
    { area: "Workload & Sustainability", positive: 38, mixed: 36, negative: 26, total: 44 },
    { area: "Team Climate & Safety", positive: 70, mixed: 22, negative: 8, total: 44 },
  ] as ResponseMixRow[],
};

// ─── Fetch ────────────────────────────────────────────────────────────────
// Set APPS_SCRIPT_URL in your .env.local (never expose in client bundle):
//   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
//
// This function runs server-side only (Next.js Server Component).

export async function fetchDashboardData(): Promise<DashboardData> {
  const url = process.env.APPS_SCRIPT_URL;
  const isDev = process.env.NODE_ENV !== "production";

  if (!url) {
    // No endpoint configured — return explicit empty state
    return EMPTY_DATA;
  }

  try {
    const res = await fetch(url, {
      // In dev, always fetch fresh data so sheet changes appear immediately.
      // In prod, keep a 1-hour cache to reduce App Script calls.
      cache: isDev ? "no-store" : "force-cache",
      next: isDev ? undefined : { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Apps Script fetch failed: ${res.status}`);
      return EMPTY_DATA;
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const raw = await res.text();

    // Apps Script often returns HTML for permission/login/deployment issues.
    if (!raw.trim().startsWith("{") && !raw.trim().startsWith("[")) {
      console.error(
        "Apps Script did not return JSON. Check deployment access (Anyone with the link) and endpoint URL.",
        {
          contentType,
          preview: raw.slice(0, 180),
        }
      );
      return EMPTY_DATA;
    }

    const data = JSON.parse(raw) as Partial<DashboardData>;

    // Guard against sparse/invalid trend data from sheet labels/mapping.
    const liveTrends = normalizeTrendList(data.trends);
    const trends = hasUsablePulseHistory(liveTrends) ? liveTrends : [];
    const latestTrendScore =
      trends.length > 0
        ? Number(trends[trends.length - 1].overallScore) || 0
        : 0;
    const rawScore = Number((data.summary || {}).overallScore);
    const resolvedScore = rawScore > 0 ? rawScore : latestTrendScore;

    const normalized: DashboardData = {
      ...EMPTY_DATA,
      ...data,
      trends,
      summary: {
        ...EMPTY_DATA.summary,
        ...(data.summary || {}),
        totalResponses: Number((data.summary || {}).totalResponses) || 0,
        overallScore: resolvedScore,
        teamSize: Number((data.summary || {}).teamSize) || undefined,
      },
      roleSplit: Array.isArray(data.roleSplit) && data.roleSplit.length > 0
        ? data.roleSplit
        : [],
      responseCounts: Array.isArray(data.responseCounts) && data.responseCounts.length > 0
        ? data.responseCounts
        : [],
      responseMix: Array.isArray(data.responseMix) && data.responseMix.length > 0
        ? data.responseMix
        : [],
    };

    // Compute scoreDelta from trend history when consistent with the resolved score.
    const trendList = normalized.trends;
    const latest = trendList.length > 0 ? Number(trendList[trendList.length - 1].overallScore) : 0;
    if (trendList.length >= 2 && Math.abs(normalized.summary.overallScore - latest) <= 0.3) {
      normalized.summary.scoreDelta = +(
        trendList[trendList.length - 1].overallScore -
        trendList[trendList.length - 2].overallScore
      ).toFixed(1);
    } else {
      normalized.summary.scoreDelta = undefined;
    }

    return normalized;
  } catch (err) {
    console.error("fetchDashboardData error:", err);
    return EMPTY_DATA;
  }
}
