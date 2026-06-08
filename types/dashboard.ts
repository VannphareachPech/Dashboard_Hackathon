// ─── Types matching the Apps Script JSON response ──────────────────────────
// Every field maps 1-to-1 with what doGet() returns from Google Sheets.
// Frontend does NOT calculate anything — it only renders what it receives.

export interface AreaScore {
  area: string;
  score: number;
}

export interface TrendPoint {
  cycle: string;       // e.g. "Q1 2026"
  overallScore: number;
}

export interface RecommendationTheme {
  theme: string;
  frequency: number;
  suggestedAction: string;
}

export type ActionStatus = "Planned" | "In Progress" | "Completed";

export interface ActionItem {
  concern: string;
  suggestedAction: string;
  owner: string;
  status: ActionStatus;
}

export interface SummaryData {
  totalResponses: number;
  highestArea: string;
  lowestArea: string;
  overallStatus: string;   // e.g. "Stable", "At Risk", "Strong"
  overallScore: number;
}

// Root shape returned by the Apps Script doGet() endpoint
export interface DashboardData {
  cycle: string;           // e.g. "Q2 2026"
  generatedDate: string;   // ISO date string, e.g. "2026-06-08"
  summary: SummaryData;
  areaScores: AreaScore[];
  trends: TrendPoint[];
  recommendations: RecommendationTheme[];
  actions: ActionItem[];
}
