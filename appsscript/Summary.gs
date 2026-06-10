// CHANGELOG
// 2026-06-05 — Initial hackathon build

function generateLeadershipSummary() {
  var rows = readScoreRows();
  var metrics = readKeyMetrics();
  var classified = classifyRows(rows);
  var settings = readSettings();

  var cycle = settings.currentCycle || "Unknown Cycle";
  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), PULSE_CONFIG.DATE_FORMAT);
  var totalResponses = parseInt(String(metrics.totalResponses || "0").replace(/\D/g, ""), 10) || 0;
  var extremes = computeExtremes_(rows);
  var lowestArea = metrics.lowestArea || extremes.lowestArea || "Not available";
  var highestArea = metrics.highestArea || extremes.highestArea || "Not available";

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var output = getOrCreateSheet_(ss, PULSE_CONFIG.OUTPUT_SHEET);
  if (output.getLastRow() === 0) {
    output.appendRow(["Generated At", "Cycle", "Total Responses", "Highest Area", "Lowest Area", "Leadership Focus"]);
    output.getRange(1, 1, 1, output.getLastColumn()).setFontWeight("bold");
    output.setColumnWidth(6, PULSE_CONFIG.OUTPUT_COLUMN_WIDTH);
  }

  var focus = buildSlackFocus_(lowestArea, classified);
  output.appendRow([now, cycle, totalResponses, highestArea, lowestArea, focus]);
  output.getRange(output.getLastRow(), 6).setWrap(true);

  // Rebuild missing historical cycles from Form Responses before current-cycle append.
  if (typeof backfillTrendFromFormResponses_ === "function") {
    backfillTrendFromFormResponses_(ss);
  }

  appendTrend(rows, classified, {
    cycle: cycle,
    now: now,
    totalResponses: totalResponses,
    highestArea: highestArea,
    lowestArea: lowestArea,
  });

  // Write computed role split to the "Role Split" sheet
  writeRoleSplitToSheet_(ss);
}

function runFullPipeline(e) {
  try {
    populatePulseCycleFromSettings_(e);
    generateLeadershipSummary();      // builds Leadership Summary tab + appends Trend
    generateAISummary();              // calls Gemini, writes to Recommendation Themes tab
    sendLeadershipSummaryToSlack();   // posts to Slack if approved and threshold met
  } catch (e) {
    Logger.log("Pipeline error: " + e.message);
    MailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      "B2CSS Pulse Script Error",
      "An error occurred:\n\n" + e.message
    );
  }
}

function populatePulseCycleFromSettings_(e) {
  var settings = (typeof readSettings === "function") ? readSettings() : {};
  var currentCycle = safeText_(settings.currentCycle);
  if (!currentCycle) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var eventSheet = (e && e.range && e.range.getSheet) ? e.range.getSheet() : null;

  var candidateNames = [];
  if (eventSheet) candidateNames.push(eventSheet.getName());
  if (settings.formSheetName) candidateNames.push(settings.formSheetName);
  if (typeof PULSE_CONFIG !== "undefined" && PULSE_CONFIG.FORM_RESPONSE_SHEET) {
    candidateNames.push(PULSE_CONFIG.FORM_RESPONSE_SHEET);
  }

  var seen = {};
  var uniqueNames = [];
  for (var i = 0; i < candidateNames.length; i++) {
    var n = safeText_(candidateNames[i]);
    if (!n || seen[n]) continue;
    seen[n] = true;
    uniqueNames.push(n);
  }

  var sheet = null;
  var cycleCol = -1;

  for (var u = 0; u < uniqueNames.length; u++) {
    var s = ss.getSheetByName(uniqueNames[u]);
    if (!s || s.getLastRow() < 2 || s.getLastColumn() < 1) continue;

    var h = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0] || [];
    for (var c = 0; c < h.length; c++) {
      var hn = String(h[c] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (hn === "pulsecycle" || hn === "cycle") {
        sheet = s;
        cycleCol = c + 1; // 1-based index for getRange
        break;
      }
    }
    if (sheet && cycleCol > 0) break;
  }

  // Fallback: try any sheet that looks like a form responses tab and has a cycle column.
  if (!sheet || cycleCol < 0) {
    var allSheets = ss.getSheets();
    for (var si = 0; si < allSheets.length; si++) {
      var candidate = allSheets[si];
      var sheetKey = candidate.getName().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (sheetKey.indexOf("formresponse") === -1) continue;
      if (candidate.getLastRow() < 2 || candidate.getLastColumn() < 1) continue;

      var headers = candidate.getRange(1, 1, 1, candidate.getLastColumn()).getValues()[0] || [];
      for (var hc = 0; hc < headers.length; hc++) {
        var headerKey = String(headers[hc] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (headerKey === "pulsecycle" || headerKey === "cycle") {
          sheet = candidate;
          cycleCol = hc + 1;
          break;
        }
      }
      if (sheet && cycleCol > 0) break;
    }
  }

  if (!sheet || cycleCol < 0) return;

  var targetRow = -1;
  if (e && e.range && e.range.getSheet && e.range.getSheet().getName() === sheet.getName()) {
    targetRow = e.range.getRow();
  }
  if (targetRow >= 2) {
    var existing = safeText_(sheet.getRange(targetRow, cycleCol).getValue());
    if (!existing) {
      sheet.getRange(targetRow, cycleCol).setValue(currentCycle);
    }
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var cycleRange = sheet.getRange(2, cycleCol, lastRow - 1, 1);
  var cycleValues = cycleRange.getValues();
  var changed = false;
  for (var r = 0; r < cycleValues.length; r++) {
    if (!safeText_(cycleValues[r][0])) {
      cycleValues[r][0] = currentCycle;
      changed = true;
    }
  }
  if (changed) {
    cycleRange.setValues(cycleValues);
  }
}

function installTriggers() {
  removeTriggers();

  ScriptApp.newTrigger("runFullPipeline")
    .timeBased()
    .everyHours(6)
    .create();

  try {
    ScriptApp.newTrigger("runFullPipeline")
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onFormSubmit()
      .create();
  } catch (e) {
    Logger.log("onFormSubmit trigger skipped: " + e.message);
  }

  Logger.log("Triggers installed.");
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "runFullPipeline") {
      ScriptApp.deleteTrigger(t);
    }
  });
}