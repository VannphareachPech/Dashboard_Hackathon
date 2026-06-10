"use client";

import { useState, useEffect } from "react";
import type { GeminiInsightsResponse, GeminiInsightRow } from "@/types/gemini";

type Priority = "High" | "Medium" | "Low";

const PRIORITY_STYLES: Record<Priority, string> = {
  High:   "bg-rose-50 text-rose-700 ring-rose-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Low:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

interface Props {
  cycle: string;
  summary: object;
  areaScores: object[];
  trends: object[];
  recommendations: object[];
}

function isGeminiInsightRow(value: unknown): value is GeminiInsightRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  const priority = row.priority;
  return (
    typeof row.area === "string" &&
    typeof row.insight === "string" &&
    typeof row.recommendation === "string" &&
    (priority === "High" || priority === "Medium" || priority === "Low")
  );
}

function isGeminiInsightsResponse(value: unknown): value is GeminiInsightsResponse {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.summary === "string" &&
    Array.isArray(payload.rows) &&
    payload.rows.every(isGeminiInsightRow)
  );
}

export default function GeminiInsights({ cycle, summary, areaScores, trends, recommendations }: Props) {
  const cacheKey = `gemini_insights_${cycle}`;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeminiInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0); // seconds remaining before next allowed click
  const [dailyQuotaExhausted, setDailyQuotaExhausted] = useState(false);

  // Load cached result from localStorage on mount (survives server restarts)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return;
      const parsed = JSON.parse(cached);
      if (isGeminiInsightsResponse(parsed)) {
        setResult(parsed);
      } else {
        localStorage.removeItem(cacheKey);
      }
    } catch { /* ignore parse errors */ }
  }, [cacheKey]);

  // Tick the cooldown counter down every second
  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  async function handleGenerate() {
    if (loading || cooldown > 0 || dailyQuotaExhausted) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setDailyQuotaExhausted(false);

    try {
      const res = await fetch("/api/gemini-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle, summary, areaScores, trends, recommendations }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Unexpected error from Gemini API.");
        // Clear any stale localStorage cache so next attempt calls the API fresh
        try { localStorage.removeItem(cacheKey); } catch { /* ignore */ }
        if (res.status === 429) {
          if (data.dailyQuotaExhausted) {
            setDailyQuotaExhausted(true); // no point in retrying — quota is gone for today
          } else {
            startCooldown(data.retryAfter ?? 60);
          }
        }
      } else {
        if (!isGeminiInsightsResponse(data)) {
          setError("Gemini response format was invalid. Please try again.");
          try { localStorage.removeItem(cacheKey); } catch { /* ignore */ }
          return;
        }

        const insights = data;
        setResult(insights);
        // Persist to localStorage so server restarts don't force a re-call
        try { localStorage.setItem(cacheKey, JSON.stringify(insights)); } catch { /* quota full */ }
      }
    } catch (err: any) {
      setError(err.message ?? "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">

      {/* ── Header + Button ────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-slate-800">AI-Generated Insights</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by Gemini to produce area-specific recommendations from this pulse.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || cooldown > 0 || dailyQuotaExhausted}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Generating…
            </>
          ) : cooldown > 0 ? (
            <>Retry in {cooldown}s</>
          ) : dailyQuotaExhausted ? (
            <>Quota Exhausted</>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Insights
            </>
          )}
        </button>
      </div>

      {/* ── Error ─────────────────────────────────── */}
      {error && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm space-y-1 ${
            dailyQuotaExhausted ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          <p>{dailyQuotaExhausted
            ? "Daily API quota exhausted for this key."
            : error}
          </p>
          {dailyQuotaExhausted && (
            <p className="text-xs">
              Get a free replacement key at{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                className="underline font-medium">aistudio.google.com/app/apikey</a>
              , then update <code className="font-mono bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> in{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> and restart the server.
            </p>
          )}
        </div>
      )}

      {/* ── Summary ───────────────────────────────── */}
      {result?.summary && (
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-800 leading-relaxed">
          {result.summary}
        </div>
      )}

      {/* ── Table ─────────────────────────────────── */}
      {Array.isArray(result?.rows) && result.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2.5 font-semibold text-slate-600 border-b border-slate-200 w-1/5">Area</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 border-b border-slate-200 w-2/5">Insight</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 border-b border-slate-200 w-2/5">Recommendation</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 border-b border-slate-200 text-center w-[90px]">Priority</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row: GeminiInsightRow, i: number) => (
                <tr key={row.area} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-slate-100 align-top">
                    {row.area}
                  </td>
                  <td className="px-4 py-3 text-slate-600 border-b border-slate-100 align-top">
                    {row.insight}
                  </td>
                  <td className="px-4 py-3 text-slate-600 border-b border-slate-100 align-top">
                    {row.recommendation}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100 align-top text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${PRIORITY_STYLES[row.priority as Priority] ?? PRIORITY_STYLES.Low}`}
                    >
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Empty state before first click ────────── */}
      {!result && !loading && !error && (
        <p className="text-sm text-slate-400 text-center py-6">
          Click <span className="font-medium text-slate-600">Generate Insights</span> to analyse this pulse with Gemini.
        </p>
      )}
    </div>
  );
}
