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

function runFullPipeline() {
  try {
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