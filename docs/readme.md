# Pulse Dashboard Quick Guide

This dashboard uses Google Sheets as the source of truth, Google Apps Script to calculate and serve the data, and Next.js to display it.

## Why we use Apps Script

Apps Script sits next to the spreadsheet, so it can:

- read the latest pulse data directly from Google Sheets
- calculate the metrics once in one place
- expose the result as JSON for the dashboard
- keep the dashboard simple and fast

In other words, Apps Script is the data-processing layer between the sheet and the web app.

## How the data flows

1. People fill out the pulse data in Google Sheets.
2. Apps Script reads the sheet tabs and calculates the dashboard values.
3. The Next.js app fetches that JSON endpoint.
4. The UI renders charts, cards, and summaries.

## What gets calculated

The Apps Script endpoint builds the payload the dashboard uses. It calculates:

- `summary` - total responses, overall score, strongest area, weakest area, and status
- `trends` - historical pulse scores across cycles
- `areaScores` - current area scores plus:
  - `delta` = change from the previous pulse
  - `pulsesAtRisk` = how many recent pulses stayed below the stable threshold
- `recommendations` - recurring themes and suggested actions
- `actions` - leadership action items
- `roleSplit` - score breakdown by role group
- `responseCounts` and `responseMix` - participation and sentiment views

## Where the calculations happen

Most of the real math happens in [appsscript/dashboard.gs](../appsscript/dashboard.gs).

Key rules:

- overall status is derived from thresholds in the Settings sheet
- trend history comes from the Trend sheet
- delta is calculated by comparing the current area score with the previous pulse
- pulses-at-risk counts consecutive cycles below the stable threshold
- the frontend does not invent the numbers; it mostly displays what Apps Script returns

## Simple explanation you can tell someone

"We keep the calculations in Apps Script because the data lives in Google Sheets. Apps Script reads the sheets, computes the pulse metrics, and serves them as JSON. The dashboard just fetches that JSON and visualizes it."

## One-line summary

Google Sheets stores the raw data, Apps Script does the calculations, and the dashboard shows the results.