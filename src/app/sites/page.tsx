import type { Metadata } from "next";
import Band from "../components/Band";
import { BarChart } from "../components/Charts";
import PageHero from "../components/PageHero";
import { claim, lookupFile } from "@/lib/data";
import { explorerData } from "@/lib/explorer-data";
import { viewName } from "@/lib/names";
import Explorer from "./Explorer";

export const metadata: Metadata = {
  title: "Sites",
  description: "Reference sites and candidates used as Moon and Mars analogs, with a photo, a short profile and the score stored for each.",
};

const GROUPS = [
  { view: "shackleton_rim__base", tone: "moon" },
  { view: "connecting_ridge_c1__base", tone: "moon" },
  { view: "jezero__base", tone: "mars" },
] as const;

export default function Page() {
  const { rows, views } = explorerData();
  const lookup = lookupFile();
  const bars = GROUPS.flatMap(({ view, tone }) =>
    (["v1_used_true", "v1_used_false"] as const).map((g) => {
      const base = `lookup.summary.${view}.${g}`;
      const v = claim(`${base}.median_percentile`);
      return { label: `${viewName(view).replace(", Base", "")}, ${g === "v1_used_true" ? "sites v1 used" : "sites v1 left out"}`, value: parseFloat(v), display: v, tone, note: claim(`${base}.n`) };
    }),
  );
  return (
    <>
      <PageHero title="Sites" lede="Places people have used as Moon or Mars analogs, plus candidates we have not reviewed. Open one for a photo, a short profile and the score we stored for it." />

      <div className="mx-auto max-w-3xl space-y-3 pb-6 text-secondary-foreground">
        <p>
          Profiles and photos were gathered from public sources and nobody on the team has reviewed them yet. The score on each card is a value v1 already stored, looked up at the site. It is not a test, and the ranking has not been checked against
          independent data.
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer">What the scores can and cannot tell you</summary>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {lookup.meta.limits.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </details>
      </div>

      <Explorer rows={rows} views={views} />

      <Band tone="grid">
        <h2 className="text-3xl">How the listed sites scored</h2>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-secondary-foreground">
              Median stored percentile for the sites v1 used and the sites it left out. Both groups land in the same high range, because the v1 site percentile takes the best tile within the match radius. A place with random features would score about {claim("v2.result.audit.chance_best")} that way.
            </p>
          </div>
          <BarChart title="Median stored percentile by target" rows={bars} reference={{ value: parseFloat(claim("v2.result.audit.chance_best")), label: "chance level for the best tile within the radius" }} />
        </div>
      </Band>
    </>
  );
}
