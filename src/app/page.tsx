import Link from "next/link";
import { ArrowRight, Grid3x3, Layers, ShieldCheck } from "lucide-react";
import HeroScene from "./components/HeroScene";
import { claim, e32Sentence, headline, lookupFile, regionsFile, sitesFile, v2File } from "@/lib/data";
import { group, statusLabel } from "@/lib/format";
import { RESULTS } from "@/lib/nav";
import type { GateStatus } from "@/lib/types";

const link = "underline underline-offset-4 hover:text-foreground";
const container = "mx-auto w-full max-w-6xl px-6";

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="space-y-1 px-6 py-8 first:pl-0 lg:py-10">
      <p className="font-display text-4xl tabular-nums tracking-tight md:text-5xl">{value}</p>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-secondary-foreground">{note}</p>
    </div>
  );
}

function Step({ icon: Icon, title, children }: { icon: typeof Grid3x3; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-border text-earth" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div className="space-y-1">
        <h3 className="text-lg">{title}</h3>
        <p className="text-secondary-foreground">{children}</p>
      </div>
    </li>
  );
}

const GATE_TONE: Record<GateStatus, { box: string; dot: string }> = {
  FAIL: { box: "border-control", dot: "bg-control" },
  PASS: { box: "border-positive", dot: "bg-positive" },
  "NOT TESTED": { box: "border-dashed border-border", dot: "border border-dashed border-muted-foreground" },
};

