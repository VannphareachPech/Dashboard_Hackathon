import { NextRequest, NextResponse } from "next/server";

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

function classifyDelta(delta: unknown) {
  if (typeof delta !== "number" || !Number.isFinite(delta)) return "unknown";
  if (delta <= -0.2) return "declining";
  if (delta >= 0.2) return "improving";
  if (delta > -0.1 && delta < 0.1) return "stable";
  return delta < 0 ? "softening" : "rising";
}

function classifyPriorityBand(score: unknown, pulsesAtRisk: unknown) {
  const safeScore = typeof score === "number" && Number.isFinite(score) ? score : null;
  const safeRisk = typeof pulsesAtRisk === "number" && Number.isFinite(pulsesAtRisk) ? pulsesAtRisk : 0;

  if ((safeScore != null && safeScore < 3.5) || safeRisk >= 2) return "critical";
  if (safeScore != null && safeScore < 4) return "watch";
  return "strong";
}

// ── In-memory cache — keyed by cycle label ────────────────────────────────────
const responseCache = new Map<string, GeminiInsightsResponse>();

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  const body = await req.json();
  const { cycle, summary, areaScores, trends, recommendations } = body;

  // Return cached result immediately — no API call
  if (cycle && responseCache.has(cycle)) {
    return NextResponse.json(responseCache.get(cycle));
  }

  // Minimal prompt to reduce token usage (fewer tokens = less quota consumed)
  const areaLines = (areaScores as any[])
    .map((area) => {
      const trend = classifyDelta(area.delta);
      const band = classifyPriorityBand(area.score, area.pulsesAtRisk);
      const deltaPart = area.delta != null && Number.isFinite(area.delta)
        ? `,delta=${area.delta > 0 ? "+" : ""}${area.delta}`
        : "";
      const riskPart = area.pulsesAtRisk ? `,riskCount=${area.pulsesAtRisk}` : "";
      return `${area.area}:score=${area.score}${deltaPart},trend=${trend},band=${band}${riskPart}`;
    })
    .join(", ");

  const trendLine = (trends as any[]).slice(-3).map((t) => `${t.cycle}:${t.overallScore}`).join(", ");

  const signalLines = (recommendations as any[]).slice(0, 3)
    .map((recommendation) => `${recommendation.theme}(${recommendation.frequency}x${recommendation.areaLink ? `,area=${recommendation.areaLink}` : ""})`)
    .join(", ");

  const prompt = `Team pulse data: cycle=${cycle}, score=${summary.overallScore}/5 (${summary.overallStatus}), n=${summary.totalResponses}, best=${summary.highestArea}, worst=${summary.lowestArea}. Areas: ${areaLines}. Trend: ${trendLine}. Signals: ${signalLines || "none"}.

Return ONLY this JSON (no markdown):
{"summary":"<2 sentences>","rows":[{"area":"<name>","insight":"<1 sentence>","recommendation":"<1 sentence>","priority":"<High|Medium|Low>"}]}

Rules: mention strongest area and biggest risk in summary. One row per area. If score<3.5 or riskCount>=2 => High. If score<4 => Medium. Else => Low. If trend=declining, describe deterioration. If trend=stable, describe consistency. If trend=improving or rising, describe momentum. Recommendations must be specific and operational, not generic, and should reflect score, trend, or riskCount.`;

  try {
    // Use gemini-2.5-flash — works with this project's free tier quota
    // Retry up to 3 times on 503 (temporary overload), but never on 429
    let geminiRes: Response | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
              topP: 0.8,
            },
          }),
        }
      );
      if (geminiRes.status !== 503) break;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 2000));
    }

    if (!geminiRes) {
      return NextResponse.json({ error: "Failed to reach Gemini API." }, { status: 502 });
    }

    if (geminiRes.status === 503) {
      return NextResponse.json(
        { error: "Gemini is temporarily overloaded. Please try again in a few seconds." },
        { status: 503 }
      );
    }

    if (geminiRes.status === 429) {
      let retryAfter = 60;
      let dailyQuotaExhausted = false;
      try {
        const errBody = await geminiRes.json();
        console.error("[gemini-insights] 429 body:", JSON.stringify(errBody));
        // Check if daily quota is exhausted (vs per-minute rate limit)
        const violations: any[] = errBody?.error?.details?.find((d: any) => d.violations)?.violations ?? [];
        dailyQuotaExhausted = violations.some((v: any) => v.quotaId?.toLowerCase().includes("perday"));
        const delayStr: string | undefined = errBody?.error?.details?.find((d: any) => d.retryDelay)?.retryDelay;
        if (delayStr) retryAfter = Math.max(parseInt(delayStr.replace(/\D/g, ""), 10) || 60, 5);
      } catch { /* ignore */ }
      const error = dailyQuotaExhausted
        ? "Daily Gemini quota exhausted. Get a new free API key at aistudio.google.com/app/apikey and update GEMINI_API_KEY in .env.local."
        : "Gemini rate limit reached. Please wait a moment and try again.";
      return NextResponse.json({ error, retryAfter, dailyQuotaExhausted }, { status: 429 });
    }

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: `Gemini API error: ${geminiRes.status} — ${err}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown fences
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Extract the JSON object even if the model added extra text around it
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[gemini-insights] No JSON object found in response:", cleaned.slice(0, 200));
      return NextResponse.json({ error: "Gemini returned an unexpected format. Please try again." }, { status: 502 });
    }

    let parsed: GeminiInsightsResponse;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[gemini-insights] JSON parse failed:", jsonMatch[0].slice(0, 300));
      return NextResponse.json({ error: "Gemini response was malformed. Please try again." }, { status: 502 });
    }

    if (cycle) responseCache.set(cycle, parsed);

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
