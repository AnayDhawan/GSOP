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
    term: "Candidates are leads",
    body: "Regions the method flags are candidates not in our reference list. They are a reason to look, not a finding, and the site says so wherever they appear.",
  },
];

// What a Moon and Mars analog finder should do, what GSOP does about it today, and what is still missing.
// Plain words only: any number on this page would need a claims row.
const FIT = [
  {
    goal: "Find places that resemble a Moon or Mars target",
    does: "Ranks Earth land tiles against Moon and Mars targets, and stores a percentile for every listed site.",
    gap: "The pre-registered checks failed, and the ranking has not been checked against independent data. It is a screening aid, not a finding.",
  },
  {
    goal: "Describe a place well enough to compare it",
    does: "Each site has a photo, a short profile, facts, and open Earth data summarised around its coordinates.",
    gap: "Profiles are short and point to their sources. There are no full case studies yet.",
  },
  {
    goal: "Cover more than terrain",
    does: "Terrain and, in the second run, surface temperature. Water and ice appear in profiles as notes.",
    gap: "Nothing on biology, caves and lava tubes, dust or wind, and no Earth place has lunar gravity, vacuum or radiation.",
  },
  {
    goal: "Use data from space agencies",
    does: "Open data from NASA, USGS and ESA, with Natural Earth for place names.",
    gap: "Data from other space agencies is not used yet. The Moon is compared mostly on terrain.",
  },
  {
    goal: "Make it open and repeatable",
    does: "Code and data files are public, every number has a claims row, and pass marks were written before the run.",
    gap: "A full rebuild needs the v1 results archive, which is not in the repository.",
  },
  {
    goal: "Put India first",
    does: "Indian sites sit in the list and have their own dashboard view. We ask for ground measurements.",
    gap: "We hold no ground measurements from India yet.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        title="Mission"
        lede="People who plan Moon and Mars missions need somewhere on Earth to try their rovers, drills and habitats first. GSOP ranks Earth land tiles by how closely they resemble a lunar or Martian target, so a team can decide where to look first."
      />

      <h2 className="text-2xl">A starting list</h2>
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
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

      <section className="space-y-6" aria-labelledby="fit">
        <div className="space-y-2">
          <h2 id="fit" className="text-2xl">
            How far GSOP gets
          </h2>
          <p className="mx-auto max-w-2xl text-secondary-foreground">Measured against what a Moon and Mars analog finder should do. The gaps are listed on purpose.</p>
        </div>
        <ul data-left className="grid gap-4 md:grid-cols-2">
          {FIT.map((f) => (
            <li key={f.goal} className="space-y-3 border border-border bg-surface p-5">
              <h3 className="font-display text-lg">{f.goal}</h3>
              <p className="text-sm text-secondary-foreground">
                <span className="gsop-label mr-2 text-foreground">Does</span>
                {f.does}
              </p>
              <p className="text-sm text-secondary-foreground">
                <span className="gsop-label mr-2 text-foreground">Gap</span>
                {f.gap}
              </p>
            </li>
          ))}
        </ul>
      </section>

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
