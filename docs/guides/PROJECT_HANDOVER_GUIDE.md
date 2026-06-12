# Project Handover Guide

## 1) Project Snapshot

- Project name: Pulse Dashboard
- Current state: Hackathon build moving toward production readiness
- Primary users: Leadership team
- Business purpose: Visualize pulse survey signals and leadership actions

### Current Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Charts/UI: Recharts, lucide-react
- Data endpoint: Google Apps Script Web App
- Data source: Google Sheets
- AI insights: Gemini-driven endpoint and Apps Script persistence path

### Runtime Model

- Browser requests dashboard pages from Next.js app.
- Next.js server fetches dashboard data from Apps Script endpoint.
- Apps Script reads and transforms Google Sheets tabs, returns JSON.

## 2) Repository Layout (High-Value Areas)

- app/: Next.js routes, page composition, API routes
- components/: Dashboard cards, charts, and UI sections
- lib/: Server-side data fetch/transformation helpers
- types/: Shared TypeScript contracts
- appsscript/: Google Apps Script services and orchestration
- docs/guides/: Operational notes, changelogs, and maintenance references

## 3) Critical Files to Read First

1. docs/guides/APPS_SCRIPT_FILE_REFERENCE.md
- What each Apps Script file does and key function map.

2. docs/guides/AI_INSIGHTS_PERSISTENCE_NOTES.md
- AI insight generation and persistence behavior.

3. docs/guides/REFACTORING_SUMMARY.md
- Historical refactoring decisions and risk areas.

4. docs/guides/UI_REDESIGN_CHANGELOG.md
- UI-level design changes and behavior impacts.

5. lib/fetchDashboard.ts
- Primary server-side data fetch path from Next.js to Apps Script.

6. app/api/gemini-insights/route.ts
- API path for AI insight generation/refresh workflows.

7. appsscript/DashboardService.gs
- Main Apps Script doGet/doPost endpoint logic.

## 4) Local Setup and Runbook

### Prerequisites

- Node.js LTS
- npm
- Access to target Google Sheet and Apps Script project

### Install and Run

1. Install dependencies:
- npm install

2. Start dev server:
- npm run dev

3. Build check:
- npm run build

4. Lint and typecheck:
- npm run lint
- npm run typecheck

## 5) Environment Variables and Config

Use this table as the source of truth and keep values out of source control.

| Variable | Required | Used By | Purpose | Secret | Owner |
|---|---|---|---|---|---|
| APPS_SCRIPT_URL | Yes | Next.js server + API routes | Dashboard/AI endpoint base URL | No (but sensitive) | Engineering |
| GEMINI_API_KEY | For AI routes | Next.js API route | Gemini model call authentication | Yes | Engineering |
| DEMO_PARTICIPATION_TEXT | Optional | UI page rendering | Overrides participation text in demo mode | No | Product/Engineering |
| APPS_SCRIPT_SHARED_SECRET | Planned | Next.js + Apps Script | Temporary request authorization hardening | Yes | Engineering/Security |

### Environment Ownership Checklist

- Dev environment owner assigned
- Production environment owner assigned
- Rotation cadence defined for secrets
- Secret manager location documented

## 6) Access Transfer Matrix

Document exact access before handover date.

| System | Access Needed | Minimum Role | Backup Owner | Notes |
|---|---|---|---|---|
| Git repository | Read/Write | Maintainer |  |  |
| Deployment platform | Deploy + logs | Developer/Operator |  |  |
| Google Apps Script project | Edit + deploy web app | Editor |  | Restrict to trusted maintainers |
| Google Sheet data source | Edit as needed | Editor |  | Consider least privilege by role |
| Monitoring/logs | View + alert ack | Viewer/Operator |  |  |

## 7) Data and Contract Documentation

### API Contract

Capture and keep updated:
- Endpoint URL(s)
- Supported actions and request shapes
- Response schema per action
- Error payload schema
- Timeout/retry behavior

