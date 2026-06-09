/**
 * B2CSS Pulse Dashboard — Apps Script JSON Endpoint
 * ────────────────────────────────────────────────────────────────────────────
 * PULSE CADENCE: Runs every 6 weeks. Cycle labels use short month-year format:
 *   e.g. "Jun '26", "Apr '26", "Feb '26"
 *
 * PULSE CADENCE: Runs every 6 weeks. Cycle labels use short month-year format:
 *   e.g. "Jun '26", "Apr '26", "Feb '26"
 *
 * HOW TO USE:
 *   1. Open your Google Sheet → Extensions → Apps Script
 *   2. Paste this entire file into Code.gs (replace existing content)
 *   3. Click Deploy → New Deployment → Web App
 *      - Execute as: Me
 *      - Who has access: Anyone (or "Anyone within [org]" for internal use)
 *      - Who has access: Anyone (or "Anyone within [org]" for internal use)
 *   4. Copy the deployment URL
 *   5. Paste it into pulse-dashboard/.env.local as APPS_SCRIPT_URL=<url>
 *
 * SHEET TABS REQUIRED:
 *   - Summary              col A = area name, col B = current score
 *                          also has label/value rows (e.g. "Total Responses" | 42)
 *   - Trend                col A = pulse label, col B = overall score,
 *                          col C+ = per-area scores (header row 1 matches AREA_NAMES)
 *   - Recommendation Themes col A = theme, col B = frequency, col C = action,
 *                          col D = pulses active (optional), col E = area link (optional)
 *   - Action Tracker       col A = concern, col B = action, col C = owner,
 *                          col D = status, col E = pulse opened, col F = area
 *   - Settings             key/value pairs: "Current Cycle", "Narrative Summary",
 *                          "Strong Threshold", "Stable Threshold", "Watch Threshold"
 * SHEET TABS REQUIRED:
 *   - Summary              col A = area name, col B = current score
 *                          also has label/value rows (e.g. "Total Responses" | 42)
 *   - Trend                col A = pulse label, col B = overall score,
 *                          col C+ = per-area scores (header row 1 matches AREA_NAMES)
 *   - Recommendation Themes col A = theme, col B = frequency, col C = action,
 *                          col D = pulses active (optional), col E = area link (optional)
 *   - Action Tracker       col A = concern, col B = action, col C = owner,
 *                          col D = status, col E = pulse opened, col F = area
 *   - Settings             key/value pairs: "Current Cycle", "Narrative Summary",
 *                          "Strong Threshold", "Stable Threshold", "Watch Threshold"
 *
 * CUSTOM MENU (appears in Google Sheets toolbar after opening the sheet):
 *   Pulse Dashboard > Archive this pulse cycle  — appends current scores to Trend
 *   Pulse Dashboard > Validate sheet structure  — checks all required tabs exist
 * CUSTOM MENU (appears in Google Sheets toolbar after opening the sheet):
 *   Pulse Dashboard > Archive this pulse cycle  — appends current scores to Trend
 *   Pulse Dashboard > Validate sheet structure  — checks all required tabs exist
 */

// ── Sheet name constants ──────────────────────────────────────────────────────
// ── Sheet name constants ──────────────────────────────────────────────────────
var SHEET_SUMMARY         = "Summary";
var SHEET_TREND           = "Trend";
var SHEET_RECOMMENDATIONS = "Recommendation Themes";
var SHEET_SETTINGS        = "Settings";
var SHEET_ACTIONS         = "Action Tracker";
var SHEET_ROLE_SPLIT      = "Role Split";      // optional: per-area scores by role group

// ── Default thresholds (overridden by Settings sheet if present) ─────────────
var DEFAULT_THRESHOLD_STRONG = 4.0;
var DEFAULT_THRESHOLD_STABLE = 3.5;
var DEFAULT_THRESHOLD_WATCH  = 3.0;

// ── Area names (must match Summary sheet rows exactly) ───────────────────────
var AREA_NAMES = [
  "Direction & Priorities",
  "Value & Focus",
  "Ownership & Empowerment",
  "Ways of Working",
  "Collaboration & Support",
  "Workload & Sustainability",
  "Team Climate & Safety",
];

// ── All area names including Pulse Cycle ─────────────────────────────────────
var ALL_AREA_NAMES = [
  "Direction & Priorities",
  "Value & Focus",
  "Ownership & Empowerment",
  "Ways of Working",
  "Collaboration & Support",
  "Workload & Sustainability",
  "Team Climate & Safety",
  "Pulse Cycle",
];

// ── Custom menu ───────────────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Pulse Dashboard")
    .addItem("Archive this pulse cycle", "archiveCurrentCycleTrend")
    .addSeparator()
    .addItem("Validate sheet structure", "validateAndAlert")
    .addToUi();
}