function Gate({ name, status, children }: { name: string; status: GateStatus | undefined; children: React.ReactNode }) {
  const s: GateStatus = status ?? "NOT TESTED";
  return (
    <li className={`flex flex-col gap-2 border p-4 ${GATE_TONE[s].box}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-lg">{name}</span>
        <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          <span aria-hidden className={`h-2.5 w-2.5 ${GATE_TONE[s].dot}`} />
          {s}
        </span>
      </div>
      <p className="text-sm text-secondary-foreground">{children}</p>
    </li>
  );
}

export default function Home() {
  const gates = v2File().results?.gate_statuses;
  const c = claim;
  const sites = sitesFile().sites;
  const india = sites.filter((s) => s.list === "known" && (s.country ?? "").startsWith("India"));
  const lookup = lookupFile();
  const regions = regionsFile().regions.filter((r) => r.n_tiles_in_india > 0);
  const baseView = (body: string) => (body === "Moon" ? "shackleton_rim__base" : "jezero__base");

  return (
    <>
      {/* Hero: one headline, one subline, then the scene. */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-border">
        <div className={`${container} pt-12 md:pt-20`}>
          <h1 id="hero-title" className="max-w-4xl text-4xl leading-[1.08] md:text-6xl">
            {headline().headline}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-secondary-foreground md:text-xl">
            {group(c("metrics.earth.land_tiles"))} land tiles on an equal-area grid, {c("landing.n_sites")} reference sites and candidates, and {c("landing.n_thermal_values")} thermal reference values from {c("landing.n_sources")} open data sources.
          </p>
        </div>
        <div className="mx-auto w-full max-w-6xl px-2 pb-6 pt-6 md:px-6 md:pb-10">
          <HeroScene />
        </div>
      </section>

      {/* 1. Stats band */}
      <section aria-label="Data at a glance" className="border-b border-border">
        <div className={container}>
          <div className="grid grid-cols-2 divide-border max-lg:[&>*:nth-child(odd)]:pl-0 max-lg:[&>*:nth-child(n+3)]:border-t max-lg:[&>*]:border-border lg:grid-cols-4 lg:divide-x">
            <Stat value={group(c("metrics.earth.land_tiles"))} label="Land tiles" note={`Equal-area tiles of ${c("landing.tile_km")} km. ${group(c("metrics.view.shackleton_rim__base.n_gated_tiles"))} pass the v1 gates for the Moon base profile.`} />
            <Stat value={c("landing.n_sites")} label="Sites evaluated" note={`${c("landing.n_known")} in our reference list and ${c("landing.n_candidates")} candidates not in our reference list.`} />
            <Stat value={c("landing.n_thermal_values")} label="Thermal reference values" note={`Statistics at ${c("landing.n_thermal_sites")} Moon and Mars targets, from LRO Diviner and MGS TES.`} />
            <Stat value={c("landing.n_sources")} label="Data sources" note="Open datasets, each listed with its caveats." />
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section aria-labelledby="how" className="py-16">
        <div className={`${container} space-y-8`}>
          <h2 id="how" className="text-3xl">
            How it works
          </h2>
          <ul className="grid gap-8 md:grid-cols-3">
            <Step icon={Grid3x3} title="Equal-area tiling">
              Earth&apos;s land is cut into equal-area tiles, {c("landing.tile_km")} km on a side (EPSG:{c("landing.epsg")}), so every tile counts the same.
            </Step>
            <Step icon={Layers} title="Multi-layer similarity">
              Each tile is compared with Moon and Mars reference targets on terrain and thermal layers, ranked by percentile inside each body&apos;s own set.
            </Step>
            <Step icon={ShieldCheck} title="Pre-registered gates, published self-audit">
              Thresholds were written down before the run. Every result is published, failures included.
            </Step>
          </ul>
        </div>
      </section>

      {/* 3. Transparency strip: the gate results as printed on /gates. */}
      <section aria-labelledby="transparency" className="border-y border-border bg-surface py-16">
        <div className={`${container} space-y-8`}>
          <div className="max-w-3xl space-y-3">
            <h2 id="transparency" className="text-3xl">
              Gate results, as reported
            </h2>
            <p className="text-lg">We pre-registered our thresholds and publish every result, including failures.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Gate name="G1" status={gates?.G1}>
              Coverage {c("v2.result.coverage_pct")}% vs {c("v2.result.g1.required_pct")}% required.
            </Gate>
            <Gate name="G2" status={gates?.G2}>
              Moon controls scored {c("v2.result.g2a.namib")} and {c("v2.result.g2a.rak")}, above the {c("v2.result.g2a.max")} maximum. {c("v2.result.g2b.n_at_or_above")} of {c("v2.result.g2b.n_scorable")} scorable Mars positives reached the top group.
            </Gate>
            <Gate name="G2(c)" status={gates?.G2c}>
              The terrain-only baseline reproduces v1 ({c("v2.result.g2c.namib")} / {c("v2.result.g2c.rub")} / {c("v2.result.g2c.mars_median")}). It checks the engine, not the analogy.
            </Gate>
            <Gate name="G3" status={gates?.G3}>
              {c("v2.result.g3.total")} supported regions, both at the Shackleton rim.
            </Gate>
            <Gate name="D1" status={gates?.D1}>
              Blocked by the coverage gate.
            </Gate>
            <Gate name="D2" status={gates?.D2}>
              Blocked by the coverage gate.
            </Gate>
            <Gate name="Moon recall" status={gates?.moon_recall}>
              Two Moon positives, one of them not scorable.
            </Gate>
          </ul>
          <div className="max-w-3xl space-y-4">
            <blockquote className="border-l-2 border-border pl-4">{e32Sentence()}</blockquote>
            <p className="flex flex-wrap gap-x-6 gap-y-2 font-display text-lg">
              <Link href="/gates" className={link}>
                Read every gate result
              </Link>
              <Link href="/ledger" className={link}>
                Failure-First Ledger
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Local impact: India */}
      <section aria-labelledby="local" className="py-16">
        <div className={`${container} grid gap-12 lg:grid-cols-2`}>
          <div className="space-y-4">
            <h2 id="local" className="text-3xl">
              Local ground data, starting with India
            </h2>
            <p className="text-secondary-foreground">
              A satellite layer averages a large area. The thermal layer here is built from {c("landing.src.modis_lst.res.n0")} km land surface temperature averaged to {c("landing.tile_km")} km tiles, so a place like Puga in Ladakh (about {group(c("sites.ladakh-tso-kar-and-puga-mars.elevation_m"))} m above sea level) is scored from a coarse view of a cold desert. A logger on the ground
              would show whether that view holds.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                {c("landing.n_india_known")} India entries are in our reference list, and {regions.length === 1 ? "one" : "some"} of the {c("regions.count")} candidate regions overlap the India outline
                {regions.length ? `: ${regions.map((r) => `${r.id} (${c(`regions.${r.id.replace(" ", "_")}.n_tiles_in_india`)} tiles)`).join(", ")}` : ""}. Regions are unreviewed candidates.
              </li>
              <li>
                Ladakh (Puga) scored {c("v2.result.g2b.ladakh_puga")} in the Mars thermal run, the lowest of the {c("v2.result.g2b.n_scorable")} scorable Mars positives. Field data is how we would find out why.
              </li>
              <li>
                Measurements with provenance, site notes and source corrections all help.{" "}
                <Link href="/contribute" className={link}>
                  See what we accept
                </Link>
                .
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl">India entries in the reference list</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Reference sites in India with the stored v1 result</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 pr-4 font-medium">Site</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Listed for</th>
                    <th scope="col" className="py-2 font-medium">v1 result</th>
                  </tr>
                </thead>
                <tbody>
                  {india.map((s) => {
                    const view = baseView(s.body);
                    const e = lookup.sites[s.id]?.[view];
                    return (
                      <tr key={s.id} className="border-b border-border align-top">
                        <th scope="row" className="py-2 pr-4 font-medium">
                          <Link href={`/sites/${s.slug}`} className={link}>
                            {s.name}
                          </Link>
                        </th>
                        <td className="py-2 pr-4">{s.body}</td>
                        <td className="py-2">{e?.status === "scored" ? `Percentile ${c(`lookup.${s.id}.${view}.percentile`)}` : e ? `${statusLabel(e.status)}: ${e.reason}` : "Not in v1 outputs"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-secondary-foreground">A descriptive lookup of stored v1 values, not a test. A site with no score says nothing about how good an analog it is.</p>
          </div>
        </div>
      </section>

      {/* 5. CTA band */}
      <section aria-labelledby="cta" className="border-t border-border bg-surface py-16">
        <div className={`${container} flex flex-col items-start justify-between gap-6 md:flex-row md:items-center`}>
          <div className="space-y-2">
            <h2 id="cta" className="text-3xl">
              Open the dashboard
            </h2>
            <p className="text-secondary-foreground">
              Browse the sites ranked by similarity to Moon and Mars targets. Also:{" "}
              {RESULTS.map((r, i) => (
                <span key={r.href}>
                  {i > 0 ? ", " : ""}
                  <Link href={r.href} className={link}>
                    {r.label}
                  </Link>
                </span>
              ))}
              .
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap bg-[color-mix(in_srgb,var(--gsop-earth-blue)_80%,black)] px-6 font-display text-xl font-semibold text-white hover:opacity-90">
            Open the dashboard
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
