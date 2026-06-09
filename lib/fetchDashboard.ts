import type { DashboardData, TrendPoint } from "@/types/dashboard";

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

export async function fetchDashboardData(): Promise<DashboardData | null> {
  const url = process.env.APPS_SCRIPT_URL;
  const isDev = process.env.NODE_ENV !== "production";

  if (!url) {
    return null;
  }

  try {
    const res = await fetch(url, {
      cache: isDev ? "no-store" : "force-cache",
      next: isDev ? undefined : { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Apps Script fetch failed: ${res.status}`);
      return null;
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const raw = await res.text();

    if (!raw.trim().startsWith("{") && !raw.trim().startsWith("[")) {
      console.error(
        "Apps Script did not return JSON. Check deployment access (Anyone with the link) and endpoint URL.",
        {
          contentType,
          preview: raw.slice(0, 180),
        }
      );
      return null;
    }

    const data = JSON.parse(raw) as Partial<DashboardData>;

    const liveTrends = normalizeTrendList(data.trends);
    const trends = hasUsablePulseHistory(liveTrends) ? liveTrends : [];
    const latestTrendScore =
      trends.length > 0
        ? Number(trends[trends.length - 1].overallScore) || 0
        : 0;
    const rawScore = Number((data.summary || {}).overallScore);
    const resolvedScore = rawScore > 0 ? rawScore : latestTrendScore;

    if (!data.summary || !Array.isArray(data.areaScores) || data.areaScores.length === 0) {
      return null;
    }

    const normalized: DashboardData = {
      cycle: String(data.cycle || "").trim() || "Unknown",
      generatedDate: String(data.generatedDate || "").trim() || new Date().toISOString().split("T")[0],
      narrativeSummary: data.narrativeSummary,
      summary: {
        totalResponses: Number((data.summary || {}).totalResponses) || 0,
        highestArea: String((data.summary || {}).highestArea || ""),
        lowestArea: String((data.summary || {}).lowestArea || ""),
        overallStatus: String((data.summary || {}).overallStatus || ""),
        overallScore: resolvedScore,
        teamSize: Number((data.summary || {}).teamSize) || undefined,
      },
      areaScores: Array.isArray(data.areaScores) ? data.areaScores : [],
      trends,
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      actions: Array.isArray(data.actions) ? data.actions : [],
      responseCurrentRawData: Array.isArray(data.responseCurrentRawData) && data.responseCurrentRawData.length > 0
        ? data.responseCurrentRawData
        : undefined,
      responseAllRawData: Array.isArray(data.responseAllRawData) && data.responseAllRawData.length > 0
        ? data.responseAllRawData
        : undefined,
      roleSplit: Array.isArray(data.roleSplit) && data.roleSplit.length > 0
        ? data.roleSplit
        : undefined,
      responseCounts: Array.isArray(data.responseCounts) && data.responseCounts.length > 0
        ? data.responseCounts
        : undefined,
      responseMix: Array.isArray(data.responseMix) && data.responseMix.length > 0
        ? data.responseMix
        : undefined,
    };

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
    return null;
  }
}
