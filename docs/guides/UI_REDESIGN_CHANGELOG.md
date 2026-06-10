# UI Redesign Changelog

## Session: 2026-06-11 — UI Polish & Data Improvements

### ResponseCountChart (`components/ResponseCountChart.tsx`)
- Increased chart height from 260px → 300px
- Increased bar width: `barCategoryGap` 45% → 30%, `maxBarSize` 34 → 56
- Added `teamSize` prop — Y-axis max now reflects actual team headcount instead of auto-scaling to highest bar
- Set `tickCount={6}` + `allowDecimals={false}` for cleaner Y-axis ticks (e.g. 0, 10, 20, 30, 40, 50)
- Added **delta badge** in top-right of card header showing `+X%` / `-X%` change between latest two pulses with cycle label (e.g. `Pulse 2 → Pulse 3`)
- Added empty state card (was previously `return null` — card disappeared silently)

### TrendChart (`components/TrendChart.tsx`)
- Added same **delta badge** in top-right of card header showing score change (e.g. `+0.3`) between latest two pulses
- Added `h-full flex flex-col` to card container so it matches height of adjacent ResponseCountChart

### page.tsx (`app/page.tsx`)
- Removed conditional `{responseCounts && responseCounts.length > 0 && ...}` wrapper — ResponseCountChart always renders and handles its own empty state
- Removed conditional wrappers for `ResponseMixChart` and `RoleSplitHeatmap` — both now always render with their own empty states
- Participation/Sentiment grid is now always `lg:grid-cols-2` regardless of data
- Passed `teamSize={summary?.teamSize}` to `ResponseCountChart`

### Empty State Standardization (all charts)
All charts now show a consistent empty state card instead of returning `null` or using inconsistent styles.

| Component | Before | After |
|---|---|---|
| `ResponseCountChart` | `return null` | Standard empty card |
| `ResponseMixChart` | `return null` | Standard empty card |
| `RoleSplitHeatmap` | `return null` | Standard empty card |
| `ScoreChart` | No guard (potential crash) | Standard empty card |
| `CurrentPulseBarChart` | Old `border-slate-200 p-6` style | Standard empty card |
| `PulseQuestionTrendChart` | Old `border-slate-200 p-6`, no title | Standard empty card with title |
| `OverallResponseMixTrendChart` | Old `border-slate-200 p-6` | Standard empty card |

### Card & Typography Standardization
Standardized all chart cards to a single consistent design system:

- **Card container:** `bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 p-5`
- **Card title:** `text-lg font-semibold text-slate-700`
- **Card subtitle:** `text-xs text-slate-500 mt-0.5`

Files updated: `ScoreChart`, `CurrentPulseBarChart`, `OverallResponseMixTrendChart`, `PulseQuestionTrendChart`, `GeminiInsights`, `ResponseCountByPulseChart`

Additional fixes in `PulseQuestionTrendChart`:
- Tooltip: `text-gray-800` / `text-gray-500` → `text-slate-800` / `text-slate-500`
- Footer note: `text-[11px] text-gray-400` → `text-xs text-slate-400`

### GeminiInsights (`components/GeminiInsights.tsx`)
- Card title changed from `text-base font-semibold text-slate-800` → `text-lg font-semibold text-slate-700`
- Subtitle color: `text-slate-400` → `text-slate-500`
- Card container: `rounded-xl border border-slate-200 p-6` → standard card style

### Gemini Insights — Empty Role Fix (`app/api/gemini-insights/route.ts`)
- Added filter to drop rows where `roleGroupsMentioning` is blank (Gemini was occasionally returning rows with no role group populated)
- Updated prompt rule: `roleGroupsMentioning` is now explicitly required; Gemini is instructed it must never be empty and to use `"All Groups"` if a theme is broadly cross-cutting

### ScoreChart (`components/ScoreChart.tsx`)
- Chart height: 400px → 340px
- Added top-level empty state guard for `areaScores.length === 0`
- Subtitle spacing: `mb-3` → `mt-0.5 mb-3`

---

## Standard Design Tokens (reference)

| Token | Value |
|---|---|
| Card bg | `bg-white` |
| Card border | `border border-slate-100` |
| Card shadow | `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` |
| Card radius | `rounded-xl` |
| Card padding | `p-5` |
| Title | `text-lg font-semibold text-slate-700` |
| Subtitle | `text-xs text-slate-500 mt-0.5` |
| Empty state text | `text-sm text-slate-400 mt-3` |
| Delta positive | `text-emerald-600` |
| Delta negative | `text-rose-500` |
| Delta neutral | `text-slate-400` |
