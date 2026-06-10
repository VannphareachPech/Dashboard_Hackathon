/**
 * TrendService.gs — Centralized trend history management
 * Consolidated from Summary.gs (appendTrend) and Utils.gs (backfillTrendFromFormResponses)
 * to eliminate duplicate logic and inconsistent score computation.
 */

/**
 * Appends or updates a trend row for the current cycle.
 * Handles dedup: if cycle exists with area values, skips; if empty row, updates.
 * @param {Array<Object>} rows - Score rows from readScoreRows()
 * @param {Array<string>} areaOrder - Area names in desired column order
 * @param {Object} meta - { cycle, now, totalResponses, highestArea, lowestArea }
 */
function appendTrendRow(rows, areaOrder, meta) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet_(ss, SHEET_TREND);

  var lastRow = sheet.getLastRow();
  var existingRowNumber = null;
  if (lastRow > 1) {
    var existingCycles = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var ec = 0; ec < existingCycles.length; ec++) {
      if (safeText_(existingCycles[ec][0]) === meta.cycle) {
        existingRowNumber = ec + 2;
        break;
      }
    }
  }

  // Use provided area order or derive from rows
  if (!areaOrder || !areaOrder.length) {
    areaOrder = (typeof AREA_NAMES !== 'undefined' && AREA_NAMES.length)
      ? AREA_NAMES.slice()
      : rows.map(function(r) { return r.area; });
  }

  // Create header row if needed
  if (lastRow === 0) {
    sheet.appendRow(['Pulse', 'Overall Score'].concat(areaOrder));
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  }

  // Build score map
  var scoreMap = {};
  rows.forEach(function(r) {
    scoreMap[r.area] = isFinite(r.score) ? Number(r.score.toFixed(2)) : '';
  });

  // Compute overall score
  var numericScores = rows
    .map(function(r) { return r.score; })
    .filter(function(v) { return isFinite(v); });
  var overallScore = numericScores.length
    ? Number((numericScores.reduce(function(sum, n) { return sum + n; }, 0) / numericScores.length).toFixed(2))
    : '';

  // Build row values
  var areaScores = areaOrder.map(function(area) {
    return scoreMap[area] !== undefined ? scoreMap[area] : '';
  });
  var rowValues = [meta.cycle, overallScore].concat(areaScores);

  // Update existing row or append new
  if (existingRowNumber) {
    var existing = sheet.getRange(existingRowNumber, 1, 1, rowValues.length).getValues()[0];
    var hasAreaValues = false;
    for (var c = 2; c < existing.length; c++) {
      if (String(existing[c]).trim() !== '') {
        hasAreaValues = true;
        break;
      }
    }

    if (hasAreaValues) {
      Logger.log('Trend: skipped duplicate row for cycle ' + meta.cycle);
      return;
    }

    sheet.getRange(existingRowNumber, 1, 1, rowValues.length).setValues([rowValues]);
    Logger.log('Trend row updated for cycle: ' + meta.cycle);
  } else {
    sheet.appendRow(rowValues);
    Logger.log('Trend row appended for cycle: ' + meta.cycle);
  }
}

/**
 * Backfills missing historical cycles from Form Responses into Trend sheet.
 * Aggregates form data by cycle, fills gaps in Trend history.
 * @param {Spreadsheet} ss - Active spreadsheet (optional; uses active if not provided)
 */
