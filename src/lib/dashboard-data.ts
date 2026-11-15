// Server side: build the dashboard rows from sites.json, site_lookup.json, v2.json and claims.csv.
// Nothing is computed. Every printed number is a claims.csv display string. The stored score is read only for ordering and colour.
//
// Score rule (one score per site): the Moon list is compared with both Moon targets and the Mars list with Jezero,
// all on the base profile. When a Moon site has a stored score for both targets, the higher one is shown and its view is
// named in the row's title. A site with a score for one target shows that one.
import { claim, hasClaim, lookupFile, sitesFile, v2File } from "./data";
import { formatRunDate, rankSites, type DashBody, type DashSite, type DashboardData } from "./dashboard";
import { e32Sentence } from "./data";
import { viewName } from "./names";

const PROFILE = "base";

function baseViews(body: DashBody): string[] {
  const summary = lookupFile().summary_by_view;
  const want = body === "Moon" ? "moon" : "mars";
  return Object.keys(summary)
    .filter((v) => summary[v].body === want && v.endsWith(`__${PROFILE}`))
    .sort();
}

/** The MODIS years from the stored ledger statement, e.g. "2019 to 2023". Null when the statement has no year range. */
function modisYears(): string | null {
  const modis = v2File().results?.ledger.find((e) => e.id === "src.modis");
  const m = modis?.statement.match(/\b((?:19|20)\d{2}) to ((?:19|20)\d{2})\b/);
  return m ? `${m[1]} to ${m[2]}` : null;
}

/** The newest run timestamp stored in the STATUS files (v2.json results.runs[].updated_ist). */
function refreshedDate(): string {
  const runs = v2File().results?.runs ?? [];
  const dates = runs.map((r) => r.updated_ist).filter(Boolean).sort();
  const newest = dates[dates.length - 1];
  const text = newest ? formatRunDate(newest) : null;
  if (!text) throw new Error("no run timestamp in v2.json results.runs; the dashboard date line cannot be built");
  return text;
}

export function dashboardData(): DashboardData {
  const lookup = lookupFile();
  const own = new Map((v2File().results?.own_tile ?? []).map((o) => [`${o.body}/${o.slug}`, o.claim]));
  const viewsByBody: Record<DashBody, string[]> = { Moon: baseViews("Moon"), Mars: baseViews("Mars") };

  const sites: DashSite[] = sitesFile().sites.map((s) => {
    const views = viewsByBody[s.body];
    const entries = views.map((v) => ({ view: v, e: lookup.sites[s.id]?.[v] })).filter((x) => x.e !== undefined);
    const scored = entries
      .filter((x) => x.e!.status === "scored")
      .map((x) => ({ view: x.view, e: x.e as Extract<NonNullable<typeof x.e>, { status: "scored" }> }))
      .sort((a, b) => b.e.score - a.e.score || a.view.localeCompare(b.view));
    const base = { id: s.id, slug: s.slug, name: s.name, body: s.body, list: s.list, country: s.country ?? "", lat: s.lat, lon: s.lon };

    if (scored.length > 0) {
      const best = scored[0];
      const scoreText = claim(`lookup.${s.id}.${best.view}.score`);
      const ownClaim = s.v1_used === true && s.v1_match.site_id.startsWith("primary/") ? own.get(`${s.body.toLowerCase()}/${s.v1_match.site_id.slice("primary/".length)}`) : undefined;
      if (ownClaim && hasClaim(ownClaim)) {
        return {
          ...base,
          scoreText,
          scoreValue: best.e.score,
          viewLabel: viewName(best.view),
          tagKind: "own-tile" as const,
          tag: `own-tile ${claim(ownClaim)}`,
          tagTitle: "Own-tile percentile of the v2 headline run (terrain plus thermal) at the tile nearest this site. The score on the right is the v1 terrain score.",
        };
      }
      return {
        ...base,
        scoreText,
        scoreValue: best.e.score,
        viewLabel: viewName(best.view),
        tagKind: "best-of-radius" as const,
        tag: `v1 best-of-radius ${claim(`lookup.${s.id}.${best.view}.percentile`)}`,
        tagTitle: "v1 percentile of the best tile within the match radius. A site with random features also scores high on this statistic, so read it as a lookup, not a test.",
      };
    }
    // Not scored for any of this body's views: say why, using the stored reason of the first view.
    const first = entries[0]?.e;
    const reason = first && first.status !== "scored" ? first.reason : "not in v1 outputs";
    return {
      ...base,
      scoreText: null,
      scoreValue: null,
      viewLabel: null,
      tagKind: "gated" as const,
      tag: `gated: ${reason}`,
      tagTitle: "v1 gave this site no score. A missing score says nothing about how good an analog the site is.",
    };
  });

  const ranked = rankSites(sites);
  const names = (b: DashBody) => viewsByBody[b].map(viewName);
  const years = modisYears();
  return {
    sites: ranked,
    viewsByBody: { Moon: names("Moon"), Mars: names("Mars") },
    refreshed: refreshedDate(),
    window: `${years ? `MODIS land surface temperature ${years}, ` : ""}v1 6 km tiles`,
    e32: e32Sentence(),
  };
}
