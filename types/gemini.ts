export interface GeminiInsightRow {
  roleGroupsMentioning: string;
  insight: string;
  recommendation: string;
  priority?: "High" | "Medium" | "Low";
}

export interface GeminiInsightsResponse {
  rows: GeminiInsightRow[];
  summary: string;
  alreadyExists?: boolean;
  fromStorage?: boolean;
  unchangedData?: boolean;
  generatedAt?: string;
  generatedBy?: string;
}
