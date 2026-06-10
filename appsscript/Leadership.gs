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
    const label = safeText_(row[0]).toLowerCase();
    const value = safeText_(row[1]);
    if (label === "current cycle") result.currentCycle = value;
    if (label === "min responses to send") result.minResponses = parseInt(value, 10) || PULSE_CONFIG.MIN_RESPONSES_DEFAULT;
    if (label === "send to slack approved") result.sendApproved = value.toLowerCase() === "true";
    if (label === "form response sheet name") result.formSheetName = value;
  });
  return result;
}