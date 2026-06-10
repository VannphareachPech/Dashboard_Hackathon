/**
 * DataValidation.gs → ValidationService.gs — Pipeline input validation and diagnostics
 * Catches configuration errors early with clear messages instead of silent failures
 */

/**
 * Validates all pipeline inputs before processing.
 * Throws descriptive errors on config problems; logs warnings for missing optional fields.
 * @param {Spreadsheet} ss - Active spreadsheet
 * @param {Object} settings - Settings object from readSettings()
 */
function validatePipelineInputs(ss, settings) {
  var errors = [];
  var warnings = [];

  // Check required settings
  if (!settings.currentCycle) {
    errors.push("ERROR: 'Current Cycle' not set in Settings sheet");
  }
  
  // Check required sheets
  var requiredSheets = [
    { name: SHEET_SUMMARY, description: "Summary" },
    { name: SHEET_TREND, description: "Trend" },
    { name: SHEET_SETTINGS, description: "Settings" }
  ];
  
  for (var i = 0; i < requiredSheets.length; i++) {
    if (!ss.getSheetByName(requiredSheets[i].name)) {
      errors.push("ERROR: Required sheet '" + requiredSheets[i].description + "' not found");
    }
  }

  // Check Form Response sheet
  var formSheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  var formSheet = ss.getSheetByName(formSheetName);
  if (!formSheet) {
    errors.push("ERROR: Form Response sheet '" + formSheetName + "' not found");
  } else if (formSheet.getLastRow() < 2) {
    warnings.push("WARNING: Form Response sheet has no data rows");
  } else {
    // Verify required headers exist
    var headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0] || [];
    if (headers.length === 0) {
      errors.push("ERROR: Form Response sheet has no headers");
    } else {
      var hasCycleCol = false;
      var matchedAreaCols = 0;
      for (var h = 0; h < headers.length; h++) {
        var hn = normalizeLabel(headers[h]);
        if (hn === "pulsecycle" || hn === "cycle") hasCycleCol = true;
      }

      for (var a = 0; a < AREA_NAMES.length; a++) {
        var areaNorm = normalizeLabel(AREA_NAMES[a]);
        for (var c = 0; c < headers.length; c++) {
          var headerNorm = normalizeLabel(headers[c]);
          if (headerNorm && (headerNorm === areaNorm || headerNorm.indexOf(areaNorm) !== -1)) {
            matchedAreaCols++;
            break;
          }
        }
      }

      if (!hasCycleCol) {
        errors.push("ERROR: Form Response sheet missing 'Pulse Cycle' (or 'Cycle') column");
      }
      if (matchedAreaCols < Math.min(3, AREA_NAMES.length)) {
        errors.push("ERROR: Form Response sheet has too few matched survey area columns (found " + matchedAreaCols + ")");
      }
    }
  }

  // Warn if teamSize is missing (participation rate will be n/a)
  if (!settings.teamSize) {
    warnings.push("WARNING: Team Size not set in Settings; participation rate will be n/a");
  }

  // Warn if Slack approval is enabled but webhook not configured
  if (settings.sendApproved) {
    var webhookUrl = PropertiesService.getScriptProperties().getProperty(PULSE_CONFIG.WEBHOOK_PROPERTY_KEY);
    if (!webhookUrl) {
      warnings.push("WARNING: 'Send to Slack Approved' is TRUE but no webhook URL configured in Script Properties");
    }
  }

  // Throw on errors; log warnings
  if (errors.length > 0) {
    var errorMsg = errors.join("\n");
    Logger.log(errorMsg);
    throw new Error("Pipeline validation failed:\n" + errorMsg);
  }

  if (warnings.length > 0) {
    for (var w = 0; w < warnings.length; w++) {
      Logger.log(warnings[w]);
    }
  }
}

/**
 * Validates that the detected role split data looks reasonable.
 * @param {Array<Object>} roleSplit - Array of { area, scores, roleGap }
 * @param {Array<string>} areaNames - Expected area names
 * @return {boolean} True if valid
 */
function validateRoleSplit(roleSplit, areaNames) {
  if (!Array.isArray(roleSplit) || roleSplit.length === 0) {
    Logger.log("WARNING: No role split data computed");
    return true; // Not an error, just no data
  }

  for (var i = 0; i < roleSplit.length; i++) {
    var row = roleSplit[i];
    if (!row.area || typeof row.area !== "string") {
      Logger.log("WARNING: Role split row " + i + " missing area name");
    }
    if (!row.scores || typeof row.scores !== "object") {
      Logger.log("WARNING: Role split row " + i + " missing scores object");
    }
    if (typeof row.roleGap !== "number") {
      Logger.log("WARNING: Role split row " + i + " missing numeric roleGap");
    }
  }

  return true;
}

/**
 * Validates that area scores are within expected bounds.
 * @param {Array<Object>} areaScores - Array of { area, score, ... }
 * @return {boolean} True if valid
 */
function validateAreaScores(areaScores) {
  if (!Array.isArray(areaScores)) {
    Logger.log("WARNING: Area scores is not an array");
    return false;
  }

  for (var i = 0; i < areaScores.length; i++) {
    var score = areaScores[i].score;
    if (typeof score !== "number" || score < 0 || score > 5) {
      Logger.log("WARNING: Area '" + areaScores[i].area + "' has invalid score: " + score);
    }
  }

  return true;
}
