import type { Metadata } from "next";
import Link from "next/link";
import { claim } from "@/lib/data";
import GateStatuses from "../GateStatuses";

export const metadata: Metadata = {
  title: "For research organizations",
  description: "How an institution can use the exported GSOP files as a candidate pre-filter, how to read PASS, FAIL and NOT TESTED, and how to get in touch about collaboration.",
};

const link = "underline underline-offset-4";
const code = "gsop-mono bg-surface px-1";

export default function Page() {
  return (
    <article className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl">For research organizations</h1>
        <p className="text-lg text-secondary-foreground">GSOP can narrow a long list of Earth places before a team spends field time. It cannot replace the team&apos;s own review.</p>
      </header>

      <section className="space-y-3" aria-labelledby="bulk">
        <h2 id="bulk" className="text-2xl">
          Bulk use of the exported files
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Everything under <code className={code}>/data</code> is a static file with no sign-in. The{" "}
            <Link href="/docs/data-access" className={link}>
              data access page
            </Link>{" "}
            lists each file, its size and its schema.
          </li>
          <li>
            <code className={code}>tiles_top.json</code> and <code className={code}>regions.json</code> hold the flagged tiles and regions. <code className={code}>sites.json</code> and <code className={code}>site_lookup.json</code> hold the reference sites and the stored score at each.
          </li>
          <li>
            <code className={code}>v2.json</code> holds the gate statuses and the thermal reference rows. <code className={code}>claims.csv</code> maps every printed number to its source file and hash.
          </li>
          <li>Files are rebuilt at deploy time. Pin the commit you downloaded from and keep the hashes.</li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="workflow">
        <h2 id="workflow" className="text-2xl">
          Suggested screening workflow
        </h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Read the gate statuses in <code className={code}>v2.json</code> first, and carry them into your own notes.</li>
          <li>Take flagged regions as a pre-filter only. They are candidates not in our reference list, and they are unreviewed.</li>
          <li>Drop any region outside the thermal coverage: it has no v2 score. Coverage is {claim("v2.result.coverage_pct")}% of land tiles in the band.</li>
          <li>Review each remaining candidate with your own local data: terrain, access, permits, and field measurements.</li>
          <li>Record the outcome. A candidate that fails your review is a normal result.</li>
        </ol>
        <p>Never treat a high score as confirmation. The ranking has not been checked against independent data.</p>
      </section>

      <section className="space-y-3" aria-labelledby="read">
        <h2 id="read" className="text-2xl">
          Reading PASS, FAIL and NOT TESTED
        </h2>
        <GateStatuses />
        <ul className="list-disc space-y-2 pl-6">
          <li>PASS: the pre-registered check was met. G2(c) checks that our engine reproduces v1 numbers; it says nothing about whether the analogy holds.</li>
          <li>FAIL: the check was run and not met. We publish it, and you should weigh the claim it covers as unsupported.</li>
          <li>NOT TESTED: the check could not be run, here because the coverage gate failed first. It is not a pass and not a fail.</li>
          <li>Mars is a low-confidence secondary result. Only {claim("v2.result.g2b.n_scorable")} Mars analog sites could be scored.</li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="contact">
        <h2 id="contact" className="text-2xl">
          Collaboration
        </h2>
        <p>
          We want field measurements with provenance from analog sites, in India especially, and critique of the method. Write to{" "}
          <a href="mailto:dhawansanay@gmail.com" className={link}>
            dhawansanay@gmail.com
          </a>{" "}
          or see the{" "}
          <Link href="/contact" className={link}>
            contact page
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
