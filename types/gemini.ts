export interface GeminiInsightRow {
  area: string;
  insight: string;
  recommendation: string;
  priority: "High" | "Medium" | "Low";
}

export interface GeminiInsightsResponse {
  rows: GeminiInsightRow[];
  summary: string;
}
