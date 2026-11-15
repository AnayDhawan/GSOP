import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import { Meter } from "../components/Charts";
import PageHero from "../components/PageHero";
import { claim, e32Sentence, v2File } from "@/lib/data";

export const metadata: Metadata = {
  title: "Disclaimers",
  description: "What GSOP is and is not: a research prototype, not affiliated with NASA, with a ranking that has not been checked against independent data.",
};

const link = "underline underline-offset-4";

export default function Page() {
  const g = v2File().results?.gate_statuses;
  const na = "not available";
  return (
    <>
      <PageHero title="Disclaimers" lede="What GSOP is, what it is not, and how much weight its results can carry." />

      <Band tone="accent" labelledBy="status">
        <h2 id="status" className="mb-4 text-2xl">
          What this is
        </h2>
        <p className="max-w-3xl font-display text-xl leading-snug">
          GSOP is a research prototype, built independently for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA or any government body.
        </p>
        <p className="mt-4 max-w-3xl text-secondary-foreground">
          It is not an official tool, and no decision should rest on it alone. It is a screening method with a published self-audit. It ranks places for a person to look at, and it does not tell you a place is a good analog.
        </p>
      </Band>

      <h2 id="results" className="text-2xl">
        What the results can and cannot tell you
      </h2>
      <div className="grid gap-10 md:grid-cols-2">
        <section aria-labelledby="results" className="space-y-4">
          <p>The ranking has not been checked against independent data.</p>
          <p className="text-secondary-foreground">
            The gates were set before the second run and are published as stored: G1 {g?.G1 ?? na}, G2 {g?.G2 ?? na}, G2(c) {g?.G2c ?? na}, G3 {g?.G3 ?? na}. D1 {g?.D1 ?? na}, D2 {g?.D2 ?? na}. Details are on the{" "}
            <Link href="/gates" className={link}>
              gates page
            </Link>
            .
          </p>
          <p className="text-secondary-foreground">
            Mars is a low-confidence secondary result. Only {claim("v2.result.g2b.n_scorable")} Mars analog sites could be scored, and Mars recall was {claim("v2.result.d.recall_value")}.
          </p>
        </section>
        <Meter
          title="Earth thermal layer coverage"
          caption={
            <>
              Places in the excluded regions have no v2 score. See{" "}
              <Link href="/data-sources" className={link}>
                data sources
              </Link>
              .
            </>
          }
          value={parseFloat(claim("v2.result.coverage_pct"))}
          display={`${claim("v2.result.coverage_pct")}%`}
          required={parseFloat(claim("v2.result.g1.required_pct"))}
          requiredDisplay={`${claim("v2.result.g1.required_pct")}%`}
          tone="mars"
        />
      </div>

      <Band tone="grid" labelledBy="limits">
        <h2 id="limits" className="mb-6 text-2xl">
          Things to keep in mind
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          <li className="border border-border bg-background p-4">Tiles and regions the method flags are candidates not in our reference list. They are a reason to look, not a finding.</li>
          <li className="border border-border bg-background p-4">The land surface temperature used for Earth is the skin temperature a satellite sees, not the air temperature a person feels.</li>
          <li className="border border-border bg-background p-4">Site descriptions are teammate-written. Check the cited source before you rely on a row.</li>
        </ul>
        <blockquote className="mt-8 max-w-3xl border-l-2 border-foreground pl-4">{e32Sentence()}</blockquote>
      </Band>

      <section aria-labelledby="third" className="max-w-3xl space-y-3">
        <h2 id="third" className="text-2xl">
          Third-party data
        </h2>
        <p className="text-secondary-foreground">
          The data behind the scores belongs to its providers and keeps their licences. Credit and links are on the{" "}
          <Link href="/data-sources" className={link}>
            data sources page
          </Link>
          . The code and the data build are covered by the{" "}
          <Link href="/license" className={link}>
            licence
          </Link>
          , which carries its own warranty disclaimer.
        </p>
      </section>
    </>
  );
}
