// CHANGELOG
// 2026-06-05 — Initial hackathon build

function generateLeadershipSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settings = readSettings();
  
  // Validate inputs early
  try {
    validatePipelineInputs(ss, settings);
  } catch (e) {
    Logger.log("Validation failed: " + e.message);
    throw e;
  }

  var rows = readScoreRows();
  var metrics = readKeyMetrics();
  var classified = classifyRows(rows);

  var cycle = settings.currentCycle || "Unknown Cycle";
  var now = formatNow_(PULSE_CONFIG.DATE_FORMAT);
  var totalResponses = parseInt(String(metrics.totalResponses || "0").replace(/\D/g, ""), 10) || 0;
  var extremes = computeExtremes_(rows);
  var lowestArea = metrics.lowestArea || extremes.lowestArea || "Not available";
  var highestArea = metrics.highestArea || extremes.highestArea || "Not available";

  var output = getOrCreateSheet_(ss, PULSE_CONFIG.OUTPUT_SHEET);
  if (output.getLastRow() === 0) {
    output.appendRow(["Generated At", "Cycle", "Total Responses", "Highest Area", "Lowest Area", "Leadership Focus"]);
    output.getRange(1, 1, 1, output.getLastColumn()).setFontWeight("bold");
    output.setColumnWidth(6, PULSE_CONFIG.OUTPUT_COLUMN_WIDTH);
  }

  var focus = buildSlackFocus_(lowestArea, classified);
  output.appendRow([now, cycle, totalResponses, highestArea, lowestArea, focus]);
  output.getRange(output.getLastRow(), 6).setWrap(true);

  // Backfill historical cycles from Form Responses when available.
  if (typeof backfillTrendFromFormResponses === "function") {
    try {
      backfillTrendFromFormResponses(ss);
    } catch (e) {
      Logger.log("Trend backfill skipped due to error: " + e.message);
    }
  } else {
    Logger.log("Trend backfill skipped: backfillTrendFromFormResponses is not defined.");
  }

  // Append current trend with fallback to legacy helper.
  if (typeof appendTrendRow === "function") {
    try {
      appendTrendRow(rows, AREA_NAMES, {
        cycle: cycle,
        now: now,
        totalResponses: totalResponses,
        highestArea: highestArea,
        lowestArea: lowestArea,
      });
    } catch (e) {
      Logger.log("appendTrendRow failed: " + e.message);
      if (typeof appendTrend === "function") {
        try {
          appendTrend(rows, classified, {
            cycle: cycle,
            now: now,
            totalResponses: totalResponses,
            highestArea: highestArea,
            lowestArea: lowestArea,
          });
          Logger.log("Trend appended using legacy appendTrend fallback.");
        } catch (legacyErr) {
          Logger.log("Legacy appendTrend fallback failed: " + legacyErr.message);
          throw legacyErr;
        }
      } else {
        throw e;
      }
    }
  } else if (typeof appendTrend === "function") {
    appendTrend(rows, classified, {
      cycle: cycle,
      now: now,
      totalResponses: totalResponses,
      highestArea: highestArea,
      lowestArea: lowestArea,
    });
    Logger.log("Trend appended using legacy appendTrend fallback.");
  } else {
    throw new Error("No trend append helper available (appendTrendRow/appendTrend missing).");
  }

  // Write computed role split when helper exists; never fail the pipeline if missing.
  if (typeof writeRoleSplitToSheet_ === "function") {
    try {
      writeRoleSplitToSheet_(ss);
    } catch (e) {
      Logger.log("Role split write skipped due to error: " + e.message);
    }
  } else {
    Logger.log("Role split write skipped: writeRoleSplitToSheet_ is not defined.");
  }
}

/**
 * Full pipeline: validate → leadership summary → AI insights → Slack post.
 * Validates configuration before executing any writes.
 * @param {Object} e - Optional trigger event
 */
function runFullPipeline(e) {
  var lock = null;
  try {
    lock = LockService.getDocumentLock();
    if (!lock.tryLock(30000)) {
      throw new Error("Another pipeline run is in progress. Try again in a moment.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var settings = readSettings();
    
    // Validate all inputs before making changes
    validatePipelineInputs(ss, settings);
    
    if (typeof populatePulseCycleFromSettings_ === "function") {
      try {
        populatePulseCycleFromSettings_(e);
      } catch (eCycle) {
        Logger.log("Pulse cycle auto-population skipped due to error: " + eCycle.message);
      }
    } else {
      Logger.log("Pulse cycle auto-population skipped: helper not defined.");
    }

    generateLeadershipSummary();      // builds Leadership Summary tab + appends Trend using TrendService

    if (typeof generateAISummary === "function") {
      try {
        generateAISummary();          // calls Gemini, writes to AI Insights Log tab
      } catch (eAi) {
        Logger.log("AI summary step skipped due to error: " + eAi.message);
      }
    } else {
      Logger.log("AI summary step skipped: generateAISummary is not defined.");
    }

    if (typeof sendLeadershipSummaryToSlack === "function") {
      try {
        sendLeadershipSummaryToSlack(); // posts to Slack if approved and threshold met
      } catch (eSlack) {
        Logger.log("Slack step skipped due to error: " + eSlack.message);
      }
    } else {
      Logger.log("Slack step skipped: sendLeadershipSummaryToSlack is not defined.");
    }
    
    Logger.log("Full pipeline completed successfully.");
  } catch (e) {
    Logger.log("Pipeline error: " + e.message);
    Logger.log("Stack: " + e.stack);
    MailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      "B2CSS Pulse Script Error",
      "An error occurred during pipeline execution:\n\n" + e.message + "\n\nStack:\n" + e.stack
    );
  } finally {
    if (lock) {
      lock.releaseLock();
    }
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
