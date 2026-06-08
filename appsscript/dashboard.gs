/**
 * B2CSS Pulse Dashboard — Apps Script JSON Endpoint
 * ────────────────────────────────────────────────────────────────────────────
 * HOW TO USE:
 *   1. Open your Google Sheet → Extensions → Apps Script
 *   2. Paste this entire file into Code.gs (replace existing content)
 *   3. Click Deploy → New Deployment → Web App
 *      - Execute as: Me
 *      - Who has access: Anyone  (or "Anyone within [org]" for internal use)
 *   4. Copy the deployment URL
 *   5. Paste it into pulse-dashboard/.env.local as APPS_SCRIPT_URL=<url>
 *
 * SHEET TAB NAMES (must match exactly — update constants below if yours differ):
 *   - Summary
 *   - Trend
 *   - Recommendation Themes
 *   - Settings (for cycle name + generated date)
 *
 * This script READS ONLY. It does not write to or modify any sheet.
 */

// ── Sheet name constants ─────────────────────────────────────────────────────
var SHEET_SUMMARY         = "Summary";
var SHEET_TREND           = "Trend";
var SHEET_RECOMMENDATIONS = "Recommendation Themes";
var SHEET_SETTINGS        = "Settings";

// ── Main endpoint ────────────────────────────────────────────────────────────
function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var payload = {
      cycle:           getCycle(ss),
      generatedDate:   getGeneratedDate(),
      summary:         getSummary(ss),
      areaScores:      getAreaScores(ss),
      trends:          getTrends(ss),
      recommendations: getRecommendations(ss),
      actions:         getActions(ss),
    };

    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    var error = { error: true, message: e.message };
    return ContentService
      .createTextOutput(JSON.stringify(error))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Settings helpers ─────────────────────────────────────────────────────────
/**
 * Reads the current cycle label from the Settings sheet.
 * Expected layout: Column A = key, Column B = value
 * Row with "Current Cycle" in column A holds the cycle string (e.g. "Q2 2026")
 */
function getCycle(ss) {
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) return "Unknown Cycle";

  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === "current cycle") {
      return String(data[i][1]).trim();
    }
  }
  return "Unknown Cycle";
}

function getGeneratedDate() {
  // ISO date string of today — frontend formats this for display
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// ── Summary ──────────────────────────────────────────────────────────────────
/**
 * Reads pre-calculated values from the Summary sheet.
 * Expected layout (adjust row/column indices to match your sheet):
 *   Row 2: Total Responses | Overall Score | Overall Status | Highest Area | Lowest Area
 */
function getSummary(ss) {
  var sheet = ss.getSheetByName(SHEET_SUMMARY);
  if (!sheet) return {};

  // Read named cells — adjust getCellValue() calls to match your actual layout
  return {
    totalResponses: getCellByLabel(sheet, "Total Responses"),
    overallScore:   parseFloat(getCellByLabel(sheet, "Overall Score")) || 0,
    overallStatus:  String(getCellByLabel(sheet, "Overall Status") || ""),
    highestArea:    String(getCellByLabel(sheet, "Highest Area")    || ""),
    lowestArea:     String(getCellByLabel(sheet, "Lowest Area")     || ""),
  };
}

/**
 * Scans column A for a matching label and returns the value in column B.
 * This makes the script resilient to rows being reordered.
 */
function getCellByLabel(sheet, label) {
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === label.toLowerCase()) {
      return data[i][1];
    }
  }
  return null;
}

// ── Area Scores ───────────────────────────────────────────────────────────────
/**
 * Reads area name + score pairs from the Summary sheet.
 * Expected layout: rows where column A = area name, column B = score (number)
 * Skip header row and any rows that don't look like area scores.
 *
 * Adjust the AREA_NAMES list to match your survey areas exactly.
 */
var AREA_NAMES = [
  "Direction & Priorities",
  "Value & Focus",
  "Ownership & Empowerment",
  "Ways of Working",
  "Collaboration & Support",
  "Workload & Sustainability",
  "Team Climate & Safety",
];

function getAreaScores(ss) {
  var sheet = ss.getSheetByName(SHEET_SUMMARY);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var scores = [];

  for (var i = 0; i < data.length; i++) {
    var area = String(data[i][0]).trim();
    if (AREA_NAMES.indexOf(area) !== -1) {
      scores.push({
        area:  area,
        score: parseFloat(data[i][1]) || 0,
      });
    }
  }
  return scores;
}

// ── Trend ─────────────────────────────────────────────────────────────────────
/**
 * Reads historical cycle data from the Trend sheet.
 * Expected layout: Column A = cycle label (e.g. "Q1 2026"), Column B = overall score
 * Row 1 = header, data starts row 2.
 */
function getTrends(ss) {
  var sheet = ss.getSheetByName(SHEET_TREND);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var trends = [];

  for (var i = 1; i < data.length; i++) { // skip header row
    var cycle = String(data[i][0]).trim();
    var score = parseFloat(data[i][1]);
    if (cycle && !isNaN(score)) {
      trends.push({ cycle: cycle, overallScore: score });
    }
  }
  return trends;
}

// ── Recommendation Themes ─────────────────────────────────────────────────────
/**
 * Reads from the Recommendation Themes sheet.
 * Expected columns: A = Theme, B = Frequency (number), C = Suggested Action
 * Row 1 = header.
 */
function getRecommendations(ss) {
  var sheet = ss.getSheetByName(SHEET_RECOMMENDATIONS);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var recs = [];

  for (var i = 1; i < data.length; i++) {
    var theme  = String(data[i][0]).trim();
    var freq   = parseInt(data[i][1], 10);
    var action = String(data[i][2]).trim();
    if (theme) {
      recs.push({
        theme:           theme,
        frequency:       isNaN(freq) ? 0 : freq,
        suggestedAction: action,
      });
    }
  }
  return recs;
}

// ── Action Tracker ─────────────────────────────────────────────────────────────
/**
 * Reads from the Settings sheet (or a dedicated "Action Tracker" tab if you create one).
 * Expected columns: A = Concern, B = Suggested Action, C = Owner, D = Status
 * Row 1 = header.
 *
 * To use a dedicated tab, create "Action Tracker" sheet and update the name below.
 */
var SHEET_ACTIONS = "Action Tracker"; // change if your tab has a different name

function getActions(ss) {
  var sheet = ss.getSheetByName(SHEET_ACTIONS);
  if (!sheet) return []; // returns empty array if tab doesn't exist yet

  var data = sheet.getDataRange().getValues();
  var actions = [];

  for (var i = 1; i < data.length; i++) {
    var concern = String(data[i][0]).trim();
    if (!concern) continue;
    actions.push({
      concern:         concern,
      suggestedAction: String(data[i][1]).trim(),
      owner:           String(data[i][2]).trim(),
      status:          String(data[i][3]).trim() || "Planned",
    });
  }
  return actions;
}
