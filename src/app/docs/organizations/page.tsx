import type { Metadata } from "next";
import Link from "next/link";
import Band from "../../components/Band";
import { BarChart } from "../../components/Charts";
import PageHero from "../../components/PageHero";
import { claim } from "@/lib/data";
import { CONTACT_EMAIL } from "@/lib/nav";
import GateStatuses from "../GateStatuses";

export const metadata: Metadata = {
  title: "For research organisations",
  description: "How an institution can use the exported GSOP files as a candidate pre-filter, how to read PASS, FAIL and NOT TESTED, and how to get in touch about collaboration.",
};

const link = "underline underline-offset-4";
const code = "gsop-mono bg-surface px-1";
const n = (id: string) => parseFloat(claim(id));

const MARS_POSITIVES = [
  { label: "Haughton", id: "v2.result.g2b.haughton" },
  { label: "Mars Desert Research Station", id: "v2.result.g2b.mdrs_utah" },
  { label: "Atacama salars", id: "v2.result.g2b.atacama_salars" },
  { label: "Ladakh (Puga)", id: "v2.result.g2b.ladakh_puga" },
];

export default function Page() {
  return (
    <>
      <PageHero title="For research organisations" lede="GSOP can shorten a long list of Earth places before a team spends field time. It cannot do the team's own review." />

      <Band tone="grid" labelledBy="bulk">
        <h2 id="bulk" className="mb-5 text-2xl">
          Using the files in bulk
        </h2>
        <ul className="max-w-3xl list-disc space-y-3 pl-6">
          <li>
            Everything under <code className={code}>/data</code> is a static file with no sign-in. The{" "}
            <Link href="/docs/data-access" className={link}>
              data access page
            </Link>{" "}
            lists each file with its size and schema.
          </li>
          <li>
            <code className={code}>tiles_top.json</code> and <code className={code}>regions.json</code> hold the flagged tiles and regions. <code className={code}>sites.json</code> and <code className={code}>site_lookup.json</code> hold the reference sites and the stored score at each.
          </li>
          <li>
            <code className={code}>v2.json</code> holds the gate statuses and the thermal reference rows, and <code className={code}>claims.csv</code> ties every printed number to its source file and hash.
          </li>
          <li>Files are rebuilt at deploy time. Pin the commit you downloaded from and keep the hashes.</li>
        </ul>
      </Band>

      <section aria-labelledby="workflow" className="max-w-3xl space-y-3">
        <h2 id="workflow" className="text-2xl">
          A workflow that fits
        </h2>
        <ol className="list-decimal space-y-3 pl-6">
          <li>
            Read the gate statuses in <code className={code}>v2.json</code> first and copy them into your own notes.
          </li>
          <li>Use flagged regions as a pre-filter only. They are candidates not in our reference list, and they are unreviewed.</li>
          <li>Drop any region outside the thermal coverage, since it has no v2 score. Coverage is {claim("v2.result.coverage_pct")}% of land tiles in the band.</li>
          <li>Review what is left with your own local data: terrain, access, permits and field measurements.</li>
          <li>Write down the outcome. A candidate that fails your review is a normal result.</li>
        </ol>
        <p className="text-secondary-foreground">A high score is never confirmation. The ranking has not been checked against independent data.</p>
      </section>

      <Band tone="accent" labelledBy="read">
        <h2 id="read" className="mb-5 text-2xl">
          Reading PASS, FAIL and NOT TESTED
        </h2>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <GateStatuses />
            <ul className="list-disc space-y-2 pl-6">
              <li>PASS means the pre-registered check was met. G2(c) only checks that our engine reproduces v1 numbers, so it says nothing about the analogy.</li>
              <li>FAIL means the check ran and was not met. Treat the claim it covers as unsupported.</li>
              <li>NOT TESTED means the check could not run, here because the coverage gate failed first. It is not a pass and not a fail.</li>
            </ul>
          </div>
          <BarChart
            title="Mars positives against the G2(b) mark"
            caption={`Mars is a low-confidence secondary result, and only ${claim("v2.result.g2b.n_scorable")} Mars analog sites could be scored.`}
            rows={MARS_POSITIVES.map((m) => ({ label: m.label, value: n(m.id), display: claim(m.id), tone: "mars" as const }))}
            reference={{ value: n("v2.result.g2b.percentile"), label: `the ${claim("v2.result.g2b.percentile")}th percentile the pre-registration asked for` }}
          />
        </div>
      </Band>

      <section aria-labelledby="contact" className="max-w-3xl space-y-3">
        <h2 id="contact" className="text-2xl">
          Working with us
        </h2>
        <p>
          We want field measurements with provenance from analog sites, India above all, and we want critique of the method. Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
            {CONTACT_EMAIL}
          </a>{" "}
          or see the{" "}
          <Link href="/contact" className={link}>
            contact page
          </Link>
          .
        </p>
      </section>
    </>
  );
}
