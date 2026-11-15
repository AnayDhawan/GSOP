import type { Metadata } from "next";
import Link from "next/link";
import Band from "../../components/Band";
import { BarChart } from "../../components/Charts";
import PageHero from "../../components/PageHero";
import PagePhoto from "../../components/PagePhoto";
import { formatBytes, publicDataFiles, SITE_ORIGIN } from "@/lib/pages-data";

export const metadata: Metadata = {
  title: "Data file access",
  description: "Every static data file served under /data on the GSOP site: path, schema, example URL, update cadence and access terms.",
};

const link = "underline underline-offset-4";
const code = "gsop-mono bg-surface px-1 break-all";

export default function Page() {
  const files = publicDataFiles();
  const example = files.find((f) => f.path === "v2.json") ?? files[0];
  const largest = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 8);
  return (
    <>
      <PageHero title="Data file access" lede="GSOP has no server-side interface. The data is a set of static files that you fetch by URL, and nothing is queried or filtered on our side." />

      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
        <section aria-labelledby="terms" className="space-y-3">
          <h2 id="terms" className="text-2xl">
            Terms of access
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Base URL: <code className={code}>{SITE_ORIGIN}/data/</code>. Add a path from the table below.
            </li>
            <li>No authentication, no key, no sign-up.</li>
            <li>Files come from the CDN as static content, so cache them locally and keep the hash.</li>
            <li>Update cadence: files are rebuilt at deploy time from stored results and do not change between deploys.</li>
            <li>
              Each JSON file opens with a <code className={code}>meta</code> block holding its label, its limits and its source files with hashes. Read the limits first.
            </li>
            <li>
              Outside data keeps its provider&apos;s licence; see{" "}
              <Link href="/data-sources" className={link}>
                data sources
              </Link>
              .
            </li>
          </ul>
          <pre className="overflow-x-auto whitespace-pre-wrap border border-border bg-surface p-4 font-mono text-sm">{`curl -O ${SITE_ORIGIN}/data/${example.path}`}</pre>
        </section>
        <BarChart
          title="The largest files"
          caption="Sizes are read from the served directory when the site is built."
          rows={largest.map((f) => ({ label: f.path, value: f.bytes, display: formatBytes(f.bytes), tone: "earth" as const }))}
          max={largest[0]?.bytes ?? 1}
        />
      </div>

      <Band tone="grid" labelledBy="families">
        <h2 id="families" className="mb-5 text-2xl">
          How the files are organised
        </h2>
        <ul className="max-w-3xl list-disc space-y-3 pl-6">
          <li>
            Sites: <code className={code}>sites.json</code> is the reference list with its candidates, and <code className={code}>site_lookup.json</code> holds the stored score at each site, one entry per view. A site with no score says nothing about how good an analog it is.
          </li>
          <li>
            Candidates: <code className={code}>tiles_top.json</code> holds the top tiles for each target and <code className={code}>regions.json</code> groups neighbouring tiles. Both are candidates not in our reference list, and both are unreviewed.
          </li>
          <li>
            Results: <code className={code}>metrics.json</code>, <code className={code}>controls.json</code> and <code className={code}>ledger.json</code> cover the first run and what failed. <code className={code}>v2.json</code> covers the second: gate statuses, input hashes and thermal reference rows.
          </li>
          <li>Overlays: one score image and one sidecar per target, plus a shared legend. The sidecar gives the bounds and colour scale so you can place the image yourself.</li>
          <li>
            Audit: <code className={code}>claims.csv</code> lists every number the pages print with its source file and hash. The{" "}
            <Link href="/docs/researchers" className={link}>
              researcher guide
            </Link>{" "}
            shows how to use it.
          </li>
        </ul>
        <PagePhoto src="/data/overlays/jezero.png" alt="World map coloured by the score against the Jezero target, base profile" width={3600} height={1383} dark className="mt-8 max-w-3xl" caption="An overlay file as served: the image for the Jezero target. Transparent areas have no v1 score." />
      </Band>

      <section aria-labelledby="care" className="max-w-3xl space-y-3">
        <h2 id="care" className="text-2xl">
          Reading the files with care
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>A missing value is the string &quot;not in v1 outputs&quot;, never a filled-in number.</li>
          <li>Gate statuses are the literal strings PASS, FAIL and NOT TESTED. Do not turn NOT TESTED into a pass or a fail.</li>
          <li>Percentiles are ranks inside one body&apos;s own tiles, so a Moon percentile and a Mars percentile cannot be compared.</li>
          <li>The ranking has not been checked against independent data. Say so wherever you reuse a number.</li>
        </ul>
      </section>

      <Band tone="raised" labelledBy="files">
        <h2 id="files" className="mb-3 text-2xl">
          Files
        </h2>
        <p className="mb-5 max-w-3xl text-secondary-foreground">This list is read from the deployed directory at build time, so it matches what is served.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Static data files</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-medium">Path and example URL</th>
                <th scope="col" className="py-2 pr-4 font-medium">Size</th>
                <th scope="col" className="py-2 pr-4 font-medium">What it holds</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.path} className="border-b border-border align-top">
                  <th scope="row" className="py-2 pr-4 font-medium">
                    <a href={`/data/${f.path}`} className={`gsop-mono ${link}`}>
                      {f.path}
                    </a>
                    <span className="block break-all font-normal text-secondary-foreground">{`${SITE_ORIGIN}/data/${f.path}`}</span>
                  </th>
                  <td className="whitespace-nowrap py-2 pr-4">{formatBytes(f.bytes)}</td>
                  <td className="py-2 pr-4">
                    {f.label ? <span className="block">{f.label}</span> : null}
                    <span className="block text-secondary-foreground">{f.schema}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Band>
    </>
  );
}
