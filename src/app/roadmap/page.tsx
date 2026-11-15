import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import PageHero from "../components/PageHero";
import { v2File } from "@/lib/data";
import type { GateStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "After the hackathon",
  description: "The plan after the hackathon: build the simulation properly, run it for a month, check it against ground data, and what each outcome would lead to.",
};

const link = "underline underline-offset-4";
const ul = "list-disc space-y-2 pl-6";
const h2 = "text-3xl";
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven"];
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

const GATES: { key: "G1" | "G2" | "G2c" | "G3" | "D1" | "D2" | "moon_recall"; name: string; what: string }[] = [
  { key: "G1", name: "G1", what: "Thermal coverage" },
  { key: "G2", name: "G2", what: "Scoring: controls and Mars positives" },
  { key: "G2c", name: "G2(c)", what: "Engine reproduces v1" },
  { key: "G3", name: "G3", what: "Supported regions" },
  { key: "D1", name: "D1", what: "Fitted model, Moon" },
  { key: "D2", name: "D2", what: "Fitted model, Mars" },
  { key: "moon_recall", name: "Moon recall", what: "Moon positives found" },
];

const TONE: Record<GateStatus, string> = { FAIL: "text-control", PASS: "text-positive", "NOT TESTED": "text-secondary-foreground" };

const FIXES = [
  { problem: "Thermal coverage is below what the plan required", fix: "A looser quality rule, plus a second land surface temperature product to fill the gaps. Rerun the coverage gate." },
  { problem: "One scoring weight did nothing", fix: "Drop the lunar lighting term, which no Earth tile matches. Use terms Earth can match." },
  { problem: "The v1 site statistic sits near chance", fix: "Make the own-tile percentile the headline statistic, and report the chance level beside it." },
  { problem: "Very few Mars positives", fix: "Add Mars targets and analog sites. Say so plainly if there are still too few to test." },
  { problem: "Negatives are clustered and chosen by a vegetation proxy", fix: "Sample negatives across land-cover classes, spread over the globe." },
  { problem: "Trait tolerances are wide", fix: "Set each tolerance from local windows, not from one large window." },
];

const PHASES = [
  {
    step: "Weeks one and two",
    title: "Build it properly",
    items: [
      "One open package, one config file, typed inputs, a test suite",
      "Every step cached and hashed, so a rerun gives the same bytes",
      "Runs on a laptop for a sample and on a rented machine for the full globe",
      "The fixes from the list above, each with a test that would have caught the problem",
      "Pass marks for the next run written down and hashed before anything is computed",
    ],
  },
  {
    step: "Weeks three to six",
    title: "One month of simulation",
    items: [
      "Full Monte Carlo over every land tile, every target and every profile",
      "More Moon and Mars targets, not only three",
      "Drop each layer in turn, vary the weights, vary the tile size: how much does the answer move?",
      "A fresh negative set, and held-out sites the model never saw",
      "The fitted-model tests (D1 and D2) that coverage blocked this time",
    ],
  },
  {
    step: "After the run",
    title: "Check it against the ground",
    items: [
      "Field data from India first: Ladakh (Puga and Tso Kar), Kutch and Lonar",
      "Loggers with a date, a place and an instrument, from people on site",
      "Score the pre-registered gates, and publish every result, failures first",
      "Send the shortlist to people who can visit the places, as an offer",
    ],
  },
];

const OUTCOMES = [
  { when: "The gates pass", then: ["A ranked shortlist, checked on the ground", "Open dataset and a write-up with the full method", "Lists offered to groups planning field campaigns"] },
  { when: "Some gates pass", then: ["Say which layers carry a signal", "Narrow the claim to those layers", "Fix the rest and rerun"] },
  { when: "The gates fail again", then: ["Publish the negative result and what it rules out", "Stop claiming a ranking", "Keep the tooling and the data open for others"] },
];

const RULES = [
  "Pass marks are written and hashed before a run, never after",
  "Every number on the site has a row in a claims file",
  "Statuses stay literal: PASS, FAIL or NOT TESTED",
  "The ranking is a screening aid until the ground says otherwise",
  "Code and data stay open",
];

