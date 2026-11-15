// Display helpers. Numbers are never formatted here: pages print the strings stored in claims.csv or in the data files.

const STATUS: Record<string, string> = {
  pass: "Passed",
  fail: "Failed",
  not_testable: "Not testable",
  gated_out: "Gated out",
  yes: "Yes",
  no: "No",
  broken: "Does not match",
  partly: "Partly matches",
  failed: "Failed",
  scored: "Scored",
  missing_data: "Missing data",
  no_land_tile: "No land tile",
};

export function statusLabel(s: string): string {
  return STATUS[s] ?? s.replace(/_/g, " ");
}

export function shortHash(sha: string): string {
  return sha.slice(0, 12);
}

export function sourceName(path: string): string {
  return path.replace(/^gsop_v1\//, "v1: ");
}

/** Thousands separators for a stored integer string ("3972955" becomes "3,972,955"). Anything else is returned as stored. */
export function group(n: string): string {
  return /^-?\d{4,}$/.test(n) ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : n;
}
