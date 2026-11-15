import type { Metadata } from "next";
import Link from "next/link";
import Band from "../../components/Band";
import { DumbbellChart } from "../../components/Charts";
import PageHero from "../../components/PageHero";
import { claim } from "@/lib/data";
import { csvColumns, GITHUB_BLOB, SITE_ORIGIN, v2MetricEntry } from "@/lib/pages-data";
import { REPO_URL } from "@/lib/nav";
import GateStatuses from "../GateStatuses";

export const metadata: Metadata = {
  title: "For independent researchers",
  description: "What the GSOP claims files contain, how to reproduce one site's score trail from them, how to cite the project, and which conclusions the data does not support.",
};

const link = "underline underline-offset-4";
const code = "gsop-mono bg-surface px-1";
const n = (id: string) => parseFloat(claim(id));

export default function Page() {
  const cols = csvColumns("data/v2/runs/v2/claims_v2.csv");
  const colsD = csvColumns("data/v2/runs/v2/claims_d.csv");
  const before = v2MetricEntry("desc.baseline.moon.namib_sand_sea.mean_own_tile_pct");
  const after = v2MetricEntry("desc.H.moon.namib_sand_sea.mean_own_tile_pct");
  return (
    <>
      <PageHero title="For independent researchers" lede="Every number on this site has a row in a claims file. This page shows what the files hold and how to follow one number back to its source." />

      <Band tone="grid" labelledBy="files">
        <h2 id="files" className="mb-5 text-2xl">
          What the files contain
        </h2>
        <ul className="max-w-3xl list-disc space-y-3 pl-6">
          <li>
            <code className={code}>claims.csv</code>, served at{" "}
            <a href={`${SITE_ORIGIN}/data/claims.csv`} className={link} target="_blank" rel="noopener noreferrer">
              /data/claims.csv
            </a>
            , lists every number the pages print. Columns: <code className={code}>{cols.join(", ")}</code>.
          </li>
          <li>
            <code className={code}>claims_v2.csv</code> (track A, the thermal layer and gates) and <code className={code}>claims_d.csv</code> (track D, the fitted model) sit in{" "}
            <a href={`${GITHUB_BLOB}/data/v2/runs/v2`} className={link} target="_blank" rel="noopener noreferrer">
              data/v2/runs/v2
            </a>
            . Their columns: <code className={code}>{cols.join(", ")}</code> and <code className={code}>{colsD.join(", ")}</code>.
          </li>
          <li>
            <code className={code}>number</code> is a display string, not a float. Percentiles are percent ranks inside one body&apos;s own tiles. Temperatures are in kelvin, and those names end in <code className={code}>_K</code>. Coverage is a share from zero to one. Counts are plain integers.
          </li>
          <li>
            <code className={code}>source_file</code> and <code className={code}>sha256</code> name the file a number came from and that file&apos;s hash at build time.
          </li>
          <li>The track C measurement files (claims_c.csv and site_measurements.csv) are not part of this build, so this page does not describe them.</li>
        </ul>
      </Band>

      <h2 id="trail" className="text-2xl">
        Follow one score
      </h2>
      <div className="grid items-start gap-10 md:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="trail" className="space-y-3">
          <p className="text-secondary-foreground">Take the Namib sand sea, a Moon negative control, and its own-tile percentile before and after the thermal layer.</p>
          <ol className="list-decimal space-y-3 pl-6">
            <li>
              Look up <code className={code}>v2.result.own.namib.before</code> ({claim("v2.result.own.namib.before")}) and <code className={code}>v2.result.own.namib.after</code> ({claim("v2.result.own.namib.after")}) in <code className={code}>claims.csv</code>.
            </li>
            <li>
              Open the <code className={code}>source_file</code> on those rows, <code className={code}>data/v2/runs/v2/metrics.json</code>, and find the two entries below.
              {before && after ? (
                <ul className="mt-1 list-disc space-y-1 pl-6 text-secondary-foreground">
                  <li>
                    {before.label}: {before.display}
                  </li>
                  <li>
                    {after.label}: {after.display}
                  </li>
                </ul>
              ) : null}
            </li>
            <li>
              Hash the file with <code className={code}>sha256sum</code> or <code className={code}>shasum</code>. The digest should match the <code className={code}>sha256</code> column.
            </li>
            <li>
              The{" "}
              <Link href="/method" className={link}>
                methodology
              </Link>{" "}
              and{" "}
              <Link href="/gates" className={link}>
                gates
              </Link>{" "}
              pages explain the statistic. The own-tile statistic has a chance level near {claim("v2.result.audit.chance_own")}, while best-of-radius sits near {claim("v2.result.audit.chance_best")} for random features.
            </li>
          </ol>
        </section>
        <DumbbellChart
          title="The trail you just followed"
          fromLabel="terrain only"
          toLabel="with the thermal layer"
          rows={[
            { label: "Namib sand sea", from: n("v2.result.own.namib.before"), to: n("v2.result.own.namib.after"), fromDisplay: claim("v2.result.own.namib.before"), toDisplay: claim("v2.result.own.namib.after") },
            { label: "Rub' al Khali", from: n("v2.result.own.rak.before"), to: n("v2.result.own.rak.after"), fromDisplay: claim("v2.result.own.rak.before"), toDisplay: claim("v2.result.own.rak.after") },
          ]}
        />
      </div>

      <Band tone="raised" labelledBy="cite">
        <h2 id="cite" className="mb-3 text-2xl">
          How to cite
        </h2>
        <p className="mb-3 text-secondary-foreground">Cite the repository and the commit you used. There is no DOI.</p>
        <pre className="overflow-x-auto whitespace-pre-wrap border border-border bg-background p-4 font-mono text-sm">{`GSOP team (2026). GSOP: Geospatial Similarity Observation Platform, a screening index for Earth analog sites. ${REPO_URL}, commit <hash>.`}</pre>
      </Band>

      <Band tone="accent" labelledBy="not">
        <h2 id="not" className="mb-5 text-2xl">
          What the data does not support
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <GateStatuses />
          <ul className="list-disc space-y-2 pl-6">
            <li>The ranking has not been checked against independent data, so it is no evidence that a place is a good analog.</li>
            <li>G2 FAIL: Moon negative controls scored too high, so the score does not separate analogs from non-analogs.</li>
            <li>G1 FAIL with D1 and D2 NOT TESTED: no claim about the fitted model, and none about places outside the thermal coverage.</li>
            <li>G3 FAIL: flagged regions are candidates not in our reference list.</li>
            <li>Moon recall NOT TESTED, and Mars is a low-confidence secondary result.</li>
          </ul>
        </div>
      </Band>
    </>
  );
}
