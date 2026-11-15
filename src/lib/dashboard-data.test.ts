import { describe, expect, it } from "vitest";
import { dashboardData } from "./dashboard-data";
import { filterSites, formatRunDate, rankSites, scoreColor, UNSCORED_COLOR, type DashSite } from "./dashboard";
import { claim, sitesFile, v2File } from "./data";

const data = dashboardData();
const byBody = (b: "Moon" | "Mars") => data.sites.filter((s) => s.body === b);

describe("dashboard data", () => {
  it("has one row per site, split by the list the site belongs to", () => {
    const all = sitesFile().sites;
    expect(data.sites).toHaveLength(all.length);
    expect(byBody("Moon")).toHaveLength(all.filter((s) => s.body === "Moon").length);
    expect(byBody("Mars")).toHaveLength(all.filter((s) => s.body === "Mars").length);
  });

  it("compares the Moon list with both Moon targets and the Mars list with Jezero only", () => {
    expect(data.viewsByBody.Moon).toEqual(["Connecting Ridge C1, Base", "Shackleton rim, Base"]);
    expect(data.viewsByBody.Mars).toEqual(["Jezero, Base"]);
    for (const s of byBody("Mars")) if (s.viewLabel) expect(s.viewLabel).toBe("Jezero, Base");
    for (const s of byBody("Moon")) if (s.viewLabel) expect(s.viewLabel).toMatch(/Connecting Ridge C1|Shackleton rim/);
  });

  it("orders scored sites first, highest stored score first, then the rest", () => {
    for (const body of ["Moon", "Mars"] as const) {
      const rows = byBody(body);
      const firstGap = rows.findIndex((r) => r.scoreValue === null);
      expect(firstGap).toBeGreaterThan(0);
      expect(rows.slice(firstGap).every((r) => r.scoreValue === null)).toBe(true);
      const scores = rows.slice(0, firstGap).map((r) => r.scoreValue as number);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    }
  });

  it("prints only claims.csv display strings and never NaN or undefined", () => {
    for (const s of data.sites) {
      if (s.scoreText !== null) {
        expect(s.scoreText).toMatch(/^\d+\.\d$/);
        expect(Number.isFinite(s.scoreValue)).toBe(true);
      }
      expect(JSON.stringify(s)).not.toMatch(/NaN|undefined|null null/);
      expect(s.tag).not.toMatch(/NaN|undefined/);
    }
    expect(JSON.stringify(data)).not.toMatch(/NaN|undefined/);
  });

  it("tags every row honestly and never invents a confidence range", () => {
    for (const s of data.sites) {
      if (s.tagKind === "gated") {
        expect(s.scoreText).toBeNull();
        expect(s.tag.startsWith("No score: ")).toBe(true);
      } else if (s.tagKind === "own-tile") {
        expect(s.tag).toMatch(/^Own-tile percentile \d+\.\d$/);
      } else if (s.tagKind === "best-of-radius") {
        expect(s.tag).toMatch(/^Best nearby tile, percentile \d+\.\d$/);
      }
      expect(s.tag).not.toMatch(/±|confidence|interval/i);
    }
    expect(data.sites.some((s) => s.tagKind === "best-of-radius")).toBe(true);
    expect(data.sites.some((s) => s.tagKind === "gated")).toBe(true);
  });

  it("uses own-tile only where the v2 run reports one, and takes the number from its claim", () => {
    const reported = new Set(v2File().results!.own_tile.map((o) => `${o.body}/${o.slug}`));
    const own = data.sites.filter((s) => s.tagKind === "own-tile");
    expect(own.length).toBeGreaterThan(0);
    for (const s of own) {
      const site = sitesFile().sites.find((x) => x.id === s.id)!;
      const key = `${s.body.toLowerCase()}/${site.v1_match.site_id.replace("primary/", "")}`;
      expect(reported.has(key)).toBe(true);
      expect(s.tag).toBe(`Own-tile percentile ${claim(`v2.result.own_tile.${key.replace("/", ".")}`)}`);
    }
  });

  it("gives each site a photo path only when the file exists", () => {
    for (const s of data.sites) {
      if (s.photo !== null) expect([`/img/sites/${s.slug}.jpg`, `/img/places/thumb/${s.slug}.jpg`]).toContain(s.photo);
    }
  });

  it("has no Arcadia row and so no invented Arcadia number", () => {
    expect(data.sites.some((s) => /arcadia/i.test(s.name))).toBe(false);
  });

  it("reads the refresh date from the run records and the window from the ledger", () => {
    expect(data.refreshed).toMatch(/^\d{1,2} [A-Z][a-z]{2} \d{4}$/);
    expect(data.window).toMatch(/MODIS land surface temperature \d{4} to \d{4}, v1 6 km tiles/);
  });
});

describe("dashboard helpers", () => {
  const row = (over: Partial<DashSite>): DashSite => ({
    id: "a", slug: "a", name: "Alpha", body: "Moon", list: "known", country: "Chile", photo: null, lat: 0, lon: 0,
    scoreText: "10.0", scoreValue: 10, viewLabel: "X", tagKind: "best-of-radius", tag: "Best nearby tile, percentile 50.0", tagTitle: "", ...over,
  });

  it("colours the ends of the ramp and gives unscored sites grey", () => {
    expect(scoreColor(0)).toBe("rgb(255, 255, 178)");
    expect(scoreColor(100)).toBe("rgb(189, 0, 38)");
    expect(scoreColor(null)).toBe(UNSCORED_COLOR);
    expect(scoreColor(Number.NaN)).toBe(UNSCORED_COLOR);
  });

  it("ranks scored before unscored and breaks ties by name", () => {
    const r = rankSites([row({ id: "n", name: "None", scoreValue: null }), row({ id: "b", name: "Beta", scoreValue: 5 }), row({ id: "a", name: "Alpha", scoreValue: 5 })]);
    expect(r.map((x) => x.id)).toEqual(["a", "b", "n"]);
  });

  it("filters on name, country and tag, and keeps all rows for an empty query", () => {
    const rows = [row({ id: "a", name: "Alpha", country: "Chile" }), row({ id: "b", name: "Beta", country: "India", tag: "No score: vegetated" })];
    expect(filterSites(rows, "")).toHaveLength(2);
    expect(filterSites(rows, "india").map((r) => r.id)).toEqual(["b"]);
    expect(filterSites(rows, "VEGETATED").map((r) => r.id)).toEqual(["b"]);
    expect(filterSites(rows, "zzz")).toHaveLength(0);
  });

  it("formats an IST stamp as a date and rejects other text", () => {
    expect(formatRunDate("2026-11-15 12:05 IST")).toBe("15 Nov 2026");
    expect(formatRunDate("not recorded")).toBeNull();
  });
});
