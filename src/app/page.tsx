import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import HeroScene from "./components/HeroScene";
import Reveal from "./components/Reveal";
import { BarChart, DumbbellChart, Meter } from "./components/Charts";
import { claim, e32Sentence, headline, lookupFile, regionsFile, sitesFile, v2File } from "@/lib/data";
import { group, statusLabel } from "@/lib/format";
import type { GateStatus } from "@/lib/types";

const link = "underline underline-offset-4 hover:text-foreground";
const container = "mx-auto w-full max-w-6xl px-6";
const primaryBtn =
  "inline-flex min-h-12 shrink-0 items-center whitespace-nowrap bg-[color-mix(in_srgb,var(--gsop-earth-blue)_80%,black)] px-6 font-display text-lg font-semibold text-white transition-opacity hover:opacity-90";
const ghostBtn = "inline-flex min-h-12 items-center whitespace-nowrap border border-current/40 px-5 font-display text-lg transition-colors hover:border-current";
const num = (id: string) => parseFloat(claim(id));

const LAYER_COLORS = { score: "#e8a33d", pct: "#287db5", gates: "#b84b3a", thermal: "#24865f" };

/** Mono kicker above a section title: the index on the left, the theme on the right, like a survey sheet. */
function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="gsop-label flex items-center gap-3">
      <span className="text-foreground">{n}</span>
      <span aria-hidden className="h-px w-8 bg-border" />
      <span>{children}</span>
    </p>
  );
}

function Stat({ value, label, note, delay }: { value: string; label: string; note: string; delay: number }) {
  return (
    <Reveal delay={delay} className="space-y-2 py-8 pl-0 pr-6 lg:py-12">
      <p className="stat-readout font-display text-4xl font-medium lg:text-[2.6rem]">{value}</p>
      <p className="gsop-label text-foreground">{label}</p>
      <p className="text-sm leading-relaxed text-secondary-foreground">{note}</p>
    </Reveal>
  );
}

function Layer({ color, name, delay, children }: { color: string; name: string; delay: number; children: React.ReactNode }) {
  return (
    <Reveal delay={delay} className="relative border-t border-border pt-6">
      <span aria-hidden className="absolute -top-px left-0 h-px w-12" style={{ background: color }} />
      <div className="flex items-start gap-4">
        <span className="mt-1.5 h-4 w-4 shrink-0" style={{ background: color }} aria-hidden />
        <div>
          <h3 className="text-xl">{name}</h3>
          <p className="mt-2 max-w-2xl leading-relaxed text-secondary-foreground">{children}</p>
        </div>
      </div>
    </Reveal>
  );
}

const GATE_TONE: Record<GateStatus, { box: string; dot: string }> = {
  FAIL: { box: "border-control", dot: "bg-control" },
  PASS: { box: "border-positive", dot: "bg-positive" },
  "NOT TESTED": { box: "border-dashed border-border", dot: "border border-dashed border-muted-foreground" },
};

