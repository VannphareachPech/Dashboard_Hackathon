# Apps Script File Reference

This document describes what each Apps Script file does, key functions in each file, and the filename changes from the previous naming convention.

## Filename Change Log

| Old Name | Current Name | Status |
|---|---|---|
| AI.gs | AIService.gs | Renamed |
| Slack.gs | SlackService.gs | Renamed |
| dashboard.gs | DashboardService.gs | Renamed |
| Summary.gs | PipelineOrchestrator.gs | Renamed |
| DataValidation.gs | ValidationService.gs | Renamed |
| Leadership.gs | ConfigManager.gs | Renamed |
| RoleSplitService.gs | RoleSplitService.gs | Unchanged |
| TrendService.gs | TrendService.gs | Unchanged |
| Utils.gs | Utils.gs | Unchanged |
| Code.gs | Code.gs | Unchanged |

## File-by-File Guide

### AIService.gs
Purpose:
- Reads score and comments data.
- Builds AI prompt and calls Gemini API.
- Writes AI summary into the AI log sheet.

Key functions:
- readScoreRows
- readKeyMetrics
- classifyRows
- readOpenTextResponses
- generateAISummary
- writeAISummaryToSheet_

### Code.gs
Purpose:
- Shared utility helpers used across all files.
- Text cleanup, score parsing, hashing, sheet helpers, and timezone formatting.

Key functions:
- safeText_
- parseScore_
- normalizeStatus_
- inferStatusFromScore_
- normalizeText_
- hashText_
- getOrCreateSheet_
- getRequiredSheet_
- getAppTimeZone_
- formatNow_

### ConfigManager.gs
Purpose:
- Holds configuration constants in PULSE_CONFIG.
- Reads runtime settings from the Settings sheet.

Key functions:
- readSettings
- getSettingRowValue_

### DashboardService.gs
Purpose:
- Main web endpoint provider for dashboard frontend.
- Reads summary/trend/recommendations/actions/role split/response mix.
- Handles GET and POST endpoint actions.

Key functions:
- onOpen
- runFullPipelineFromMenu
- setSendToSlackApproved_
- doGet
- validateSheets
- validateAndAlert
- getThresholds
- scoreToStatus
- getCycle
- getDashboardCycle
- getGeneratedDate
- getSummary
- getTrends
- getAreaScores
- getNarrativeSummary
- getRecommendations
- getActions
- archiveCurrentCycleTrend
- getRoleSplit
- getResponseCounts
- getResponseCountsFromFormResponses_
- getCurrentPulseResponseMix
- mapPulseValueToScore_
- getSheetAsMap
- normalizeLabel
- getAiInsightResponse_
- stringifyRowsForCell_
- doPost

### PipelineOrchestrator.gs
Purpose:
- Orchestrates full processing pipeline.
- Validates inputs, builds leadership summary, trend updates, and optional integrations.
- Manages trigger installation/removal.

Key functions:
- generateLeadershipSummary
- runFullPipeline
- populatePulseCycleFromSettings_
- installTriggers
- removeTriggers

### RoleSplitService.gs
Purpose:
- Computes role split outputs using fallback strategy.
- Reads role split summary/override sheets or computes from form data.
- Writes computed role split table when helper is called.

Key functions:
- getRoleSplitWithFallback
- getRoleSplitFromSheet_
- computeRoleSplitFromForm_
- buildAreaColumns_
- hasUsableRoleColumns_
- writeRoleSplitToSheet_

### SlackService.gs
Purpose:
- Sends leadership summary to Slack via webhook.
- Supports dedupe, block kit payload, fallback plain text, and approval reset.

Key functions:
- sendLeadershipSummaryToSlack
- buildSlackFocus_
- postToSlack_
- buildBlockKitPayload_
- buildPlainSlackText_
- buildDashboardLine_
- sendSlackJson_
- truncateForSlack_
- safeMrkdwn_
- resetApprovalFlag_
- computeExtremes_

### TrendService.gs
Purpose:
- Centralized trend append and historical backfill logic.
- Handles dedupe, aggregation, area mapping, and trend sorting.

Key functions:
- appendTrendRow
- backfillTrendFromFormResponses
- aggregateTrendByFormCycle_
- buildAreaColumnsForBackfill_
- buildAreaHeaderIndex_
- sortTrendSheetByCycle_

### Utils.gs
Purpose:
- Legacy helper implementations retained for backward compatibility fallback.
- Contains older trend helper versions still used as fallback in some paths.

Key functions:
- appendTrend
- backfillTrendFromFormResponses_
- sortTrendSheetByCycle_

### ValidationService.gs
Purpose:
- Pipeline validation and diagnostics.
- Validates required settings/sheets/schema and quality of computed structures.

Key functions:
- validatePipelineInputs
- validateRoleSplit
- validateAreaScores

## Notes for Maintainers

- Primary pipeline entry point is runFullPipeline in PipelineOrchestrator.gs.
- Dashboard frontend calls doGet in DashboardService.gs through APPS_SCRIPT_URL.
- LegacyConfig.gs should remain functionless unless explicitly repurposed.
- If adding new files, update this reference and the rename log table.
