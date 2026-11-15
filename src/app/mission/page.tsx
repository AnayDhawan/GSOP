import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import { DumbbellChart, Meter } from "../components/Charts";
import PageHero from "../components/PageHero";
import PagePhoto from "../components/PagePhoto";
import { claim } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mission",
  description: "Why GSOP exists: a transparent, reproducible screening method for Earth places that resemble Moon and Mars targets, with an India focus and its failures published.",
};

const link = "underline underline-offset-4";
const n = (id: string) => parseFloat(claim(id));

const BODIES = [
  { key: "moon", alt: "The Moon" },
  { key: "earth", alt: "The Earth" },
  { key: "mars", alt: "Mars" },
];

const PRACTICE = [
  {
    term: "Pass marks written first",
    body: "We wrote the pass marks down before the second run started. Each result is printed with its literal status, PASS, FAIL or NOT TESTED, and the failures sit right next to the one pass.",
  },
  {
    term: "One command builds the data",
    body: "Run one command and every data file is rebuilt from stored results. Each number on the site has a row in a claims file that names its source file and hash. A number with no row stops the build.",
  },
  {
    term: "India first",
    body: "Most analog work leans on a few famous sites. We list the Indian ones beside the rest and ask for ground measurements, because a layer averaged over a whole tile cannot say what a logger at Puga would.",
  },
  {
    term: "Candidates stay unreviewed",
    body: "Regions the method flags are candidates not in our reference list. Nobody has reviewed them yet, and the site says so wherever they appear.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        title="Mission"
        lede="People who plan Moon and Mars missions need somewhere on Earth to try their rovers, drills and habitats first. GSOP ranks Earth land tiles by how closely they resemble a lunar or Martian target, so a team can decide where to look first."
      />

      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-2xl">A starting list</h2>
          <p className="text-secondary-foreground">
            The ranking uses terrain and, in the second run, surface temperature. It says nothing about gravity, dust, radiation or air. A person still has to go and look, and this site is built to make that first look cheaper.
          </p>
          <p className="text-secondary-foreground">Mars is a low-confidence secondary result. The ranking has not been checked against independent data.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          {BODIES.map((b) => (
            <PagePhoto key={b.key} src={`/img/bodies/${b.key}.jpg`} alt={b.alt} width={600} height={600} className="w-1/3 [&_img]:rounded-full [&_img]:border-0" />
          ))}
        </div>
      </div>

      <Band tone="grid" labelledBy="practice">
        <h2 id="practice" className="mb-8 text-2xl">
          How we work
        </h2>
        <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {PRACTICE.map((p) => (
            <div key={p.term} className="border-t-2 border-foreground pt-3">
              <dt className="font-display text-xl">{p.term}</dt>
              <dd className="mt-2 text-secondary-foreground">{p.body}</dd>
            </div>
          ))}
        </dl>
      </Band>

      <Band tone="accent" labelledBy="result">
        <h2 id="result" className="mb-2 text-2xl">
          The one thing that improved
        </h2>
        <p className="mb-8 max-w-2xl text-secondary-foreground">
          Adding an Earth thermal layer lowered the own-tile percentile of the Namib sand sea, a Moon negative control, from {claim("v2.result.own.namib.before")} to {claim("v2.result.own.namib.after")}. Lower is better for a control. The{" "}
          <Link href="/gates" className={link}>
            gates page
          </Link>{" "}
          lists the caveats.
        </p>
        <div className="grid gap-10 md:grid-cols-2">
          <DumbbellChart
            title="Own-tile percentile of two Moon controls"
            fromLabel="terrain only"
            toLabel="with the thermal layer"
            rows={[
              { label: "Namib sand sea", from: n("v2.result.own.namib.before"), to: n("v2.result.own.namib.after"), fromDisplay: claim("v2.result.own.namib.before"), toDisplay: claim("v2.result.own.namib.after") },
              { label: "Rub' al Khali", from: n("v2.result.own.rak.before"), to: n("v2.result.own.rak.after"), fromDisplay: claim("v2.result.own.rak.before"), toDisplay: claim("v2.result.own.rak.after") },
            ]}
          />
          <Meter
            title="Thermal coverage of land tiles in its band"
            caption="Gate G1 asked for more than the layer delivered, and it failed."
            value={n("v2.result.coverage_pct")}
            display={`${claim("v2.result.coverage_pct")}%`}
            required={n("v2.result.g1.required_pct")}
            requiredDisplay={`${claim("v2.result.g1.required_pct")}%`}
            tone="mars"
          />
        </div>
      </Band>

      <Band tone="raised" labelledBy="next">
        <h2 id="next" className="mb-3 text-2xl">
          Where to go from here
        </h2>
        <p className="mb-5 max-w-2xl text-secondary-foreground">
          The{" "}
          <Link href="/method" className={link}>
            methodology
          </Link>{" "}
          and the{" "}
          <Link href="/ledger" className={link}>
            failure-first ledger
          </Link>{" "}
          give the limits in full.
        </p>
        <p className="flex flex-wrap gap-x-8 gap-y-2 font-display text-lg">
          <Link href="/dashboard" className={link}>
            Open the dashboard
          </Link>
          <Link href="/contribute" className={link}>
            Contribute
          </Link>
        </p>
      </Band>
    </>
  );
}