export default function Page() {
  const gates = v2File().results?.gate_statuses;
  const status = (k: (typeof GATES)[number]["key"]): GateStatus => (gates?.[k] as GateStatus | undefined) ?? "NOT TESTED";
  const count = (want: GateStatus) => GATES.filter((g) => status(g.key) === want).length;

  return (
    <>
      <PageHero title="After the hackathon" lede="A plan to find out whether the idea works: build the simulation properly, run it for a month, then check it against ground data." />

      <div className="grid items-start gap-10 md:grid-cols-2">
        <section className="space-y-4" aria-labelledby="stand">
          <h2 id="stand" className={h2}>
            Where we stand
          </h2>
          <ul className={ul}>
            <li>The hackathon build is a prototype, written fast from scripts.</li>
            <li>
              {cap(WORDS[count("FAIL")])} gates failed, {WORDS[count("PASS")]} passed and {WORDS[count("NOT TESTED")]} could not be tested.
            </li>
            <li>The one pass only checks that the engine reproduces v1.</li>
            <li>So today GSOP is a screening aid, not a result.</li>
          </ul>
          <p className="text-sm text-secondary-foreground">
            The reasons, one by one, are on the{" "}
            <Link href="/gates" className={link}>
              gates page
            </Link>
            .
          </p>
        </section>
        <ul className="border border-border bg-surface" aria-label="Gate results">
          {GATES.map((g) => (
            <li key={g.key} className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-3 last:border-b-0">
              <span>
                <span className="font-display text-lg">{g.name}</span>
                <span className="ml-3 text-sm text-secondary-foreground">{g.what}</span>
              </span>
              <span className={`font-mono text-sm font-semibold uppercase tracking-wider ${TONE[status(g.key)]}`}>{status(g.key)}</span>
            </li>
          ))}
        </ul>
      </div>

      <Band tone="raised" labelledBy="fixes">
        <div className="space-y-6">
          <h2 id="fixes" className={h2}>
            What the new build fixes
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {FIXES.map((f) => (
              <li key={f.problem} className="space-y-2 border border-border bg-background p-5">
                <p className="font-display text-lg">{f.problem}</p>
                <p className="text-sm text-secondary-foreground">{f.fix}</p>
              </li>
            ))}
          </ul>
        </div>
      </Band>

      <section className="space-y-6" aria-labelledby="plan">
        <h2 id="plan" className={h2}>
          The plan
        </h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {PHASES.map((p, i) => (
            <li key={p.title} className="flex flex-col gap-3 border border-border bg-surface p-5">
              <p className="gsop-label">
                <span className="mr-2 text-foreground">0{i + 1}</span>
                {p.step}
              </p>
              <h3 className="text-xl">{p.title}</h3>
              <ul className={`${ul} text-sm text-secondary-foreground`}>
                {p.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">Dates are targets, not promises. Nothing here is funded or agreed with an agency.</p>
      </section>

      <Band tone="grid" labelledBy="lead">
        <div className="space-y-6">
          <h2 id="lead" className={h2}>
            Where the results lead
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {OUTCOMES.map((o) => (
              <li key={o.when} className="space-y-3 border border-border bg-background p-5">
                <p className="gsop-label">If</p>
                <h3 className="text-xl">{o.when}</h3>
                <ul className={`${ul} text-sm text-secondary-foreground`}>
                  {o.then.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="max-w-3xl text-secondary-foreground">The pre-registered gates decide which row we are in. We do not.</p>
        </div>
      </Band>

      <div className="grid items-start gap-10 md:grid-cols-2">
        <section className="space-y-4" aria-labelledby="rules">
          <h2 id="rules" className={h2}>
            Ground rules for the next build
          </h2>
          <ul className={ul}>
            {RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
        <section className="space-y-4" aria-labelledby="help">
          <h2 id="help" className={h2}>
            Help us check it
          </h2>
          <ul className={ul}>
            <li>
              Send ground measurements from an analog site:{" "}
              <Link href="/contribute" className={link}>
                what we accept
              </Link>
            </li>
            <li>
              Tell us where the plan is wrong:{" "}
              <Link href="/contact" className={link}>
                contact
              </Link>
            </li>
            <li>
              Read what failed first:{" "}
              <Link href="/ledger" className={link}>
                Failure-First Ledger
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