// ── Main endpoint ─────────────────────────────────────────────────────────────
function doGet() {
  try {
    var validation = validateSheets();
    if (!validation.ok) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: true, message: validation.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss         = SpreadsheetApp.getActiveSpreadsheet();
    var thresholds = getThresholds(ss);
    var trends     = getTrends(ss);
    var summary    = getSummary(ss, thresholds, trends);
    var validation = validateSheets();
    if (!validation.ok) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: true, message: validation.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss         = SpreadsheetApp.getActiveSpreadsheet();
    var thresholds = getThresholds(ss);
    var trends     = getTrends(ss);
    var summary    = getSummary(ss, thresholds, trends);

    var payload = {
      cycle:            getCycle(ss),
      generatedDate:    getGeneratedDate(),
      narrativeSummary: getNarrativeSummary(ss, summary, trends),
      summary:          summary,
      areaScores:       getAreaScores(ss, thresholds, trends),
      trends:           trends,
      recommendations:  getRecommendations(ss),
      actions:          getActions(ss),
      roleSplit:        getRoleSplit(ss),
      responseCounts:   getResponseCounts(ss, trends),
      responseMix:      getCurrentPulseResponseMix(ss),
      responseCurrentRawData:  getCurrentPulseResponseRaw(ss, true),
      responseAllRawData:  getCurrentPulseResponseRaw(ss, false),
    };

    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: true, message: e.message }))
      .createTextOutput(JSON.stringify({ error: true, message: e.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Sheet validation ──────────────────────────────────────────────────────────
function validateSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var required = [SHEET_SETTINGS];//[SHEET_SUMMARY, SHEET_TREND, SHEET_RECOMMENDATIONS, SHEET_SETTINGS, SHEET_ACTIONS];
  var missing = required.filter(function(name) { return !ss.getSheetByName(name); });
  if (missing.length) {
    return { ok: false, message: "Missing sheets: " + missing.join(", ") };
  }
  return { ok: true };
}

function validateAndAlert() {
  var result = validateSheets();
  var ui = SpreadsheetApp.getUi();
  if (result.ok) {
    ui.alert("All required sheets found. Structure is valid.");
  } else {
    ui.alert("Sheet structure problem:\n" + result.message);
  }
}

// ── Thresholds ────────────────────────────────────────────────────────────────
function getThresholds(ss) {
  var map = getSheetAsMap(ss.getSheetByName(SHEET_SETTINGS));
  return {
    strong: parseFloat(map["strongthreshold"]) || DEFAULT_THRESHOLD_STRONG,
    stable: parseFloat(map["stablethreshold"]) || DEFAULT_THRESHOLD_STABLE,
    watch:  parseFloat(map["watchthreshold"])  || DEFAULT_THRESHOLD_WATCH,
  };
}

function scoreToStatus(score, thresholds) {
  if (score >= thresholds.strong) return "Strong";
  if (score >= thresholds.stable) return "Stable";
  if (score >= thresholds.watch)  return "Watch";
  return "At Risk";
}

// ── Settings ──────────────────────────────────────────────────────────────────
function getCycle(ss) {
  var map = getSheetAsMap(ss.getSheetByName(SHEET_SETTINGS));
  return map["currentcycle"] ? String(map["currentcycle"]).trim() : "Unknown Pulse";
  var map = getSheetAsMap(ss.getSheetByName(SHEET_SETTINGS));
  return map["currentcycle"] ? String(map["currentcycle"]).trim() : "Unknown Pulse";
}

function getGeneratedDate() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// ── Summary ───────────────────────────────────────────────────────────────────
function getSummary(ss, thresholds, trends) {
  var map = getSheetAsMap(ss.getSheetByName(SHEET_SUMMARY));

  var totalResponses = Number(map["totalresponses"] || map["totalresponse"] || map["responsestotal"]) || 0;
  var teamSize       = Number(map["teamsize"] || map["totalteam"] || map["headcount"]) || 0;
  var overallScore   = parseFloat(map["overallscore"] || map["averagescore"]) || 0;
  var highestArea    = String(map["highestarea"] || map["toparea"] || "");
  var lowestArea     = String(map["lowestarea"] || map["bottomarea"] || "");

  // Derive status from score — never rely on a human-typed label in the sheet
  var overallStatus = scoreToStatus(overallScore, thresholds);

// ── Summary ───────────────────────────────────────────────────────────────────
function getSummary(ss, thresholds, trends) {
  var map = getSheetAsMap(ss.getSheetByName(SHEET_SUMMARY));

  var totalResponses = Number(map["totalresponses"] || map["totalresponse"] || map["responsestotal"]) || 0;
  var teamSize       = Number(map["teamsize"] || map["totalteam"] || map["headcount"]) || 0;
  var overallScore   = parseFloat(map["overallscore"] || map["averagescore"]) || 0;
  var highestArea    = String(map["highestarea"] || map["toparea"] || "");
  var lowestArea     = String(map["lowestarea"] || map["bottomarea"] || "");

  // Derive status from score — never rely on a human-typed label in the sheet
  var overallStatus = scoreToStatus(overallScore, thresholds);

  return {
    totalResponses: totalResponses,
    teamSize:       teamSize || undefined,
    overallScore:   overallScore,
    overallStatus:  overallStatus,
    highestArea:    highestArea,
    lowestArea:     lowestArea,
    totalResponses: totalResponses,
    teamSize:       teamSize || undefined,
    overallScore:   overallScore,
    overallStatus:  overallStatus,
    highestArea:    highestArea,
    lowestArea:     lowestArea,
  };
}

// ── Trend history ─────────────────────────────────────────────────────────────
// ── Trend history ─────────────────────────────────────────────────────────────
/**
 * Reads the Trend sheet. Row 1 = headers.
 *   Col A = pulse label  (e.g. "Jun '26")
 *   Col B = overall score
 *   Col C+ = per-area scores (header must match AREA_NAMES exactly)
 * Reads the Trend sheet. Row 1 = headers.
 *   Col A = pulse label  (e.g. "Jun '26")
 *   Col B = overall score
 *   Col C+ = per-area scores (header must match AREA_NAMES exactly)
 */
function getTrends(ss) {
  var sheet = ss.getSheetByName(SHEET_TREND);
  if (!sheet) return [];

function getTrends(ss) {
  var sheet = ss.getSheetByName(SHEET_TREND);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0]; // row 1
  var trends = [];

  for (var i = 1; i < data.length; i++) {
    var cycle = String(data[i][0]).trim();
    var score = parseFloat(data[i][1]);
    if (!cycle || isNaN(score)) continue;

    var point = { cycle: cycle, overallScore: score };

    // Attach per-area scores if area-named columns exist in header row
    for (var c = 2; c < headers.length; c++) {
      var areaName  = String(headers[c]).trim();
      var areaScore = parseFloat(data[i][c]);
      if (areaName && !isNaN(areaScore)) {
        point[areaName] = areaScore;
      }
    }

    trends.push(point);
  }
  return trends;
  if (data.length < 2) return [];

  var headers = data[0]; // row 1
  var trends = [];

  for (var i = 1; i < data.length; i++) {
    var cycle = String(data[i][0]).trim();
    var score = parseFloat(data[i][1]);
    if (!cycle || isNaN(score)) continue;

    var point = { cycle: cycle, overallScore: score };

    // Attach per-area scores if area-named columns exist in header row
    for (var c = 2; c < headers.length; c++) {
      var areaName  = String(headers[c]).trim();
      var areaScore = parseFloat(data[i][c]);
      if (areaName && !isNaN(areaScore)) {
        point[areaName] = areaScore;
      }
    }

    trends.push(point);
  }
  return trends;
}

// ── Area Scores ───────────────────────────────────────────────────────────────
/**
 * Reads area scores from Summary sheet (col A = area name, col B = score).
 * Computes delta and pulsesAtRisk automatically from Trend history —
 * no manual columns needed in the Summary sheet.
 */
function getAreaScores(ss, thresholds, trends) {
 * Reads area scores from Summary sheet (col A = area name, col B = score).
 * Computes delta and pulsesAtRisk automatically from Trend history —
 * no manual columns needed in the Summary sheet.
 */
function getAreaScores(ss, thresholds, trends) {
  var sheet = ss.getSheetByName(SHEET_SUMMARY);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var scores = [];

  for (var i = 0; i < data.length; i++) {
    var area = String(data[i][0]).trim();
    if (AREA_NAMES.indexOf(area) === -1) continue;

    var score = parseFloat(data[i][1]) || 0;
    var entry = { area: area, score: score };

    // Auto-compute delta from Trend per-area history
    if (trends.length >= 2) {
      var prevPoint      = trends[trends.length - 2];
      var prevAreaScore  = parseFloat(prevPoint[area]);
      if (!isNaN(prevAreaScore)) {
        entry.delta = Math.round((score - prevAreaScore) * 10) / 10;
      }
    }

    // Auto-compute pulsesAtRisk: count consecutive pulses below stable threshold
    var streak = 0;
    for (var t = trends.length - 1; t >= 0; t--) {
      var trendAreaScore = parseFloat(trends[t][area]);
      if (!isNaN(trendAreaScore) && trendAreaScore < thresholds.stable) {
        streak++;
      } else {
        break;
      }
    }
    if (streak > 0) entry.pulsesAtRisk = streak;

    scores.push(entry);
    if (AREA_NAMES.indexOf(area) === -1) continue;

    var score = parseFloat(data[i][1]) || 0;
    var entry = { area: area, score: score };

    // Auto-compute delta from Trend per-area history
    if (trends.length >= 2) {
      var prevPoint      = trends[trends.length - 2];
      var prevAreaScore  = parseFloat(prevPoint[area]);
      if (!isNaN(prevAreaScore)) {
        entry.delta = Math.round((score - prevAreaScore) * 10) / 10;
      }
    }

    // Auto-compute pulsesAtRisk: count consecutive pulses below stable threshold
    var streak = 0;
    for (var t = trends.length - 1; t >= 0; t--) {
      var trendAreaScore = parseFloat(trends[t][area]);
      if (!isNaN(trendAreaScore) && trendAreaScore < thresholds.stable) {
        streak++;
      } else {
        break;
      }
    }
    if (streak > 0) entry.pulsesAtRisk = streak;

    scores.push(entry);
  }
  return scores;
}

// ── Narrative summary ─────────────────────────────────────────────────────────
function getNarrativeSummary(ss, summary, trends) {
  // Custom override from Settings takes priority
  var map    = getSheetAsMap(ss.getSheetByName(SHEET_SETTINGS));
  var custom = map["narrativesummary"] || map["executivesummary"];
  if (custom && String(custom).trim()) return String(custom).trim();

  // Auto-generate from data
  var score   = (summary.overallScore || 0).toFixed(1);
  var status  = (summary.overallStatus || "Stable").toLowerCase();
  var lowest  = summary.lowestArea  || "\u2014";
  var highest = summary.highestArea || "\u2014";

  var deltaStr = "";
  if (trends.length >= 2) {
    var prev = trends[trends.length - 2].overallScore;
    var curr = trends[trends.length - 1].overallScore;
    var diff = Math.round((curr - prev) * 10) / 10;
    var prevLabel = trends[trends.length - 2].cycle;
    if (diff > 0)      deltaStr = ", up "   + diff.toFixed(1) + " from " + prevLabel;
    else if (diff < 0) deltaStr = ", down " + Math.abs(diff).toFixed(1) + " from " + prevLabel;
    else               deltaStr = ", unchanged from " + prevLabel;
  }

  // Find biggest per-area improvement this pulse
  var biggestMover = "";
  if (trends.length >= 2) {
    var maxDelta = 0;
    for (var a = 0; a < AREA_NAMES.length; a++) {
      var area  = AREA_NAMES[a];
      var prev2 = parseFloat(trends[trends.length - 2][area]);
      var curr2 = parseFloat(trends[trends.length - 1][area]);
      if (!isNaN(prev2) && !isNaN(curr2)) {
        var d = Math.round((curr2 - prev2) * 10) / 10;
        if (d > maxDelta) { maxDelta = d; biggestMover = area; }
      }
    }
    biggestMover = (biggestMover && maxDelta > 0)
      ? " " + biggestMover + " showed the biggest improvement (+\u200b" + maxDelta.toFixed(1) + ")."
      : "";
  }

  var streakNote = "";
  if (summary.lowestAreaPulsesAtRisk && summary.lowestAreaPulsesAtRisk >= 2) {
    streakNote = " " + lowest + " has been flagged for " + summary.lowestAreaPulsesAtRisk +
      " consecutive pulses.";
  }

  return "Team sentiment is " + status + " at " + score + "/5" + deltaStr + "." +
    (biggestMover || (" " + highest + " is the strongest area this pulse.")) +
    (streakNote   || (" " + lowest  + " remains the area requiring most attention."));
// ── Narrative summary ─────────────────────────────────────────────────────────
function getNarrativeSummary(ss, summary, trends) {
  // Custom override from Settings takes priority
  var map    = getSheetAsMap(ss.getSheetByName(SHEET_SETTINGS));
  var custom = map["narrativesummary"] || map["executivesummary"];
  if (custom && String(custom).trim()) return String(custom).trim();

  // Auto-generate from data
  var score   = (summary.overallScore || 0).toFixed(1);
  var status  = (summary.overallStatus || "Stable").toLowerCase();
  var lowest  = summary.lowestArea  || "\u2014";
  var highest = summary.highestArea || "\u2014";

  var deltaStr = "";
  if (trends.length >= 2) {
    var prev = trends[trends.length - 2].overallScore;
    var curr = trends[trends.length - 1].overallScore;
    var diff = Math.round((curr - prev) * 10) / 10;
    var prevLabel = trends[trends.length - 2].cycle;
    if (diff > 0)      deltaStr = ", up "   + diff.toFixed(1) + " from " + prevLabel;
    else if (diff < 0) deltaStr = ", down " + Math.abs(diff).toFixed(1) + " from " + prevLabel;
    else               deltaStr = ", unchanged from " + prevLabel;
  }

  // Find biggest per-area improvement this pulse
  var biggestMover = "";
  if (trends.length >= 2) {
    var maxDelta = 0;
    for (var a = 0; a < AREA_NAMES.length; a++) {
      var area  = AREA_NAMES[a];
      var prev2 = parseFloat(trends[trends.length - 2][area]);
      var curr2 = parseFloat(trends[trends.length - 1][area]);
      if (!isNaN(prev2) && !isNaN(curr2)) {
        var d = Math.round((curr2 - prev2) * 10) / 10;
        if (d > maxDelta) { maxDelta = d; biggestMover = area; }
      }
    }
    biggestMover = (biggestMover && maxDelta > 0)
      ? " " + biggestMover + " showed the biggest improvement (+\u200b" + maxDelta.toFixed(1) + ")."
      : "";
  }

  var streakNote = "";
  if (summary.lowestAreaPulsesAtRisk && summary.lowestAreaPulsesAtRisk >= 2) {
    streakNote = " " + lowest + " has been flagged for " + summary.lowestAreaPulsesAtRisk +
      " consecutive pulses.";
  }

  return "Team sentiment is " + status + " at " + score + "/5" + deltaStr + "." +
    (biggestMover || (" " + highest + " is the strongest area this pulse.")) +
    (streakNote   || (" " + lowest  + " remains the area requiring most attention."));
}

// ── Recurring signals (recommendation themes) ─────────────────────────────────
// ── Recurring signals (recommendation themes) ─────────────────────────────────
/**
 * Col A = theme, B = frequency, C = suggested action,
 * D = pulses active (optional), E = area link (optional)
 * Col A = theme, B = frequency, C = suggested action,
 * D = pulses active (optional), E = area link (optional)
 */
function getRecommendations(ss) {
  var sheet = ss.getSheetByName(SHEET_RECOMMENDATIONS);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var recs = [];

  for (var i = 1; i < data.length; i++) {
    var theme = String(data[i][0]).trim();
    if (!theme) continue;

    var freq         = parseInt(data[i][1], 10);
    var action       = String(data[i][2] || "").trim();
    var pulsesActive = (data[i].length > 3 && data[i][3] !== "") ? parseInt(data[i][3], 10)   : null;
    var areaLink     = (data[i].length > 4 && data[i][4] !== "") ? String(data[i][4]).trim() : null;

    var rec = {
      theme:           theme,
      frequency:       isNaN(freq) ? 0 : freq,
      suggestedAction: action,
    };
    if (pulsesActive !== null && !isNaN(pulsesActive)) rec.pulsesActive = pulsesActive;
    if (areaLink) rec.areaLink = areaLink;

    recs.push(rec);
    var theme = String(data[i][0]).trim();
    if (!theme) continue;

    var freq         = parseInt(data[i][1], 10);
    var action       = String(data[i][2] || "").trim();
    var pulsesActive = (data[i].length > 3 && data[i][3] !== "") ? parseInt(data[i][3], 10)   : null;
    var areaLink     = (data[i].length > 4 && data[i][4] !== "") ? String(data[i][4]).trim() : null;

    var rec = {
      theme:           theme,
      frequency:       isNaN(freq) ? 0 : freq,
      suggestedAction: action,
    };
    if (pulsesActive !== null && !isNaN(pulsesActive)) rec.pulsesActive = pulsesActive;
    if (areaLink) rec.areaLink = areaLink;

    recs.push(rec);
  }
  return recs;
}

// ── Commitments (action tracker) ──────────────────────────────────────────────
// ── Commitments (action tracker) ──────────────────────────────────────────────
/**
 * Col A = concern, B = commitment/action, C = owner, D = status,
 * E = pulse opened, F = area
 */
 * Col A = concern, B = commitment/action, C = owner, D = status,
 * E = pulse opened, F = area
 */
function getActions(ss) {
  var sheet = ss.getSheetByName(SHEET_ACTIONS);
  if (!sheet) return [];
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var actions = [];

  for (var i = 1; i < data.length; i++) {
    var concern = String(data[i][0]).trim();
    if (!concern) continue;

    var action = {

    var action = {
      concern:         concern,
      suggestedAction: String(data[i][1] || "").trim(),
      owner:           String(data[i][2] || "").trim(),
      status:          String(data[i][3] || "").trim() || "Planned",
    };
    if (data[i].length > 4 && String(data[i][4]).trim()) action.pulseOpened = String(data[i][4]).trim();
    if (data[i].length > 5 && String(data[i][5]).trim()) action.area = String(data[i][5]).trim();

    actions.push(action);
      suggestedAction: String(data[i][1] || "").trim(),
      owner:           String(data[i][2] || "").trim(),
      status:          String(data[i][3] || "").trim() || "Planned",
    };
    if (data[i].length > 4 && String(data[i][4]).trim()) action.pulseOpened = String(data[i][4]).trim();
    if (data[i].length > 5 && String(data[i][5]).trim()) action.area = String(data[i][5]).trim();

    actions.push(action);
  }
  return actions;
}

// ── Archive: append current cycle to Trend sheet ──────────────────────────────
/**
 * Called via the custom menu "Pulse Dashboard > Archive this pulse cycle".
 * Appends one row to the Trend sheet: [cycle, overallScore, area1score, area2score, ...]
 * Writes column headers automatically if the sheet is empty.
 */
function archiveCurrentCycleTrend() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var thresholds   = getThresholds(ss);
  var cycle        = getCycle(ss);
  var summary      = getSummary(ss, thresholds, []);
  var trendSheet   = ss.getSheetByName(SHEET_TREND);

  if (!trendSheet) {
    ui.alert("Could not find a sheet named \"" + SHEET_TREND + "\". Please create it first.");
    return;
  }

  // Write headers if sheet is empty
  var existing = trendSheet.getDataRange().getValues();
  if (existing.length === 0 || String(existing[0][0]).trim() === "") {
    trendSheet.appendRow(["Pulse", "Overall Score"].concat(AREA_NAMES));
  }

  // Build row: cycle, overall score, then per-area scores in AREA_NAMES order
  var summarySheet = ss.getSheetByName(SHEET_SUMMARY);
  var summaryData  = summarySheet ? summarySheet.getDataRange().getValues() : [];
  var areaScoreMap = {};

  for (var i = 0; i < summaryData.length; i++) {
    var area = String(summaryData[i][0]).trim();
    if (AREA_NAMES.indexOf(area) !== -1) {
      areaScoreMap[area] = parseFloat(summaryData[i][1]) || 0;
    }
  }

  var row = [cycle, summary.overallScore];
  for (var a = 0; a < AREA_NAMES.length; a++) {
    row.push(areaScoreMap[AREA_NAMES[a]] !== undefined ? areaScoreMap[AREA_NAMES[a]] : "");
  }

  trendSheet.appendRow(row);
  ui.alert("Archived " + cycle + " to the Trend sheet (" + row.length + " columns).");
}

// ── Role Split ────────────────────────────────────────────────────────────────
/**
 * Computes per-area average scores broken down by role group.
 * Reads directly from the Form Responses sheet — no separate Role Split sheet needed.
 *
 * Expected Form Responses layout:
 *   Col A  = Timestamp
 *   Col B  = Role (e.g. "Product Management", "Product Development", "Shared")
 *   Col C–I = One column per survey area (numeric score 1–5), header = area name
 *
 * Falls back to a manual "Role Split" sheet if it exists (for overrides).
 */
function getRoleSplit(ss) {
  // Honour a manual override sheet if present
  var overrideSheet = ss.getSheetByName(SHEET_ROLE_SPLIT);
  if (overrideSheet && overrideSheet.getLastRow() > 1) {
    return getRoleSplitFromSheet_(overrideSheet);
  }

  // Compute from raw form responses
  var settings  = typeof readSettings === "function" ? readSettings() : {};
  var sheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  var sheet     = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var data    = sheet.getDataRange().getValues();
  var headers = data[0]; // row 1

  // Role is col B (index 1); area scores are cols C–I (indices 2–8)
  var ROLE_COL  = 1;
  var SCORE_START = 2;
  var SCORE_END   = 8; // inclusive, 0-based

  // Build area name list from headers
  var areaNames = [];
  for (var c = SCORE_START; c <= SCORE_END && c < headers.length; c++) {
    var h = String(headers[c]).trim();
    if (h) areaNames.push(h);
  }
  if (!areaNames.length) return [];

  // Accumulate sum + count per role + area
  var acc = {}; // acc[role][areaName] = { sum, count }
  for (var i = 1; i < data.length; i++) {
    var role = String(data[i][ROLE_COL] || "").trim();
    if (!role) continue;
    if (!acc[role]) acc[role] = {};

    for (var a = 0; a < areaNames.length; a++) {
      var col   = SCORE_START + a;
      var score = parseFloat(data[i][col]);
      if (isNaN(score)) continue;
      var area  = areaNames[a];
      if (!acc[role][area]) acc[role][area] = { sum: 0, count: 0 };
      acc[role][area].sum   += score;
      acc[role][area].count += 1;
    }
  }

  var roles = Object.keys(acc);
  if (!roles.length) return [];

  // Build output: one row per area
  var result = [];
  for (var ai = 0; ai < areaNames.length; ai++) {
    var areaName = areaNames[ai];
    var scores   = {};
    var vals     = [];

    for (var ri = 0; ri < roles.length; ri++) {
      var r = roles[ri];
      if (acc[r][areaName] && acc[r][areaName].count > 0) {
        var avg = Math.round((acc[r][areaName].sum / acc[r][areaName].count) * 10) / 10;
        scores[r] = avg;
        vals.push(avg);
      }
    }

    var roleGap = vals.length >= 2
      ? Math.round((Math.max.apply(null, vals) - Math.min.apply(null, vals)) * 10) / 10
      : 0;

    result.push({ area: areaName, scores: scores, roleGap: roleGap });
  }
  return result;
}

/** Helper: read role split from a manual override sheet (same format as before) */
function getRoleSplitFromSheet_(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var area = String(data[i][0]).trim();
    if (!area) continue;
    var scores = {};
    var vals = [];
    for (var c = 1; c < headers.length; c++) {
      var group = String(headers[c]).trim();
      var val   = parseFloat(data[i][c]);
      if (group && !isNaN(val)) { scores[group] = val; vals.push(val); }
    }
    var roleGap = vals.length >= 2
      ? Math.round((Math.max.apply(null, vals) - Math.min.apply(null, vals)) * 10) / 10
      : 0;
    rows.push({ area: area, scores: scores, roleGap: roleGap });
  }
  return rows;
}

/**
 * Writes computed role split results to the "Role Split" sheet.
 * Called from generateLeadershipSummary() after each pipeline run.
 * Creates the sheet if it doesn't exist. Overwrites previous results.
 *
 * Output layout:
 *   Row 1: Survey Area | RoleA | RoleB | ... | Role Gap
 *   Row 2+: one row per area
 */
function writeRoleSplitToSheet_(ss) {
  var rows = getRoleSplit(ss);
  if (!rows || !rows.length) {
    Logger.log("Role split: no data to write.");
    return;
  }

  var sheet = getOrCreateSheet_(ss, SHEET_ROLE_SPLIT);
  sheet.clear();

  // Derive role group names from first row
  var groups = Object.keys(rows[0].scores);

  // Header row
  var header = ["Survey Area"].concat(groups).concat(["Role Gap"]);
  sheet.appendRow(header);
  sheet.getRange(1, 1, 1, header.length)
    .setBackground("#1a73e8")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  // Data rows
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var dataRow = [row.area];
    for (var g = 0; g < groups.length; g++) {
      var score = row.scores[groups[g]];
      dataRow.push(score !== undefined ? score : "");
    }
    dataRow.push(row.roleGap);
    sheet.appendRow(dataRow);
  }

  // Apply color formatting to score + gap cells
  var numDataRows = rows.length;
  var numCols     = header.length;

  for (var r = 0; r < numDataRows; r++) {
    var sheetRow = r + 2; // 1-indexed, skip header

    // Score columns (skip col A = area name)
    for (var c = 1; c < groups.length + 1; c++) {
      var val = rows[r].scores[groups[c - 1]];
      if (val === undefined) continue;
      var bg = val >= 4.0 ? "#d4edda"   // green
             : val >= 3.5 ? "#e8f5e9"   // light green
             : val >= 3.0 ? "#fff3cd"   // amber
             :              "#f8d7da";  // rose
      sheet.getRange(sheetRow, c + 1).setBackground(bg);
    }

    // Role gap column
    var gapCol = groups.length + 2;
    var gap    = rows[r].roleGap;
    var gapBg  = gap >= 0.7 ? "#ffe0b2"   // orange
               : gap >= 0.5 ? "#fff3cd"   // amber
               :              "#f8f9fa";  // neutral
    sheet.getRange(sheetRow, gapCol).setBackground(gapBg);
  }

  // Column widths
  sheet.setColumnWidth(1, 220);
  for (var cw = 2; cw <= numCols; cw++) {
    sheet.setColumnWidth(cw, 160);
  }

  sheet.setFrozenRows(1);
  Logger.log("Role Split sheet updated with " + numDataRows + " areas.");
}

// ── Response Counts ───────────────────────────────────────────────────────────
/**
 * Builds response count per pulse from the Trend sheet (col A = cycle label).
 * If the Trend sheet has a "Total Responses" column it uses that; otherwise
 * it falls back to the current pulse totalResponses from summary for the
 * latest cycle, and omits count for historical cycles.
 * Returns points only for cycles that have a count.
 */
function getResponseCounts(ss, trends) {
  var sheet = ss.getSheetByName(SHEET_TREND);
  var points = [];

  if (!sheet || trends.length === 0) return points;

  var data    = sheet.getDataRange().getValues();
  if (data.length < 2) return points;

  var headers = data[0];
  // Find a "Total Responses" or "Responses" column if it exists
  var responseCol = -1;
  for (var c = 0; c < headers.length; c++) {
    var h = normalizeLabel(headers[c]);
    if (h === "totalresponses" || h === "responses" || h === "responsecount") {
      responseCol = c;
      break;
    }
  }

  for (var i = 1; i < data.length; i++) {
    var cycle = String(data[i][0]).trim();
    if (!cycle) continue;
    if (responseCol >= 0) {
      var count = parseInt(data[i][responseCol], 10);
      if (!isNaN(count) && count > 0) {
        points.push({ cycle: cycle, responseCount: count });
      }
    }
  }

  // If no response column exists, at minimum surface current cycle count from summary
  if (points.length === 0) {
    var summaryMap = getSheetAsMap(ss.getSheetByName(SHEET_SUMMARY));
    var current = parseInt(summaryMap["totalresponses"] || "0", 10) || 0;
    var latestCycle = trends[trends.length - 1].cycle;
    if (current > 0) {
      points.push({ cycle: latestCycle, responseCount: current });
    }
  }

  return points;
}

// ── Current Pulse Response Mix ───────────────────────────────────────────────
/**
 * Builds current pulse response mix by area:
 *   positive = score 4-5 (Good/Very Good)
 *   mixed    = score 3   (Neutral)
 *   negative = score 1-2 (Poor/Very Poor)
 *
 * If a "Pulse Cycle" column exists, rows are filtered to the active cycle
 * from Settings > Current Cycle. If not present, all rows are used.
 */
function getCurrentPulseResponseMix(ss) {
  var settings  = typeof readSettings === "function" ? readSettings() : {};
  var sheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  var sheet     = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var data    = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows    = data.slice(1);

  var cycleCol = -1;
  for (var i = 0; i < headers.length; i++) {
    var hn = normalizeLabel(headers[i]);
    if (hn === "pulsecycle" || hn === "cycle") {
      cycleCol = i;
      break;
    }
  }

  var activeCycle = getCycle(ss);
  console.log('activeCycle:' + activeCycle);
  if (cycleCol >= 0 && activeCycle) {
    rows = rows.filter(function(r) {
      return String(r[cycleCol] || "").trim() === activeCycle;
    });
  }

  // Match area columns from headers (supports either exact area name or long question text)
  var areaCols = [];
  for (var a = 0; a < AREA_NAMES.length; a++) {
    var area = AREA_NAMES[a];
    var areaNorm = normalizeLabel(area);
    var found = -1;
    for (var c = 0; c < headers.length; c++) {
      var hNorm = normalizeLabel(headers[c]);
      if (!hNorm) continue;
      if (hNorm === areaNorm || hNorm.indexOf(areaNorm) !== -1) {
        found = c;
        break;
      }
    }
    if (found >= 0) {
      areaCols.push({ area: area, col: found });
    }
  }

  if (!areaCols.length || !rows.length) return [];

  var out = [];
  for (var ac = 0; ac < areaCols.length; ac++) {
    var areaName = areaCols[ac].area;
    var col      = areaCols[ac].col;
    var pos = 0, mix = 0, neg = 0, total = 0;

    for (var r = 0; r < rows.length; r++) {
      var score = mapPulseValueToScore_(rows[r][col]);
      if (score === null) continue;
      total += 1;
      if (score >= 4) pos += 1;
      else if (score === 3) mix += 1;
      else neg += 1;
    }

    if (total === 0) continue;

    var posPct = Math.round((pos / total) * 100);
    var mixPct = Math.round((mix / total) * 100);
    var negPct = 100 - posPct - mixPct; // keep row total exactly 100

    out.push({
      area: areaName,
      positive: posPct,
      mixed: mixPct,
      negative: negPct,
      total: total,
    });
  }

  return out;
}

/**
 * Returns raw response data for the current pulse cycle.
 * Each row represents one response with scores for all areas (1-5 scale).
 * Values are converted using mapPulseValueToScore_.
 *
 * If a "Pulse Cycle" column exists, rows are filtered to the active cycle
 * from Settings > Current Cycle. If not present, all rows are used.
 */
function getCurrentPulseResponseRaw(ss, isCurrentCycle) {
  var settings  = typeof readSettings === "function" ? readSettings() : {};
  var sheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  var sheet     = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var data    = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows    = data.slice(1);

  if (isCurrentCycle) {
    var cycleCol = -1;
    for (var i = 0; i < headers.length; i++) {
      var hn = normalizeLabel(headers[i]);
      if (hn === "pulsecycle" || hn === "cycle") {
        cycleCol = i;
        break;
      }
    }

    var activeCycle = getCycle(ss);
    if (cycleCol >= 0 && activeCycle) {
      rows = rows.filter(function(r) {
        return String(r[cycleCol] || "").trim() === activeCycle;
      });
    }
  }

  // Match area columns from headers
  var areaCols = [];
  for (var a = 0; a < ALL_AREA_NAMES.length; a++) {
    var area = ALL_AREA_NAMES[a];
    var areaNorm = normalizeLabel(area);
    var found = -1;
    for (var c = 0; c < headers.length; c++) {
      var hNorm = normalizeLabel(headers[c]);
      if (!hNorm) continue;
      if (hNorm === areaNorm || hNorm.indexOf(areaNorm) !== -1) {
        found = c;
        break;
      }
    }
    if (found >= 0) {
      areaCols.push({ area: area, col: found });
    }
  }

  if (!areaCols.length || !rows.length) return [];

  var out = [];
  for (var r = 0; r < rows.length; r++) {
    var response = {};
    var hasData = false;

    for (var ac = 0; ac < areaCols.length; ac++) {
      var areaName = areaCols[ac].area;
      var col      = areaCols[ac].col;
      var score    = mapPulseValueToScore_(rows[r][col]);
      
      if (score !== null) {
        response[areaName] = score;
        hasData = true;
      }
    }

    if (hasData) {
      out.push(response);
    }
  }

  return out;
}

/**
 * Converts form value to numeric score (1..5) when possible.
 * Supports both numeric values and text labels.
 */
function mapPulseValueToScore_(value) {
  if (value === null || value === undefined) return null;
  var raw = String(value).trim();
  if (!raw) return null;

  var num = parseFloat(raw);
  if (!isNaN(num) && num >= 1 && num <= 5) return num;

  var t = normalizeLabel(raw);
  if (t === "verypoor") return 1;
  if (t === "poor") return 2;
  if (t === "neutral") return 3;
  if (t === "good") return 4;
  if (t === "verygood") return 5;

  return null;
}

// ── Utility: single-pass sheet key→value map ──────────────────────────────────
/**
 * Reads the entire sheet ONCE and returns a normalised key→value map.
 * Each row: if a cell contains a label-like string and the next non-empty cell
 * is on the same row, that pair is stored as map[normalizeLabel(label)] = value.
 * Normalisation: strip all non-alphanumeric characters, lowercase.
 * This replaces repeated getCellByLabel() calls (one sheet read per request).
 */
function getSheetAsMap(sheet) {
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  var map  = {};
  for (var i = 0; i < data.length; i++) {
    for (var c = 0; c < data[i].length - 1; c++) {
      var key = normalizeLabel(data[i][c]);
      if (!key) continue;
      for (var r = c + 1; r < data[i].length; r++) {
        if (String(data[i][r]).trim() !== "") {
          if (!map[key]) map[key] = data[i][r]; // first match wins
          break;
        }
      }
    }
  }
  return map;
}

function normalizeLabel(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}