function Gate({ name, status, children, delay }: { name: string; status: GateStatus | undefined; children: React.ReactNode; delay: number }) {
  const s: GateStatus = status ?? "NOT TESTED";
  return (
    <Reveal as="li" delay={delay} className={`flex flex-col gap-2 border bg-background p-4 ${GATE_TONE[s].box}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-lg">{name}</span>
        <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          <span aria-hidden className={`h-2.5 w-2.5 ${GATE_TONE[s].dot}`} />
          {s}
        </span>
      </div>
      <p className="text-sm text-secondary-foreground">{children}</p>
    </Reveal>
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
  const h = headline();
  const failed = (["G1", "G2", "G3"] as const).filter((g) => gates?.[g] === "FAIL");
  const notTested = (["D1", "D2", "moon_recall"] as const).some((g) => gates?.[g] === "NOT TESTED");
  // The tally counts the seven gates shown as cards below, nothing else.
  const SHOWN = ["G1", "G2", "G2c", "G3", "D1", "D2", "moon_recall"] as const;
  const gateCount = (want: GateStatus) => SHOWN.filter((k) => (gates?.[k] ?? "NOT TESTED") === want).length;
  // The satellite layer is optional artwork; the hero renders without it until the file is added.
  const satellite = fs.existsSync(path.join(process.cwd(), "public/img/satellite.png"));

  return (
    <>
      {/* Hero: outer space behind everything. The name and a short description float on top, Earth rises from the bottom
          with a satellite orbiting it. Always dark, like the footer. The header floats over the top of it. */}
      <section data-theme="dark" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#06080a] text-foreground">
        <div className="absolute inset-0 -z-10">
          <HeroScene satellite={satellite} />
        </div>
        <div className={`${container} relative z-10 pb-[34svh] pt-28 text-center md:pb-[46svh] md:pt-32`}>
          {/* Letter spacing is inline: the global h1 rule is unlayered and would beat a Tailwind class. */}
          <h1 id="hero-title" style={{ letterSpacing: "0.2em" }} className="pl-[0.2em] font-display text-6xl font-semibold md:text-8xl">
            GSOP
          </h1>
          <p className="mt-3 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-secondary-foreground sm:text-xs sm:tracking-[0.18em]">Geospatial Similarity Observation Platform</p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-secondary-foreground">
            An open screening tool that ranks places on Earth by how closely they match Moon base and Mars sites. Every result, failures included, is published.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className={primaryBtn}>
              Open the dashboard
            </Link>
            <Link href="/gates" className={ghostBtn}>
              Gate results
            </Link>
          </div>
        </div>
        {satellite && (
          <p className="absolute bottom-4 right-4 z-10 max-w-[11rem] text-right text-xs text-secondary-foreground md:max-w-none">Satellite image: AI-generated illustration</p>
        )}
        <a href="#glance" className="hero-cue absolute bottom-4 left-1/2 z-10 -translate-x-1/2 p-3 text-secondary-foreground hover:text-foreground max-md:hidden" aria-label="Scroll to the data">
          <span aria-hidden className="block h-3 w-3 rotate-45 border-b-2 border-r-2 border-current" />
        </a>
      </section>

      {/* The product, as a link to it. */}
      <section aria-label="Dashboard preview" className={`${container} py-12 md:py-16`}>
        <Reveal>
          <Link href="/dashboard" className="group block overflow-hidden border border-border bg-surface transition-colors hover:border-earth">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/dashboard-preview.jpg" alt="The GSOP dashboard: a world map of reference sites coloured by similarity score, with a ranked list beside it" width={1440} height={760} loading="lazy" decoding="async" className="aspect-[1440/760] w-full object-cover object-top" />
            <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
              <div>
                <p className="gsop-label">The dashboard</p>
                <p className="mt-1 font-medium">Every reference site on one map, ranked against the Moon or Mars, with a World and an India view</p>
              </div>
              <span className="text-sm font-medium text-earth group-hover:underline">Open</span>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* 1. Stats band: the instrument readout. */}
      <section id="glance" aria-label="Data at a glance" className="border-y border-border bg-surface">
        <div className={container}>
          <div className="grid grid-cols-1 divide-border [&>*]:border-border [&>*:not(:first-child)]:border-t sm:grid-cols-2 sm:[&>*:nth-child(2)]:border-t-0 sm:[&>*:nth-child(even)]:pl-6 lg:grid-cols-4 lg:divide-x lg:[&>*]:border-t-0 lg:[&>*:not(:first-child)]:pl-6">
            <Stat delay={0} value={group(c("metrics.earth.land_tiles"))} label="Land tiles" note={`Equal-area tiles, ${c("landing.tile_km")} km on a side (EPSG:${c("landing.epsg")}). ${group(c("metrics.view.shackleton_rim__base.n_gated_tiles"))} pass the v1 gates for the Moon base profile.`} />
            <Stat delay={80} value={c("landing.n_sites")} label="Sites evaluated" note={`${c("landing.n_known")} in our reference list and ${c("landing.n_candidates")} candidates not in our reference list.`} />
            <Stat delay={160} value={c("landing.n_thermal_values")} label="Thermal reference values" note={`Statistics for ${c("landing.n_thermal_sites")} Moon and Mars targets, from LRO Diviner and MGS TES.`} />
            <Stat delay={240} value={c("landing.n_sources")} label="Open data sources" note="Each one listed with what it gave us and where it falls short." />
          </div>
        </div>
      </section>

      {/* 2. Four things to know before reading a score. */}
      <section aria-labelledby="ways" className="py-20 md:py-28">
        <div className={`${container} space-y-12`}>
          <Reveal className="max-w-3xl space-y-4">
            <Kicker n="01">Reading a score</Kicker>
            <h2 id="ways" className="text-3xl md:text-4xl">
              Four things to know before you read a score
            </h2>
            <p className="text-lg text-secondary-foreground">{h.support}</p>
          </Reveal>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-12">
            <Layer delay={0} color={LAYER_COLORS.score} name="The score">
              Each tile and site gets a score on a zero to one hundred scale against a Moon or Mars reference. It compares terrain and thermal layers. A high score means the layers look alike. It says nothing about gravity, dust, air or radiation.
            </Layer>
            <Layer delay={80} color={LAYER_COLORS.pct} name="Two kinds of percentile">
              We rank scores inside each world&apos;s own set. The own-tile percentile uses the one tile at the site. The best-of-radius percentile takes the best tile within {c("v2.result.audit.radius_km")} km, and it flatters: a site with random features lands near {c("v2.result.audit.chance_best")} on it.
            </Layer>
            <Layer delay={160} color={LAYER_COLORS.gates} name="Gates we wrote down first">
              {failed.join(", ")} failed. {gates?.G2c === "PASS" ? "G2(c) passed, and it only checks that our engine reproduces v1. " : ""}
              {notTested ? "The fitted-model tests were not run, because coverage failed first. " : ""}
              Every gate is listed below with its numbers.
            </Layer>
            <Layer delay={240} color={LAYER_COLORS.thermal} name="A thermal layer that helped a little">
              Adding MODIS land surface temperature moved the Namib sand sea from the {c("v2.result.own.namib.before")}th own-tile percentile to the {c("v2.result.own.namib.after")}th. It did nothing for the Mars analogs, and it covers only {c("v2.result.coverage_pct")}% of land tiles.
            </Layer>
          </div>
        </div>
      </section>

      {/* 3. Transparency strip: the gate results as printed on /gates. */}
      <section aria-labelledby="transparency" className="band-grid border-y border-border bg-surface py-20 md:py-28">
        <div className={`${container} space-y-10`}>
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-4">
              <Kicker n="02">Self-audit</Kicker>
              <h2 id="transparency" className="text-3xl md:text-4xl">
                Gate results, as reported
              </h2>
              <p className="text-lg">We pre-registered our thresholds and publish every result, including failures.</p>
            </div>
            <p className="flex gap-6 font-mono text-sm uppercase tracking-wider text-secondary-foreground" aria-label="Gate tally">
              <span>
                <span className="text-control">{gateCount("FAIL")}</span> fail
              </span>
              <span>
                <span className="text-positive">{gateCount("PASS")}</span> pass
              </span>
              <span>
                <span className="text-foreground">{gateCount("NOT TESTED")}</span> not tested
              </span>
            </p>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Gate delay={0} name="G1" status={gates?.G1}>
              Coverage {c("v2.result.coverage_pct")}% vs {c("v2.result.g1.required_pct")}% required.
            </Gate>
            <Gate delay={60} name="G2" status={gates?.G2}>
              Moon controls scored {c("v2.result.g2a.namib")} and {c("v2.result.g2a.rak")}, above the {c("v2.result.g2a.max")} maximum. {c("v2.result.g2b.n_at_or_above")} of {c("v2.result.g2b.n_scorable")} scorable Mars positives reached the top group.
            </Gate>
            <Gate delay={120} name="G2(c)" status={gates?.G2c}>
              The terrain-only baseline reproduces v1 ({c("v2.result.g2c.namib")} / {c("v2.result.g2c.rub")} / {c("v2.result.g2c.mars_median")}). It checks the engine, not the analogy.
            </Gate>
            <Gate delay={180} name="G3" status={gates?.G3}>
              {c("v2.result.g3.total")} supported regions, both at the Shackleton rim.
            </Gate>
            <Gate delay={240} name="D1" status={gates?.D1}>
              Blocked by the coverage gate.
            </Gate>
            <Gate delay={300} name="D2" status={gates?.D2}>
              Blocked by the coverage gate.
            </Gate>
            <Gate delay={360} name="Moon recall" status={gates?.moon_recall}>
              Two Moon positives, one of them not scorable.
            </Gate>
          </ul>
          <Reveal className="max-w-3xl space-y-4">
            <blockquote className="border-l-2 border-border pl-4 text-secondary-foreground">{e32Sentence()}</blockquote>
            <p className="text-secondary-foreground">
              The ranking has not been checked against independent data. Mars is a low-confidence secondary result. The negative-control test failed: the Moon controls scored above the pre-registered maximum.
            </p>
            <p className="flex flex-wrap gap-x-6 gap-y-2 font-display text-lg">
              <Link href="/gates" className={link}>
                Read every gate result
              </Link>
              <Link href="/ledger" className={link}>
                Failure-First Ledger
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4. Mission band. */}
      <section aria-labelledby="mission-band" className="border-b border-white/20 bg-[color-mix(in_srgb,var(--gsop-earth-blue)_72%,black)] text-white">
        <Reveal className={`${container} py-14 md:py-20`}>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/80">A screen, not a verdict</p>
          <h2 id="mission-band" className="mt-3 max-w-3xl text-3xl font-semibold leading-snug md:text-4xl">
            The ranking tells you where to look first. It does not tell you a place is a good analog.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90">
            We print the failed gates next to the results. The data build is one command, and a second run gives the same bytes. Every number on this site has a row in a claims file with its source file and hash.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/mission" className="bg-white px-5 py-3 text-sm font-semibold text-[#143a57] hover:bg-white/90">
              Our mission
            </Link>
            <Link href="/method" className="border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
              How the method works
            </Link>
            <Link href="/roadmap" className="border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
              After the hackathon
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 5. The numbers behind the gates, drawn. */}
      <section aria-labelledby="charts" className="py-20 md:py-28">
        <div className={`${container} space-y-12`}>
          <Reveal className="max-w-3xl space-y-4">
            <Kicker n="03">Figures</Kicker>
            <h2 id="charts" className="text-3xl md:text-4xl">
              The same results, drawn
            </h2>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            <Reveal delay={0} className="border border-border bg-surface p-5">
              <Meter title="Thermal coverage (G1)" caption="Share of land tiles with a usable thermal value." value={num("v2.result.coverage_pct")} display={`${c("v2.result.coverage_pct")}%`} required={num("v2.result.g1.required_pct")} requiredDisplay={`${c("v2.result.g1.required_pct")}%`} tone="control" />
            </Reveal>
            <Reveal delay={100} className="border border-border bg-surface p-5">
              <DumbbellChart
                title="Own-tile percentile, Moon controls"
                caption="Lower is better for a place that should not match."
                rows={[
                  { label: "Namib sand sea", from: num("v2.result.own.namib.before"), to: num("v2.result.own.namib.after"), fromDisplay: c("v2.result.own.namib.before"), toDisplay: c("v2.result.own.namib.after") },
                  { label: "Rub' al Khali", from: num("v2.result.own.rak.before"), to: num("v2.result.own.rak.after"), fromDisplay: c("v2.result.own.rak.before"), toDisplay: c("v2.result.own.rak.after") },
                ]}
                fromLabel="terrain only"
                toLabel="with thermal layer"
              />
            </Reveal>
            <Reveal delay={200} className="border border-border bg-surface p-5">
              <BarChart
                title="Scorable Mars positives (G2b)"
                caption={`Percentile in the thermal run. The bar to clear was the ${c("v2.result.g2b.percentile")}th.`}
                reference={{ value: num("v2.result.g2b.percentile"), label: `the ${c("v2.result.g2b.percentile")}th percentile` }}
                rows={[
                  { label: "Haughton", value: num("v2.result.g2b.haughton"), display: c("v2.result.g2b.haughton"), tone: "mars" },
                  { label: "MDRS (Utah)", value: num("v2.result.g2b.mdrs_utah"), display: c("v2.result.g2b.mdrs_utah"), tone: "mars" },
                  { label: "Atacama salars", value: num("v2.result.g2b.atacama_salars"), display: c("v2.result.g2b.atacama_salars"), tone: "mars" },
                  { label: "Ladakh (Puga)", value: num("v2.result.g2b.ladakh_puga"), display: c("v2.result.g2b.ladakh_puga"), tone: "mars" },
                ]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. Local impact: India */}
      <section aria-labelledby="local" className="border-t border-border bg-surface py-20 md:py-28">
        <div className={`${container} grid gap-12 lg:grid-cols-2 lg:gap-16`}>
          <Reveal className="space-y-5">
            <Kicker n="04">Local ground data</Kicker>
            <h2 id="local" className="text-3xl md:text-4xl">
              Local ground data, starting with India
            </h2>
            <p className="leading-relaxed text-secondary-foreground">
              A satellite layer averages a big area. Ours starts from {c("landing.src.modis_lst.res.n0")} km land surface temperature and averages it to {c("landing.tile_km")} km tiles, so Puga in Ladakh (about {group(c("sites.ladakh-tso-kar-and-puga-mars.elevation_m"))} m above sea level) is scored from a coarse view of a cold desert. A logger on the ground
              would show whether that view holds.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                {c("landing.n_india_known")} India entries are in our reference list, and {regions.length === 1 ? "one" : "some"} of the {c("regions.count")} candidate regions overlap the India outline
                {regions.length ? `: ${regions.map((r) => `${r.id} (${c(`regions.${r.id.replace(" ", "_")}.n_tiles_in_india`)} tiles)`).join(", ")}` : ""}. Regions are unreviewed candidates.
              </li>
              <li>
                Ladakh (Puga) scored {c("v2.result.g2b.ladakh_puga")} in the Mars thermal run, the lowest of the {c("v2.result.g2b.n_scorable")} scorable Mars positives. We do not know why. Field data is how we would find out.
              </li>
              <li>
                If you have measurements with a date, a place and an instrument, send them.{" "}
                <Link href="/contribute" className={link}>
                  Here is what we accept
                </Link>
                .
              </li>
            </ul>
          </Reveal>
          <Reveal delay={120} className="space-y-3 border border-border bg-background p-5 md:p-6">
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
            <p className="text-sm text-secondary-foreground">Stored v1 values, looked up, not tested. A site with no score says nothing about how good an analog it is.</p>
          </Reveal>
        </div>
      </section>

      {/* 7. Built in the open, then the way in. On the brand ribbon. */}
      <section aria-labelledby="open" className="band-ribbon border-t border-border bg-background py-20 md:py-24">
        <div className={`${container} flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}>
          <Reveal className="max-w-2xl space-y-3">
            <Kicker n="05">Open by default</Kicker>
            <h2 id="open" className="text-3xl md:text-4xl">
              Built in the open
            </h2>
            <p className="leading-relaxed text-secondary-foreground">
              Every scored input is open data: {c("landing.n_sources")} sources, from NASA, USGS, ESA and Natural Earth, each listed with its licence and its caveats on the{" "}
              <Link href="/data-sources" className={link}>
                data sources
              </Link>{" "}
              page. The files are static, so you can pull them yourself: see{" "}
              <Link href="/docs/data-access" className={link}>
                data file access
              </Link>
              . This is a research prototype, not a NASA tool.
            </p>
          </Reveal>
          <Link href="/dashboard" className={`${primaryBtn} text-xl`}>
            Open the dashboard
          </Link>
        </div>
      </section>
    </>
  );
}
