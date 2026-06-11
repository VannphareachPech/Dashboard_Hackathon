# AI Insights Update Notes

Date Updated: 2026-06-11

## Summary

This note captures the latest Gemini Insights rework and persistence behavior now running in the dashboard.

## Implemented Changes

### 1) Insights Schema + Table Layout

- Output moved from area-based rows to theme-level rows.
- Current table columns:
  - Role Groups Mentioning
  - Insight
  - Recommendation
- Priority column is kept in code as commented rollback blocks.

### 2) Prompt Quality Improvements

- Prompt now asks for business-presentation style language.
- Summary instructions were tightened for executive readability.
- Output contract is constrained to structured JSON.
- Role-split context is included in prompt input.

### 3) Role Split Wiring

- `roleSplit` is passed from page-level data into `GeminiInsights`.
- `roleSplit` is sent in POST body to `/api/gemini-insights`.
- API uses role-group breadth plus recommendation frequency for deterministic ranking.

### 4) Spreadsheet Persistence by Cycle

- New persistence flow uses Apps Script sheet storage (`AI Insights`).
- One active record per cycle; replaced records become `superseded`.
- Metadata stored with each record:
  - cycle
  - status
  - generatedAt
  - generatedBy
  - dataFingerprint
  - summary
  - rowsJson

### 5) Regenerate Behavior (Important)

- If data fingerprint is unchanged, API now returns stored insight directly.
- Gemini is NOT called again for unchanged data.
- This prevents row-count drift (for example 4 rows becoming 5) on unchanged inputs.

### 6) Confirm Dialog UX

- Native browser `window.confirm` replaced with in-app modal matching dashboard style.
- Confirmation flow simplified to avoid duplicate popups.
- Current behavior is a single regenerate confirmation UX.

### 7) Loading UX Improvements

- Added in-card loading panel (not only button spinner).
- Added rotating status messages by elapsed time.
- Added pseudo progress bar capped before completion.
- Added wait-time reassurance text for longer runs.

### 8) Stale Cache Fix

- On mount, if backend indicates cache miss (`found: false` or `exists: false`), component clears localStorage cache for that cycle.
- Prevents showing old generated rows after persistence data is removed.

### 9) Saved Metadata Display Cleanup

- Removed time and "by" from saved line.
- UK date formatting applied.
- Pulse label is bold.
- Example display: `Saved for Pulse 3 on 11 June 2026.`

### 10) Recommendation Wording Tune

- Prompt was tuned to reduce repetitive numeric phrasing in recommendations.
- Recommendations now prefer business outcome language (for example delivery predictability, decision velocity, quality, risk reduction, customer value, team sustainability).
- Prompt now explicitly says not to mention numeric score deltas or "point gap" by default.
- Numeric gap mention is only allowed when high severity and essential, and should be brief.

### 11) Gemini Prompt Rule

Rules:
- Return at most 5 rows.
- Use theme-level insights, not area names as insight labels.
- `roleGroupsMentioning` must use only role names from role split data when available.
- Prioritize themes with broader cross-role impact and frequent recurrence in Signals.
- Write in business presentation tone: clear, concise, executive-friendly, and non-technical.
- `summary` must be exactly 2 sentences:
  Sentence 1: current state and strongest signal.
  Sentence 2: biggest risk and immediate focus.
- `insight` should be short and presentation-ready (2 to 6 words, title case preferred).
- `recommendation` must be one sentence, action-led, specific owner or team implied, and framed in business outcomes.
- Prefer impact language such as delivery predictability, decision velocity, quality, risk reduction, customer value, or team sustainability.
- Do NOT mention numeric score deltas or "point gap" by default.
- Mention a numeric gap only when it is essential and high severity (for example `roleGap >= 1.5` or critical risk signal), and even then keep it brief.
- Avoid filler words, hedging, and jargon (for example: "maybe", "might", "leverage", "synergy").
- Mention strongest area and biggest risk in summary.

### 12) Plain-English Explanation

- Team pulse data section: This is the fact sheet we send to Gemini before it writes anything. It gives the model the key context in one place, such as pulse score and status, response volume, confidence level, trend direction, strongest and weakest areas, common themes, and role hotspots.
- Gemini gets a clear picture of what is happening in the team, so insights are more relevant and less generic.
- Return ONLY section: This is the strict output contract. Gemini must return JSON only, with one 2-sentence summary and a rows array that matches our table fields. No markdown and no free-form paragraphs.
- Why this matters: The UI can render it safely, and we can store/reload it without formatting errors.

