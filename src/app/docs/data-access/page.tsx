import type { Metadata } from "next";
import Link from "next/link";
import { formatBytes, publicDataFiles, SITE_ORIGIN } from "@/lib/pages-data";

export const metadata: Metadata = {
  title: "Data file access",
  description: "Every static data file served under /data on the GSOP site: path, schema, example URL, update cadence and access terms.",
};

const link = "underline underline-offset-4";
const code = "gsop-mono bg-surface px-1";

export default function Page() {
  const files = publicDataFiles();
  const example = files.find((f) => f.path === "v2.json") ?? files[0];
  return (
    <article className="max-w-4xl space-y-10">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl">Data file access</h1>
        <p className="text-lg text-secondary-foreground">GSOP has no server-side interface. The data is a set of static files that you fetch by URL. These are file endpoints, and nothing here is queried or filtered on the server.</p>
      </header>

      <section className="max-w-3xl space-y-3" aria-labelledby="terms">
        <h2 id="terms" className="text-2xl">
          Terms of access
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Base URL: <code className={code}>{SITE_ORIGIN}/data/</code>. Append the path from the table below.
          </li>
          <li>No authentication, no key, no sign-up.</li>
          <li>Files are served from the CDN as static content, so repeated reads are cheap. Cache them locally and keep the hash.</li>
          <li>Update cadence: files are rebuilt at deploy time, from stored results. They do not change between deploys.</li>
          <li>
            Each JSON file starts with a <code className={code}>meta</code> block: label, limits, and the source files with their hashes. Read the limits before using a file.
          </li>
          <li>
            Data from outside sources keeps its provider&apos;s licence; see{" "}
            <Link href="/data-sources" className={link}>
              data sources
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="max-w-3xl space-y-3" aria-labelledby="fetch">
        <h2 id="fetch" className="text-2xl">
          Fetch a file
        </h2>
        <pre className="overflow-x-auto whitespace-pre-wrap border border-border bg-surface p-4 font-mono text-sm">{`curl -O ${SITE_ORIGIN}/data/${example.path}`}</pre>
        <p>
          Then check the numbers you use against <code className={code}>claims.csv</code>, which maps each printed number to its source file and hash. The{" "}
          <Link href="/docs/researchers" className={link}>
            researcher guide
          </Link>{" "}
          shows how.
        </p>
      </section>

      <section className="max-w-3xl space-y-3" aria-labelledby="families">
        <h2 id="families" className="text-2xl">
          How the files are organised
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Site files: <code className={code}>sites.json</code> is the reference list with its candidates, and <code className={code}>site_lookup.json</code> is the stored score at each site, one entry per view. A site with no score says nothing about how good an analog it is.
          </li>
          <li>
            Candidate files: <code className={code}>tiles_top.json</code> holds the top tiles for each target, and <code className={code}>regions.json</code> groups neighbouring tiles. Both are candidates not in our reference list, and both are unreviewed.
          </li>
          <li>
            Result files: <code className={code}>metrics.json</code>, <code className={code}>controls.json</code> and <code className={code}>ledger.json</code> hold the first run and what failed. <code className={code}>v2.json</code> holds the second run: gate statuses, input hashes and the thermal reference rows.
          </li>
          <li>
            Overlay files: one score image and one sidecar per target, plus a shared legend. The sidecar gives the bounds and the colour scale, so you can place the image yourself.
          </li>
          <li>
            Audit file: <code className={code}>claims.csv</code> lists every number the pages print, with its source file and hash.
          </li>
        </ul>
      </section>

      <section className="max-w-3xl space-y-3" aria-labelledby="care">
        <h2 id="care" className="text-2xl">
          Reading the files with care
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>A missing value is the string &quot;not in v1 outputs&quot;, never a filled-in number.</li>
          <li>Gate statuses are the literal strings PASS, FAIL and NOT TESTED. Do not map NOT TESTED to a pass or a fail.</li>
          <li>Percentiles are ranks inside one body&apos;s own set of tiles, so a Moon percentile and a Mars percentile are not comparable.</li>
          <li>The ranking has not been checked against independent data. Say so wherever you reuse a number.</li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="files">
        <h2 id="files" className="max-w-3xl text-2xl">
          Files
        </h2>
        <p className="max-w-3xl text-secondary-foreground">The list below is read from the deployed directory at build time, so it matches what is served. The overlays folder holds score images and their sidecars for the map.</p>
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
      </section>
    </article>
  );
}
