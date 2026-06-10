const PULSE_CONFIG = {
  SUMMARY_SHEET: "Summary",
  OUTPUT_SHEET: "Leadership Summary",
  HISTORY_SHEET: "Trend",
  THEMES_SHEET: "Recommendation Themes",
  AI_OUTPUT_SHEET: "AI Insights Log",
  FORM_RESPONSE_SHEET: "Form Responses 1",
  SETTINGS_SHEET: "Settings",
  SCORE_DATA_START_ROW: 2,
  AREA_COL: 1,
  SCORE_COL: 2,
  STATUS_COL: 3,
  WEBHOOK_PROPERTY_KEY: "SLACK_WEBHOOK_URL",
  DASHBOARD_URL_PROPERTY_KEY: "DASHBOARD_URL",
  GEMINI_API_KEY_PROPERTY: "GEMINI_API_KEY",
  MIN_RESPONSES_DEFAULT: 3,
  DATE_FORMAT: "dd-MM-yyyy HH:mm",
  OUTPUT_COLUMN_WIDTH: 750
};

function readSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PULSE_CONFIG.SETTINGS_SHEET);
  const result = {};
  if (!sheet) return result;
  const values = sheet.getDataRange().getValues();
  values.forEach(function(row) {
    const labelKey = normalizeLabel(row[0]);
    const value = safeText_(getSettingRowValue_(row));

    if (labelKey === "currentcycle") result.currentCycle = value;
    if (labelKey === "minresponsestosend") result.minResponses = parseInt(value, 10) || PULSE_CONFIG.MIN_RESPONSES_DEFAULT;
    if (labelKey === "sendtoslackapproved") result.sendApproved = value.toLowerCase() === "true";
    if (labelKey === "formresponsesheetname") result.formSheetName = value;
    if (labelKey === "teamsize" || labelKey === "totalteam" || labelKey === "headcount") {
      result.teamSize = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
    }
  });
  return result;
}

function getSettingRowValue_(row) {
  if (!row || row.length < 2) return "";
  for (var i = 1; i < row.length; i++) {
    if (safeText_(row[i])) return row[i];
  }
  return "";
}
