/**
 * RoleSplitService.gs — Isolated role split computation and loading
 * Extracted from dashboard.gs for clarity and testability.
 * 
 * Fallback precedence:
 *   1. Role Split Summary sheet (if populated)
 *   2. Role Split override sheet (if has role columns)
 *   3. Computed from current Form Responses (filtered by active cycle)
 */

/**
 * Gets role split data using fallback strategy.
 * @param {Spreadsheet} ss - Active spreadsheet
 * @param {string} activeCycle - Active cycle label for filtering form responses
 * @return {Array<Object>} Array of { area, scores, roleGap }
 */
function getRoleSplitWithFallback(ss, activeCycle) {
  // Try Role Split Summary first
  var summaryOverride = ss.getSheetByName(SHEET_ROLE_SPLIT_SUMMARY);
  if (summaryOverride && summaryOverride.getLastRow() > 1) {
    var fromSummary = getRoleSplitFromSheet_(summaryOverride);
    if (fromSummary.length > 0) {
      Logger.log("Role Split: loaded from Role Split Summary sheet");
      return fromSummary;
    }
  }

  // Try manual Role Split override
  var overrideSheet = ss.getSheetByName(SHEET_ROLE_SPLIT);
  if (overrideSheet && overrideSheet.getLastRow() > 1 && hasUsableRoleColumns_(overrideSheet)) {
    var fromOverride = getRoleSplitFromSheet_(overrideSheet);
    if (fromOverride.length > 0) {
      Logger.log("Role Split: loaded from Role Split override sheet");
      return fromOverride;
    }
  }

  // Compute from raw form responses
  var settings = typeof readSettings === "function" ? readSettings() : {};
  var formSheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  var formSheet = ss.getSheetByName(formSheetName);
  
  if (!formSheet || formSheet.getLastRow() < 2) {
    Logger.log("Role Split: no form responses available");
    return [];
  }

  var computed = computeRoleSplitFromForm_(formSheet, activeCycle);
  if (computed.length > 0) {
    Logger.log("Role Split: computed from form responses (cycle: " + activeCycle + ")");
  }
  return computed;
}

/**
 * Reads role split data from a structured sheet (Summary or override).
 * Expected format: Col A = area name, Col B+ = role group scores, optional Col N = roleGap
 * @private
 */
function getRoleSplitFromSheet_(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var gapHeaderCol = -1;
  for (var h = 0; h < headers.length; h++) {
    if (normalizeLabel(headers[h]) === "rolegap") {
      gapHeaderCol = h;
      break;
    }
  }

  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var area = String(data[i][0]).trim();
    if (!area) continue;

    var scores = {};
    var vals = [];
    for (var c = 1; c < headers.length; c++) {
      if (c === gapHeaderCol) continue;
      var group = String(headers[c]).trim();
      var val = parseFloat(data[i][c]);
      if (group && !isNaN(val)) {
        scores[group] = val;
        vals.push(val);
      }
    }

    var roleGap = (gapHeaderCol >= 0)
      ? (parseFloat(data[i][gapHeaderCol]) || 0)
      : (vals.length >= 2
        ? Math.round((Math.max.apply(null, vals) - Math.min.apply(null, vals)) * 10) / 10
        : 0);

    // Normalize long question labels to canonical area names where possible
    var areaNorm = normalizeLabel(area);
    for (var a = 0; a < AREA_NAMES.length; a++) {
      if (normalizeLabel(AREA_NAMES[a]) === areaNorm) {
        area = AREA_NAMES[a];
        break;
      }
    }

    rows.push({ area: area, scores: scores, roleGap: roleGap });
  }

  return rows;
}

/**
 * Computes role split directly from form responses.
 * @private
 */
