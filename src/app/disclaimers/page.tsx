import type { Metadata } from "next";
import Link from "next/link";
import { claim, e32Sentence, v2File } from "@/lib/data";

export const metadata: Metadata = {
  title: "Disclaimers",
  description: "What GSOP is and is not: a research prototype, not affiliated with NASA, with a ranking that has not been checked against independent data.",
};

const link = "underline underline-offset-4";

export default function Page() {
  const g = v2File().results?.gate_statuses;
  return (
    <article className="max-w-3xl space-y-8">
      <h1 className="text-3xl">Disclaimers</h1>

      <section className="space-y-3" aria-labelledby="status">
        <h2 id="status" className="text-xl">
          What this is
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>GSOP is a research prototype, built independently for the NASA Space Apps Challenge 2026.</li>
          <li>It is not affiliated with or endorsed by NASA or any government body. It is not an official tool and no decision should rest on it alone.</li>
          <li>It is a screening method with a published self-audit. It ranks places for a person to look at; it does not tell you a place is a good analog.</li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="results">
        <h2 id="results" className="text-xl">
          What the results can and cannot tell you
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>The ranking has not been checked against independent data.</li>
          <li>
            The pre-registered gates are published as stored. G1 {g?.G1 ?? "not available"}, G2 {g?.G2 ?? "not available"}, G2(c) {g?.G2c ?? "not available"}, G3 {g?.G3 ?? "not available"}. D1 {g?.D1 ?? "not available"}, D2 {g?.D2 ?? "not available"}. Details are on the{" "}
            <Link href="/gates" className={link}>
              gates page
            </Link>
            .
          </li>
          <li>
            Mars is a low-confidence secondary result. Only {claim("v2.result.g2b.n_scorable")} Mars analog sites could be scored, and Mars recall was {claim("v2.result.d.recall_value")}.
          </li>
          <li>
            The Earth thermal layer covers {claim("v2.result.coverage_pct")}% of land tiles in its band. Places in the excluded regions have no v2 score. See{" "}
            <Link href="/data-sources" className={link}>
              data sources
            </Link>
            .
          </li>
          <li>Tiles and regions flagged by the method are candidates not in our reference list. They are unreviewed.</li>
          <li>The land surface temperature used for Earth is skin temperature seen by a satellite, not the air temperature a person feels.</li>
          <li>Site descriptions are teammate-written and unreviewed. Check the cited source before relying on a row.</li>
        </ul>
        <blockquote className="border-l-2 border-border pl-4">{e32Sentence()}</blockquote>
      </section>

      <section className="space-y-3" aria-labelledby="third">
        <h2 id="third" className="text-xl">
          Third-party data
        </h2>
        <p>
          The data behind the scores belongs to its providers and keeps their licences. Credit and links are on the{" "}
          <Link href="/data-sources" className={link}>
            data sources page
          </Link>
          . The code and the data build are covered by the{" "}
          <Link href="/license" className={link}>
            licence
          </Link>
          , which includes its own warranty disclaimer.
        </p>
      </section>
    </article>
  );
}
