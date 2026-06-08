function appendTrend(rows, classified, meta) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(ss, PULSE_CONFIG.HISTORY_SHEET);

  // Dedupe: skip if this cycle already exists in the latest row
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const lastCycle = safeText_(sheet.getRange(lastRow, 1).getValue());
    if (lastCycle === meta.cycle) {
      Logger.log("Trend: skipped duplicate row for cycle " + meta.cycle);
      return;
    }
  }

  const areaOrder = (typeof AREA_NAMES !== "undefined" && AREA_NAMES.length)
    ? AREA_NAMES.slice()
    : rows.map(function(r) { return r.area; });

  if (lastRow === 0) {
    sheet.appendRow(["Pulse", "Overall Score"].concat(areaOrder));
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
  }

  const scoreMap = {};
  rows.forEach(function(r) {
    scoreMap[r.area] = isFinite(r.score) ? Number(r.score.toFixed(2)) : "";
  });

  const numericScores = rows
    .map(function(r) { return r.score; })
    .filter(function(v) { return isFinite(v); });
  const overallScore = numericScores.length
    ? Number((numericScores.reduce(function(sum, n) { return sum + n; }, 0) / numericScores.length).toFixed(2))
    : "";

  const areaScores = areaOrder.map(function(area) {
    return scoreMap[area] !== undefined ? scoreMap[area] : "";
  });

  sheet.appendRow([meta.cycle, overallScore].concat(areaScores));

  Logger.log("Trend row appended for cycle: " + meta.cycle);
}