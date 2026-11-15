// Pure helpers for the dashboard: row type, colour ramp, filtering. No file access here, so client code can import it.
// No score is computed in this file. Scores and percentiles arrive as display strings from claims.csv.

export type DashBody = "Moon" | "Mars";
export type TagKind = "own-tile" | "best-of-radius" | "gated" | "not-tested";

export type DashSite = {
  id: string;
  slug: string;
  name: string;
  body: DashBody;
  list: "known" | "candidate";
  country: string;
  lat: number;
  lon: number;
  /** Display string from claims.csv (1 decimal), or null when the site has no score. */
  scoreText: string | null;
  /** The stored v1 score, used only for ordering and colour. Never printed. */
  scoreValue: number | null;
  /** Display name of the view the score comes from, shown in the row's title attribute. */
  viewLabel: string | null;
  tagKind: TagKind;
  /** Sub-line text, for example "own-tile 65.4", "v1 best-of-radius 81.4" or "gated: vegetated". */
  tag: string;
  /** Longer explanation for the tag, shown as a tooltip. */
  tagTitle: string;
};

export type DashboardData = {
  sites: DashSite[];
  /** Per body: the views that were compared, as display names, for the helper tooltip. */
  viewsByBody: Record<DashBody, string[]>;
  refreshed: string;
  window: string;
  e32: string;
};

/** The warm ramp used by the legend and the markers, light yellow to dark red over the 0 to 100 score range. */
export const RAMP: { at: number; color: string }[] = [
  { at: 0, color: "#ffffb2" },
  { at: 20, color: "#fed976" },
  { at: 40, color: "#feb24c" },
  { at: 60, color: "#fd8d3c" },
  { at: 80, color: "#f03b20" },
  { at: 100, color: "#bd0026" },
];

/** The legend title. 0 to 100 is the definition of the score axis, not a result. */
export const LEGEND_TITLE = "Similarity Score (0-100)";

export const UNSCORED_COLOR = "#8a9399";

export const RAMP_CSS = `linear-gradient(to right, ${RAMP.map((r) => `${r.color} ${r.at}%`).join(", ")})`;

function hex(c: string): [number, number, number] {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

/** Colour for a score on the ramp. A missing or non-finite value gets the neutral grey. */
export function scoreColor(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return UNSCORED_COLOR;
  const x = Math.min(100, Math.max(0, v));
  for (let i = 1; i < RAMP.length; i++) {
    if (x <= RAMP[i].at) {
      const a = RAMP[i - 1];
      const b = RAMP[i];
      const t = (x - a.at) / (b.at - a.at);
      const ca = hex(a.color);
      const cb = hex(b.color);
      const m = ca.map((k, j) => Math.round(k + (cb[j] - k) * t));
      return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
    }
  }
  return RAMP[RAMP.length - 1].color;
}

/** Scored sites first by stored score (highest first), then the rest by name. Ties break on name so the order is stable. */
export function rankSites(sites: DashSite[]): DashSite[] {
  return [...sites].sort((a, b) => {
    const as = a.scoreValue;
    const bs = b.scoreValue;
    if (as !== null && bs !== null && as !== bs) return bs - as;
    if ((as === null) !== (bs === null)) return as === null ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}

/** Case-insensitive match on name, country, slug and the status tag. An empty query keeps everything. */
export function filterSites(sites: DashSite[], query: string): DashSite[] {
  const q = query.trim().toLowerCase();
  if (!q) return sites;
  return sites.filter((s) => `${s.name} ${s.country} ${s.slug} ${s.tag}`.toLowerCase().includes(q));
}

/** "2026-11-15 12:05 IST" -> "15 Nov 2026". Returns null when the text does not start with an ISO date. */
export function formatRunDate(ist: string): string | null {
  const m = ist.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[Number(m[2]) - 1];
  if (!mon) return null;
  return `${Number(m[3])} ${mon} ${m[1]}`;
}