function backfillTrendFromFormResponses(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();

  var settings = (typeof readSettings === 'function') ? readSettings() : {};
  var formSheetName = settings.formSheetName || PULSE_CONFIG.FORM_RESPONSE_SHEET;
  var formSheet = ss.getSheetByName(formSheetName);
  if (!formSheet || formSheet.getLastRow() < 2) return;

  var values = formSheet.getDataRange().getValues();
  var headers = values[0];
  var rows = values.slice(1);

  // Find cycle column
  var cycleCol = -1;
  for (var c = 0; c < headers.length; c++) {
    var hc = normalizeLabel(headers[c]);
    if (hc === 'pulsecycle' || hc === 'cycle') {
      cycleCol = c;
      break;
    }
  }
  if (cycleCol < 0) {
    Logger.log('Trend backfill skipped: no Pulse Cycle column found in ' + formSheetName);
    return;
  }

  var areaOrder = (typeof AREA_NAMES !== 'undefined' && AREA_NAMES.length)
    ? AREA_NAMES.slice()
    : [];
  if (!areaOrder.length) {
    Logger.log('Trend backfill skipped: AREA_NAMES is empty.');
    return;
  }

  // Build area column mapping
  var areaCols = buildAreaColumnsForBackfill_(headers, areaOrder);
  if (!areaCols.length) {
    Logger.log('Trend backfill skipped: no area columns matched in ' + formSheetName);
    return;
  }

  // Aggregate by cycle
  var agg = aggregateTrendByFormCycle_(rows, cycleCol, areaCols);
  if (Object.keys(agg).length === 0) {
    Logger.log('Trend backfill: no data to aggregate');
    return;
  }

  // Get trend sheet and ensure headers
  var trendSheet = getOrCreateSheet_(ss, SHEET_TREND);
  if (trendSheet.getLastRow() === 0) {
    trendSheet.appendRow(['Pulse', 'Overall Score'].concat(areaOrder));
    trendSheet.getRange(1, 1, 1, trendSheet.getLastColumn()).setFontWeight('bold');
  }

  // Map area names to trend sheet columns
  var areaHeaderIndex = buildAreaHeaderIndex_(trendSheet, areaOrder);

  // Identify existing cycles to avoid duplicates
  var trendData = trendSheet.getDataRange().getValues();
  var existingCycleKeys = {};
  for (var tr = 1; tr < trendData.length; tr++) {
    var existingCycle = safeText_(trendData[tr][0]);
    if (existingCycle) existingCycleKeys[normalizeLabel(existingCycle)] = true;
  }

  // Append new cycles
  var appended = 0;
  var cycles = Object.keys(agg);
  for (var ci = 0; ci < cycles.length; ci++) {
    var cycleLabel = cycles[ci];
    if (!cycleLabel) continue;
    if (existingCycleKeys[normalizeLabel(cycleLabel)]) continue;

    var metric = agg[cycleLabel];
    if (!metric.totalCount) continue;

    var trendHeaders = trendSheet.getDataRange().getValues()[0] || [];
    var rowOut = new Array(trendHeaders.length);
    for (var fill = 0; fill < rowOut.length; fill++) rowOut[fill] = '';
    rowOut[0] = cycleLabel;
    rowOut[1] = Number((metric.totalSum / metric.totalCount).toFixed(2));

    for (var ao = 0; ao < areaOrder.length; ao++) {
      var areaName = areaOrder[ao];
      var idx = areaHeaderIndex[areaName];
      if (idx === undefined) continue;
      var areaStat = metric.area[areaName];
      if (areaStat && areaStat.count > 0) {
        rowOut[idx] = Number((areaStat.sum / areaStat.count).toFixed(2));
      }
    }

    trendSheet.appendRow(rowOut);
    existingCycleKeys[normalizeLabel(cycleLabel)] = true;
    appended++;
  }

  if (appended > 0) {
    sortTrendSheetByCycle_(trendSheet);
    Logger.log('Trend backfill: appended ' + appended + ' historical cycle(s) from ' + formSheetName + '.');
  }
}

/**
 * Aggregates form response data by cycle.
 * @private
 */
function aggregateTrendByFormCycle_(rows, cycleCol, areaCols) {
  var agg = {};
  for (var r = 0; r < rows.length; r++) {
    var cycle = safeText_(rows[r][cycleCol]);
    if (!cycle) continue;

    if (!agg[cycle]) {
      agg[cycle] = {
        totalSum: 0,
        totalCount: 0,
        area: {},
      };
    }

    for (var ac = 0; ac < areaCols.length; ac++) {
      var areaName = areaCols[ac].area;
      var score = mapPulseValueToScore_(rows[r][areaCols[ac].col]);
      if (score === null) continue;

      if (!agg[cycle].area[areaName]) agg[cycle].area[areaName] = { sum: 0, count: 0 };
      agg[cycle].area[areaName].sum += score;
      agg[cycle].area[areaName].count += 1;
      agg[cycle].totalSum += score;
      agg[cycle].totalCount += 1;
    }
  }
  return agg;
}

/**
 * Builds area column mapping for form headers.
 * @private
 */
function buildAreaColumnsForBackfill_(headers, areaOrder) {
  var areaCols = [];
  for (var a = 0; a < areaOrder.length; a++) {
    var area = areaOrder[a];
    var areaNorm = normalizeLabel(area);
    var found = -1;
    for (var i = 0; i < headers.length; i++) {
      var hn = normalizeLabel(headers[i]);
      if (!hn) continue;
      if (hn === areaNorm || hn.indexOf(areaNorm) !== -1) {
        found = i;
        break;
      }
    }
    if (found >= 0) areaCols.push({ area: area, col: found });
  }
  return areaCols;
}

/**
 * Maps area names to their column indices in the trend sheet.
 * @private
 */
function buildAreaHeaderIndex_(trendSheet, areaOrder) {
  var trendHeaders = trendSheet.getDataRange().getValues()[0] || [];
  var areaHeaderIndex = {};
  for (var aoIdx = 0; aoIdx < areaOrder.length; aoIdx++) {
    var areaName = areaOrder[aoIdx];
    var areaNorm = normalizeLabel(areaName);
    for (var th = 2; th < trendHeaders.length; th++) {
      var headerNorm = normalizeLabel(trendHeaders[th]);
      if (!headerNorm) continue;
      if (headerNorm === areaNorm || headerNorm.indexOf(areaNorm) !== -1 || areaNorm.indexOf(headerNorm) !== -1) {
        areaHeaderIndex[areaName] = th;
        break;
      }
    }
  }
  return areaHeaderIndex;
}

/**
 * Sorts trend sheet by cycle number (extracts numeric part, falls back to string compare).
 * @private
 */
function sortTrendSheetByCycle_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 2 || lastCol < 2) return;

  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  data.sort(function(a, b) {
    var ac = safeText_(a[0]);
    var bc = safeText_(b[0]);

    var an = parseInt(ac.replace(/[^0-9]/g, ''), 10);
    var bn = parseInt(bc.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;

    return ac.localeCompare(bc);
  });

  sheet.getRange(2, 1, data.length, lastCol).setValues(data);
}
