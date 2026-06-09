function generateAISummary() {
  const apiKey = PropertiesService.getScriptProperties().getProperty(PULSE_CONFIG.GEMINI_API_KEY_PROPERTY);

  if (!apiKey) {
    Logger.log("No Gemini API key set. Skipping AI summary.");
    return null;
  }

  const rows = readScoreRows();
  const openText = readOpenTextResponses();
  const settings = readSettings();

  if (openText.length < 3) {
    Logger.log("Not enough open-text responses for AI analysis (" + openText.length + "). Need at least 3.");
    return null;
  }

  const scoreSummary = rows.map(function(row) {
    return row.area + ": " + (isFinite(row.score) ? row.score.toFixed(2) : "n/a") + " (" + row.status + ")";
  }).join("\n");

  // Anonymised open-text only — never include timestamps or identifying info
  const anonymisedText = openText.slice(0, 20).join("\n- ");

  const prompt =
    "You are a team engagement analyst. Analyse the following team survey results and recommend 2-3 key themes for leadership to focus on.\n\n" +
    "Survey cycle: " + (settings.currentCycle || "Unknown") + "\n\n" +
    "Score summary:\n" + scoreSummary + "\n\n" +
    "Anonymous team comments (do not quote directly, summarise only):\n- " + anonymisedText + "\n\n" +
    "Provide:\n" +
    "1. Two or three key theme labels (e.g. Workload Pressure, Communication Gaps).\n" +
    "2. One short paragraph summary per theme (2-3 sentences max).\n" +
    "3. One practical leadership action per theme.\n" +
    "Keep tone factual and constructive. Do not identify individuals. Do not overstate certainty if response count is low.";

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };

  var response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log("Gemini request failed: " + e.message);
    return null;
  }

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code === 429) {
    Logger.log("Gemini quota exceeded (429). Skipping AI summary. Retry later.");
    return null;
  }

  if (code < 200 || code >= 300) {
    Logger.log("Gemini API error: HTTP " + code + " — " + body);
    return null;
  }

  try {
    const json = JSON.parse(body);
    const aiText = json.candidates[0].content.parts[0].text;
    writeAISummaryToSheet_(aiText, settings.currentCycle || "Unknown");
    return aiText;
  } catch (e) {
    Logger.log("Could not parse Gemini response: " + e.message);
    return null;
  }
}

function writeAISummaryToSheet_(aiText, cycle) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(ss, PULSE_CONFIG.AI_OUTPUT_SHEET);

  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), PULSE_CONFIG.DATE_FORMAT);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Cycle", "Generated At", "AI Theme Analysis (Human Review Required)"]);
    sheet.setColumnWidth(3, 800);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  }

  sheet.appendRow([cycle, now, aiText]);
  sheet.getRange(sheet.getLastRow(), 3).setWrap(true);

  Logger.log("AI summary written to AI Insights Log tab.");
}