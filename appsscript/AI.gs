function readScoreRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getRequiredSheet_(ss, PULSE_CONFIG.SUMMARY_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < PULSE_CONFIG.SCORE_DATA_START_ROW) return [];

  const rowCount = lastRow - PULSE_CONFIG.SCORE_DATA_START_ROW + 1;
  const values = sheet
    .getRange(PULSE_CONFIG.SCORE_DATA_START_ROW, PULSE_CONFIG.AREA_COL, rowCount, PULSE_CONFIG.STATUS_COL)
    .getDisplayValues();

  return values
    .map(function(row) {
      const area = safeText_(row[0]);
      const score = parseScore_(row[1]);
      const status = normalizeStatus_(row[2]) || inferStatusFromScore_(score);
      return { area: area, score: score, status: status };
    })
    .filter(function(item) { return item.area !== ""; });
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

  if (!result.totalResponses) {
    const formSheet = ss.getSheetByName("Form Responses 1");
    if (formSheet && formSheet.getLastRow() > 1) {
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