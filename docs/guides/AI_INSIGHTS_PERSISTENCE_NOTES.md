# AI Insights Update Notes

Date updated: 2026-06-11

## Summary

This note captures the latest Gemini Insights rework and persistence behavior now running in the dashboard.

## Implemented Changes

### 1) Insights schema + table layout

- Output moved from area-based rows to theme-level rows.
- Current table columns:
  - Role Groups Mentioning
  - Insight
  - Recommendation
- Priority column is kept in code as commented rollback blocks.

### 2) Prompt quality improvements

- Prompt now asks for business-presentation style language.
- Summary instructions were tightened for executive readability.
- Output contract is constrained to structured JSON.
- Role-split context is included in prompt input.

### 3) Role split wiring

- `roleSplit` is passed from page-level data into `GeminiInsights`.
- `roleSplit` is sent in POST body to `/api/gemini-insights`.
- API uses role-group breadth plus recommendation frequency for deterministic ranking.

### 4) Spreadsheet persistence by cycle

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

### 5) Regenerate behavior (important)

- If data fingerprint is unchanged, API now returns stored insight directly.
- Gemini is NOT called again for unchanged data.
- This prevents row-count drift (for example 4 rows becoming 5) on unchanged inputs.

### 6) Confirm dialog UX

- Native browser `window.confirm` replaced with in-app modal matching dashboard style.
- Confirmation flow simplified to avoid duplicate popups.
- Current behavior is a single regenerate confirmation UX.

### 7) Loading UX improvements

- Added in-card loading panel (not only button spinner).
- Added rotating status messages by elapsed time.
- Added pseudo progress bar capped before completion.
- Added wait-time reassurance text for longer runs.

### 8) Stale cache fix

- On mount, if backend responds `exists: false`, component now clears localStorage cache for that cycle.
- Prevents showing old generated rows after persistence data is removed.

### 9) Saved metadata display cleanup

- Removed time and "by" from saved line.
- UK date formatting applied.
- Pulse label is bold.
- Example display: `Saved for Pulse 3 on 11 June 2026.`

### 10) Recommendation wording tune

- Prompt was tuned to reduce repetitive numeric phrasing in recommendations.
- Recommendations now prefer business outcome language (for example delivery predictability, decision velocity, quality, risk reduction, customer value, team sustainability).
- Prompt now explicitly says not to mention numeric score deltas or "point gap" by default.
- Numeric gap mention is only allowed when high severity and essential, and should be brief.

### 11) Gemini prompt Rule

Rules:
- Return at most 5 rows.
- Use theme-level insights, not area names as insight labels.
- roleGroupsMentioning must use only role names from role split data when available.
- Prioritize themes with broader cross-role impact and frequent recurrence in Signals.
- Write in business presentation tone: clear, concise, executive-friendly, and non-technical.
- summary must be exactly 2 sentences:
  sentence 1: current state and strongest signal.
  sentence 2: biggest risk and immediate focus.
- insight should be short and presentation-ready (2 to 6 words, title case preferred).
- recommendation must be one sentence, action-led, specific owner or team implied, and framed in business outcomes.
- Prefer impact language such as delivery predictability, decision velocity, quality, risk reduction, customer value, or team sustainability.
- Do NOT mention numeric score deltas or "point gap" by default.
- Mention a numeric gap only when it is essential and high severity (for example roleGap >= 1.5 or critical risk signal), and even then keep it brief.
- Avoid filler words, hedging, and jargon (for example: "maybe", "might", "leverage", "synergy").
- mention strongest area and biggest risk in summary.
```

### 12) Plain-English explanation

- Team pulse data section: This is the fact sheet we send to Gemini before it writes anything. It gives the model the key context in one place, such as pulse score and status, response volume, confidence level, trend direction, strongest and weakest areas, common themes, and role hotspots.
- Gemini gets a clear picture of what is happening in the team, so insights are more relevant and less generic.
- Return ONLY section: This is the strict output contract. Gemini must return JSON only, with one 2-sentence summary and a rows array that matches our table fields. No markdown and no free-form paragraphs.
- Why this matters: The UI can render it safely, and we can store/reload it without formatting errors.

Example Team pulse data block:

```text
Team pulse data:
pulseMeta: cycle=Pulse 3, score=3.4/5, status=Watch, totalResponses=40, participationRate=80%, sampleConfidence=high
trend: recent=[Pulse 1:3.1, Pulse 2:3.3, Pulse 3:3.4], delta=+0.1, direction=improving
focus: strongestArea=Ways of Working, weakestArea=Workload & Sustainability, risks=[Workload & Sustainability, Ownership & Empowerment]
themes: Strategic Alignment(6), Decision Clarity(5), Sustainable Workload(7)
roleHotspots: Ownership & Empowerment(lowest=Product Management 2.6, Shared 4.0, roleGap=1.4); Direction & Priorities(lowest=Product Management 3.1, Shared 3.8, roleGap=0.7)
areaScores: Direction & Priorities=3.7(stable/watch); Value & Focus=3.3(improving/critical); Ownership & Empowerment=3.1(softening/critical); Ways of Working=3.9(improving/watch); Collaboration & Support=3.7(improving/watch); Workload & Sustainability=2.4(declining/critical); Team Climate & Safety=3.6(stable/watch)
```

### 13) Team pulse data redesign (latest)

The Team pulse data block was redesigned to be more structured and business-readable.

New structure now sent to Gemini:

- `pulseMeta`
  - cycle
  - overallScore / status
  - totalResponses
  - participationRate (when team size exists)
  - sampleConfidence (low/medium/high)
- `trend`
  - recent overall scores
  - delta from previous pulse
  - direction label
- `focus`
  - strongestArea
  - weakestArea
  - top risk areas (filtered)
- `themes`
  - top recurring recommendation themes with frequency
- `roleHotspots`
  - top role mismatch areas by roleGap (top 3)
- `areaScores`
  - compact area score + trend + band list

Why this redesign was made:

- reduce noisy, overly long prompt context
- improve business traceability and readability
- reduce repetitive numeric wording in final recommendations
- add confidence-aware behavior for low sample sizes

## Current Operational Notes

- Shared source of truth is spreadsheet persistence, not browser cache.
- localStorage remains fallback cache only.
- If Apps Script returns login HTML instead of JSON, deployment runtime/access settings must be checked in Apps Script UI.

## Files touched across this work

- `app/api/gemini-insights/route.ts`
- `components/GeminiInsights.tsx`
- `types/gemini.ts`
- `app/page.tsx`
- `appsscript/dashboard.gs`
- `appsscript/.clasp.json`
- `appsscript/appsscript.json`
- `.env.local`