function computeRoleSplitFromForm_(formSheet, activeCycle) {
  var data = formSheet.getDataRange().getValues();
  var headers = data[0];

  // Detect role and cycle columns
  var roleCol = 1;  // default col B
  var cycleCol = -1;
  for (var hc = 0; hc < headers.length; hc++) {
    var hn = normalizeLabel(headers[hc]);
    if (hn === "pulsecycle" || hn === "cycle") cycleCol = hc;
    if (hn.indexOf("primaryrole") !== -1 || hn.indexOf("functionbestdescribes") !== -1 || hn === "role") {
      roleCol = hc;
    }
  }

  // Build area column list from canonical area names
  var areaCols = buildAreaColumns_(headers);
  if (!areaCols.length) return [];

  // Accumulate scores per role + area
  var acc = {}; // acc[role][areaName] = { sum, count }
  for (var i = 1; i < data.length; i++) {
    // Filter by active cycle if present
    if (cycleCol >= 0 && activeCycle) {
      var rowCycle = String(data[i][cycleCol] || "").trim();
      if (rowCycle && rowCycle !== activeCycle) continue;
    }

    var role = String(data[i][roleCol] || "").trim();
    if (!role) continue;
    if (!acc[role]) acc[role] = {};

    for (var a = 0; a < areaCols.length; a++) {
      var col = areaCols[a].col;
      var area = areaCols[a].area;
      var score = mapPulseValueToScore_(data[i][col]);
      if (score === null) continue;

      if (!acc[role][area]) acc[role][area] = { sum: 0, count: 0 };
      acc[role][area].sum += score;
      acc[role][area].count += 1;
    }
  }

  var roles = Object.keys(acc);
  if (!roles.length) return [];

  // Build output: one row per area
  var result = [];
  for (var aj = 0; aj < areaCols.length; aj++) {
    var areaName = areaCols[aj].area;
    var scores = {};
    var vals = [];

    for (var ri = 0; ri < roles.length; ri++) {
      var r = roles[ri];
      if (acc[r][areaName] && acc[r][areaName].count > 0) {
        var avg = Math.round((acc[r][areaName].sum / acc[r][areaName].count) * 10) / 10;
        scores[r] = avg;
        vals.push(avg);
      }
    }

    var roleGap = vals.length >= 2
      ? Math.round((Math.max.apply(null, vals) - Math.min.apply(null, vals)) * 10) / 10
      : 0;

    result.push({ area: areaName, scores: scores, roleGap: roleGap });
  }

  return result;
}

/**
 * Builds mapping of area names to their column indices in form headers.
 * @private
 */
function buildAreaColumns_(headers) {
  var areaCols = [];
  for (var ai = 0; ai < AREA_NAMES.length; ai++) {
    var area = AREA_NAMES[ai];
    var areaNorm = normalizeLabel(area);
    var found = -1;
    for (var c = 0; c < headers.length; c++) {
      var hNorm = normalizeLabel(headers[c]);
      if (hNorm && (hNorm === areaNorm || hNorm.indexOf(areaNorm) !== -1)) {
        found = c;
        break;
      }
    }
    if (found >= 0) areaCols.push({ area: area, col: found });
  }
  return areaCols;
}

/**
 * Helper: checks if a sheet has usable role group columns (not just area columns).
 * @private
 */
function hasUsableRoleColumns_(sheet) {
  if (sheet.getLastRow() < 2) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] || [];
  var roleCount = 0;
  for (var h = 0; h < headers.length; h++) {
    var label = String(headers[h]).trim().toLowerCase();
    if (label && label !== "area" && label !== "rolegap" && !AREA_NAMES.some(function(a) { return normalizeLabel(a) === normalizeLabel(label); })) {
      roleCount++;
    }
  }
  return roleCount >= 2; // At least 2 role columns besides area
}

/**
 * Writes role split output to SHEET_ROLE_SPLIT for dashboard consumption.
 * Safe no-op when no role split data is available.
 */
function writeRoleSplitToSheet_(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();

  var trends = (typeof getTrends === "function") ? getTrends(ss) : [];
  var activeCycle = (trends && trends.length > 0)
    ? safeText_(trends[trends.length - 1].cycle)
    : ((typeof getCycle === "function") ? getCycle(ss) : "");

  var rows = getRoleSplitWithFallback(ss, activeCycle);
  if (!rows || !rows.length) {
    Logger.log("Role split write skipped: no data available.");
    return;
  }

  var target = getOrCreateSheet_(ss, SHEET_ROLE_SPLIT);

  var roleNamesMap = {};
  for (var i = 0; i < rows.length; i++) {
    var scoreObj = rows[i].scores || {};
    var names = Object.keys(scoreObj);
    for (var n = 0; n < names.length; n++) {
      roleNamesMap[names[n]] = true;
    }
  }
  var roleNames = Object.keys(roleNamesMap);
  roleNames.sort();

  var header = ["Survey Area"].concat(roleNames).concat(["Role Gap"]);
  var out = [header];

  for (var r = 0; r < rows.length; r++) {
    var item = rows[r];
    var line = [item.area || ""];
    for (var rn = 0; rn < roleNames.length; rn++) {
      var role = roleNames[rn];
      var val = (item.scores && item.scores[role] !== undefined) ? item.scores[role] : "";
      line.push(val);
    }
    line.push((typeof item.roleGap === "number") ? item.roleGap : 0);
    out.push(line);
  }

  target.clear();
  target.getRange(1, 1, out.length, out[0].length).setValues(out);
  target.getRange(1, 1, 1, out[0].length).setFontWeight("bold");
  target.setFrozenRows(1);
}
