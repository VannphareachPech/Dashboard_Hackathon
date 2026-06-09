function safeText_(value) {
  return String(value == null ? "" : value).trim();
}

function parseScore_(value) {
  const cleaned = String(value || "").replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : NaN;
}

function normalizeStatus_(raw) {
  const s = safeText_(raw).toLowerCase();
  if (s === "concern") return "Concern";
  if (s === "mixed") return "Mixed";
  if (s === "positive") return "Positive";
  return "";
}

function inferStatusFromScore_(score) {
  if (!isFinite(score)) return "Mixed";
  if (score >= 4) return "Positive";
  if (score >= 3) return "Mixed";
  return "Concern";
}

function normalizeText_(text) {
  return safeText_(text).toLowerCase().replace(/\s+/g, " ");
}

function hashText_(text) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
  return Utilities.base64EncodeWebSafe(digest);
}

function getOrCreateSheet_(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function getRequiredSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Required sheet not found: " + name);
  return sheet;
}