Example Team Pulse Data Block:

```text
Team pulse data:
pulseMeta: cycle=Pulse 3, score=3.7/5, status=Stable, totalResponses=40, participationRate=80%, sampleConfidence=high
trend: recent=[Pulse 1:3.1, Pulse 2:3.4, Pulse 3:3.7], delta=+0.3, direction=improving
focus: strongestArea=Ways of Working, weakestArea=Workload & Sustainability, risks=[Workload & Sustainability, Ownership & Empowerment]
themes: Strategic Alignment(6), Decision Clarity(5), Sustainable Workload(7)
roleHotspots: Ownership & Empowerment(lowest=Product Management 2.6, Shared 4.0, roleGap=1.4); Direction & Priorities(lowest=Product Management 3.1, Shared 3.8, roleGap=0.7)
areaScores: Direction & Priorities=3.7(stable/watch); Value & Focus=3.3(improving/critical); Ownership & Empowerment=3.1(softening/critical); Ways of Working=3.9(improving/watch); Collaboration & Support=3.7(improving/watch); Workload & Sustainability=2.4(declining/critical); Team Climate & Safety=3.6(stable/watch)
```

### 13) Team Pulse Data Redesign (Latest)

The Team pulse data block was redesigned to be more structured and business-readable.

New Structure Now Sent to Gemini:

- `pulseMeta`
  - Cycle.
  - Overall score / status.
  - Total responses.
  - Participation rate (when team size exists).
  - Sample confidence (low/medium/high).
- `trend`
  - Recent overall scores.
  - Delta from previous pulse.
  - Direction label.
- `focus`
  - Strongest area.
  - Weakest area.
  - Top risk areas (filtered).
- `themes`
  - Top recurring recommendation themes with frequency.
- `roleHotspots`
  - Top role mismatch areas by `roleGap` (top 3).
- `areaScores`
  - Compact area score + trend + band list.

Why This Redesign Was Made:

- Reduce noisy, overly long prompt context.
- Improve business traceability and readability.
- Reduce repetitive numeric wording in final recommendations.
- Add confidence-aware behavior for low sample sizes.

## Current Operational Notes

- Shared source of truth is spreadsheet persistence, not browser cache.
- `localStorage` remains fallback cache only.
- If Apps Script returns login HTML instead of JSON, deployment runtime/access settings must be checked in Apps Script UI.

## Files Touched Across This Work

- `app/api/gemini-insights/route.ts`
- `components/GeminiInsights.tsx`
- `types/gemini.ts`
- `app/page.tsx`
- `appsscript/DashboardService.gs`
- `.env.local`

## Session Addendum (2026-06-11)

### 14) Current-Pulse Narrative Score Alignment (Trend-First)

- Leadership Readout text showed `3.4/5` while the dashboard hero score showed trend-first `3.7/5`.
- Root cause: `getNarrativeSummary()` generated sentence text using `summary.overallScore` (sheet summary value), not latest trend score.
- Fix applied in `appsscript/DashboardService.gs`:
  - Narrative score now resolves from latest trend point when available.
  - Falls back to summary score only if trend score is missing.

### 15) Cached Insight Retrieval Compatibility Fix

- Cached AI insight existed in `AI Insights` tab but API still called Gemini on `Generate Insights`.
- Root cause: response shape mismatch.
  - Apps Script returns flat shape: `{ found, summary, rows, ... }`
  - API route expected nested shape: `{ exists, insight: { summary, rows } }`
- Fix applied in `app/api/gemini-insights/route.ts`:
  - `fetchStoredInsight()` now supports both flat and nested payload shapes.
  - `found` and `exists` are both accepted.
  - Summary/rows/fingerprint metadata are read from whichever shape is present.
- Result: when current pulse data already exists in sheet, `Generate Insights` returns stored content instead of calling Gemini.

### 16) Operational Clarification

- `Generate Insights` should now prioritize cached current-pulse data from spreadsheet persistence.
- `Regenerate Insights` still forces a fresh Gemini call path.
- This behavior is now consistent with the intended cache-first design.
