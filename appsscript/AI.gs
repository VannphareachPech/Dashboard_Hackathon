function readScoreRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getRequiredSheet_(ss, PULSE_CONFIG.SUMMARY_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < PULSE_CONFIG.SCORE_DATA_START_ROW) return [];

  const rowCount = lastRow - PULSE_CONFIG.SCORE_DATA_START_ROW + 1;
  const values = sheet
    .getRange(PULSE_CONFIG.SCORE_DATA_START_ROW, PULSE_CONFIG.AREA_COL, rowCount, PULSE_CONFIG.STATUS_COL)
    .getDisplayValues();

  // Only keep rows whose area name is a canonical survey area — this prevents
  // metadata rows ("Lowest Area", "Total Responses", etc.) from polluting the
  // Slack message, AI prompt, and Leadership Summary tab.
  var validAreas = (typeof AREA_NAMES !== "undefined" && AREA_NAMES.length) ? AREA_NAMES : null;

  return values
    .map(function(row) {
      const area = safeText_(row[0]);
      const score = parseScore_(row[1]);
      const status = normalizeStatus_(row[2]) || inferStatusFromScore_(score);
      return { area: area, score: score, status: status };
    })
    .filter(function(item) {
      if (!item.area) return false;
      if (validAreas) return validAreas.indexOf(item.area) !== -1;
      return true;
    });
}

function readKeyMetrics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getRequiredSheet_(ss, PULSE_CONFIG.SUMMARY_SHEET);
  const values = sheet.getDataRange().getDisplayValues();
  const result = { lowestArea: "", highestArea: "", totalResponses: 0 };

  const labelMap = {
    lowestArea:     ["lowest scoring area", "lowest area"],
    highestArea:    ["highest scoring area", "highest area"],
    totalResponses: ["total responses", "response count", "total reponses"]
  };

  Object.keys(labelMap).forEach(function(key) {
    const variants = labelMap[key];
    for (var r = 0; r < values.length; r++) {
      for (var c = 0; c < values[r].length; c++) {
        if (variants.indexOf(normalizeText_(values[r][c])) > -1 && c + 1 < values[r].length) {
          result[key] = safeText_(values[r][c + 1]);
          return;
        }
      }
    }
  });

  // Always re-derive totalResponses by counting Form Responses rows for the
  // active cycle only — the Summary sheet value is an all-time total and will
  // be wrong for any pulse after the first.
  const settings = readSettings();
  const formSheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  const formSheet = ss.getSheetByName(formSheetName);
  if (formSheet && formSheet.getLastRow() > 1) {
    const formValues = formSheet.getDataRange().getValues();
    const formHeaders = formValues[0];

    // Find the Pulse Cycle column
    var cycleCol = -1;
    for (var fc = 0; fc < formHeaders.length; fc++) {
      const hn = safeText_(formHeaders[fc]).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (hn === "pulsecycle" || hn === "cycle") { cycleCol = fc; break; }
    }

    if (cycleCol >= 0 && settings.currentCycle) {
      // Count only rows matching the active cycle
      var cycleCount = 0;
      for (var fr = 1; fr < formValues.length; fr++) {
        if (safeText_(formValues[fr][cycleCol]) === settings.currentCycle) cycleCount++;
      }
      if (cycleCount > 0) result.totalResponses = String(cycleCount);
    } else if (!result.totalResponses) {
      // Fallback: no cycle column — use full row count
      result.totalResponses = String(formSheet.getLastRow() - 1);
    }
  }

  return result;
}

function classifyRows(rows) {
  const positive = [], mixed = [], concern = [];
  rows.forEach(function(row) {
    const label = row.area + " (" + (isFinite(row.score) ? row.score.toFixed(2) : "n/a") + ")";
    if (row.status === "Concern") concern.push(label);
    else if (row.status === "Mixed") mixed.push(label);
    else positive.push(label);
  });
  return { positiveAreas: positive, mixedAreas: mixed, concernAreas: concern };
}

function readOpenTextResponses() {
  const settings = readSettings();
  const sheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  const values = sheet.getRange(2, lastCol, lastRow - 1, 1).getValues();
  return values.map(function(row) { return safeText_(row[0]); }).filter(function(t) { return t.length > 0; });
}