### Data Dictionary

Capture and keep updated:
- Sheet tabs consumed
- Required column headers
- Value types and allowed ranges
- Null/empty handling rules
- Derived field formulas and mappings

## 8) Operations: Deploy, Monitor, Rollback

### Deploy Process

1. Confirm branch/tag and release notes
2. Run lint, typecheck, build
3. Deploy to target environment
4. Run smoke test checklist
5. Monitor error and latency for stabilization window

### Rollback Process

1. Trigger rollback if data mismatch, auth failures, or error spikes exceed threshold
2. Switch endpoint/config to last known stable release
3. Re-run smoke tests
4. Publish incident note and next action owner

### Monitoring Expectations

Track at minimum:
- API success/error rate
- API response latency
- Next.js route errors
- Auth failure counts
- Data freshness signals

## 9) Security Posture and Migration Direction

### Current

- Apps Script endpoint pattern with sheet-backed data
- Potential temporary shared-secret protection between Next.js and Apps Script

### Target (Enterprise)

- Private Cloud Run API with IAM-based service-to-service auth
- Short-lived identity tokens instead of static shared secret
- Secret Manager + audit logging + least-privilege service accounts

### Security Controls Checklist

- No secrets in repository
- Secret rotation documented
- Access reviews scheduled
- Unauthorized access alerts configured
- Data access logged and retained per policy

## 10) QA Regression and Security Checklist

### Functional Regression

- Dashboard loads all cards and charts
- Empty states render correctly when data is missing
- Trend and score calculations match expected values
- AI insights display and refresh behavior is correct

### Security Validation

- Unauthorized endpoint requests denied
- Invalid credentials/token denied
- Sensitive values absent from logs and responses
- Access attempts are traceable in logs

### Data Integrity

- Field-by-field parity against baseline samples
- No missing required fields in API payload
- Status mappings and thresholds behave as expected

## 11) Known Risks, Debt, and Backlog

Keep this section current and prioritized.

| Item | Impact | Priority | Owner | Mitigation/Next Step |
|---|---|---|---|---|
| Public Apps Script URL exposure risk | High | High |  | Apply short-term hardening, plan IAM migration |
| Runtime/data contract drift | Medium | High |  | Freeze schema and add contract checks |
| Manual operational steps | Medium | Medium |  | Add runbook automation where possible |

## 12) Handover Meeting Agenda (Recommended)

1. 10 min: Product goals and current constraints
2. 15 min: Architecture and data flow walkthrough
3. 15 min: Live runbook demo (start, verify, rollback)
4. 10 min: Security controls and incident path
5. 10 min: Open issues and ownership confirmation

## 13) Sign-Off Checklist

- Access transferred and validated
- Local setup validated by incoming developer
- Deploy and rollback dry-run completed
- QA checklist executed in target environment
- Known risks accepted with named owners
- Next 30/60/90-day plan agreed

## 14) Owner Contacts

Fill before handover date.

- Product owner:
- Engineering owner:
- Apps Script owner:
- Data owner:
- Security owner:
- On-call contact:

## 15) 30/60/90 Day Stabilization Plan Template

### First 30 Days

- Confirm baseline reliability and data parity
- Eliminate top-priority defects
- Finalize monitoring and alert thresholds

### Day 31-60

- Harden auth model and secret handling
- Reduce manual operational dependencies
- Improve automated QA coverage

### Day 61-90

- Execute enterprise auth migration plan
- Document post-migration runbook
- Close high-risk debt items

---

## Appendix A: Current Commands

- Development: npm run dev
- Build: npm run build
- Start: npm run start
- Lint: npm run lint
- Typecheck: npm run typecheck

## Appendix B: Suggested Artifacts to Attach During Handover

- Architecture diagram
- API contract samples
- Security checklist results
- Latest regression checklist results
- Open issue tracker export
- Release notes for last 2-3 deployments
