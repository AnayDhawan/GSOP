import Link from "next/link";
import HeroScene from "./components/HeroScene";
import HeroSpace from "./components/HeroSpace";
import { BarChart, DumbbellChart, Meter } from "./components/Charts";
import { claim, e32Sentence, lookupFile, regionsFile, sitesFile, v2File } from "@/lib/data";
import { group, statusLabel } from "@/lib/format";
import type { GateStatus } from "@/lib/types";

const link = "underline underline-offset-4 hover:text-foreground";
const container = "mx-auto w-full max-w-6xl px-6";
const num = (id: string) => parseFloat(claim(id));

const LAYER_COLORS = { score: "#e8a33d", pct: "#287db5", gates: "#b84b3a", thermal: "#24865f" };

function Layer({ color, name, children }: { color: string; name: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1.5 h-4 w-4 shrink-0" style={{ background: color }} aria-hidden />
      <div>
        <h3 className="text-lg font-medium">{name}</h3>
        <p className="mt-1 max-w-2xl leading-relaxed text-secondary-foreground">{children}</p>
      </div>
    </div>
  );
}

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="space-y-1 px-6 py-8 first:pl-0 lg:py-10">
      <p className="font-display text-4xl tabular-nums tracking-tight md:text-5xl">{value}</p>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-secondary-foreground">{note}</p>
    </div>
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
    <li className={`flex flex-col gap-2 border bg-background p-4 ${GATE_TONE[s].box}`}>
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
  const failed = (["G1", "G2", "G3"] as const).filter((g) => gates?.[g] === "FAIL");
  const notTested = (["D1", "D2", "moon_recall"] as const).some((g) => gates?.[g] === "NOT TESTED");

  return (
    <>
      {/* Hero: deep space, centred copy, the three bodies underneath. */}
      <section aria-labelledby="hero-title" data-theme="dark" className="relative isolate flex min-h-[calc(100svh-3.5rem)] flex-col overflow-hidden border-b border-border text-foreground">
        <HeroSpace />
        <div className={`${container} pt-14 text-center md:pt-24`}>
          <h1 id="hero-title" className="font-display text-6xl font-semibold tracking-[0.18em] md:text-8xl">
            GSOP
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-secondary-foreground md:text-xl">
            A screening tool that ranks places on Earth by how closely they match a Moon base site or a Mars one.
          </p>
        </div>
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-end px-2 pb-10 pt-6 md:px-6">
          <HeroScene />
        </div>
      </section>

      {/* The product, as a link to it. */}
      <section aria-label="Dashboard preview" className={`${container} py-12 md:py-16`}>
        <Link href="/dashboard" className="group block overflow-hidden border border-border bg-surface transition-colors hover:border-earth">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/dashboard-preview.jpg" alt="The GSOP dashboard: a world map of reference sites coloured by similarity score, with a ranked list beside it" width={1440} height={760} loading="lazy" decoding="async" className="aspect-[16/8] w-full object-cover object-left-top transition-transform duration-500 group-hover:scale-[1.01]" />
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
            <div>
              <p className="gsop-label">The dashboard</p>
              <p className="mt-1 font-medium">Every reference site on one map, ranked against the Moon or Mars</p>
            </div>
            <span className="text-sm font-medium text-earth group-hover:underline">Open</span>
          </div>
        </Link>
      </section>

      {/* Numbers */}
      <section aria-label="Data at a glance" className="border-y border-border">
        <div className={container}>
          <div className="grid grid-cols-2 divide-border max-lg:[&>*:nth-child(odd)]:pl-0 max-lg:[&>*:nth-child(n+3)]:border-t max-lg:[&>*]:border-border lg:grid-cols-4 lg:divide-x">
            <Stat value={group(c("metrics.earth.land_tiles"))} label="Land tiles" note={`Equal-area tiles, ${c("landing.tile_km")} km on a side (EPSG:${c("landing.epsg")}). ${group(c("metrics.view.shackleton_rim__base.n_gated_tiles"))} pass the v1 gates for the Moon base profile.`} />
            <Stat value={c("landing.n_sites")} label="Sites evaluated" note={`${c("landing.n_known")} in our reference list and ${c("landing.n_candidates")} candidates not in our reference list.`} />
            <Stat value={c("landing.n_thermal_values")} label="Thermal reference values" note={`Statistics for ${c("landing.n_thermal_sites")} Moon and Mars targets, from LRO Diviner and MGS TES.`} />
            <Stat value={c("landing.n_sources")} label="Open data sources" note="Each one listed with what it gave us and where it falls short." />
          </div>
        </div>
      </section>

      {/* Four things to know (UCIP's layers list, for GSOP). */}
      <section aria-labelledby="ways" className="py-14 md:py-20">
        <div className={`${container} space-y-8`}>
          <h2 id="ways" className="text-3xl">
            Four things to know before you read a score
          </h2>
          <div className="space-y-7">
            <Layer color={LAYER_COLORS.score} name="The score">
              Each tile and site gets a score on a zero to one hundred scale against a Moon or Mars reference. It compares terrain and thermal layers. A high score means the layers look alike. It says nothing about gravity, dust, air or radiation.
            </Layer>
            <Layer color={LAYER_COLORS.pct} name="Two kinds of percentile">
              We rank scores inside each world&apos;s own set. The own-tile percentile uses the one tile at the site. The best-of-radius percentile takes the best tile within {c("v2.result.audit.radius_km")} km, and it flatters: a site with random features lands near {c("v2.result.audit.chance_best")} on it.
            </Layer>
            <Layer color={LAYER_COLORS.gates} name="Gates we wrote down first">
              {failed.join(", ")} failed. {gates?.G2c === "PASS" ? "G2(c) passed, and it only checks that our engine reproduces v1. " : ""}
              {notTested ? "The fitted-model tests were not run, because coverage failed first. " : ""}
              Every gate is listed below with its numbers.
            </Layer>
            <Layer color={LAYER_COLORS.thermal} name="A thermal layer that helped a little">
              Adding MODIS land surface temperature moved the Namib sand sea from the {c("v2.result.own.namib.before")}th own-tile percentile to the {c("v2.result.own.namib.after")}th. It did nothing for the Mars analogs, and it covers only {c("v2.result.coverage_pct")}% of land tiles.
            </Layer>
          </div>
        </div>
      </section>

      {/* Gate results, as reported */}
      <section aria-labelledby="transparency" className="border-y border-border bg-surface py-14 md:py-20">
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

      {/* Mission band (UCIP's saturated band, for GSOP). */}
      <section aria-labelledby="mission-band" className="border-y border-white/20 bg-[color-mix(in_srgb,var(--gsop-earth-blue)_72%,black)] text-white">
        <div className={`${container} py-12 md:py-20`}>
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
          </div>
        </div>
      </section>

      {/* The numbers behind the gates, drawn. */}
      <section aria-labelledby="charts" className="band-grid border-b border-border py-14 md:py-20">
        <div className={`${container} space-y-10`}>
          <h2 id="charts" className="max-w-3xl text-3xl">
            The same results, drawn
          </h2>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="border border-border bg-background p-5">
              <Meter title="Thermal coverage (G1)" caption="Share of land tiles with a usable thermal value." value={num("v2.result.coverage_pct")} display={`${c("v2.result.coverage_pct")}%`} required={num("v2.result.g1.required_pct")} requiredDisplay={`${c("v2.result.g1.required_pct")}%`} tone="control" />
            </div>
            <div className="border border-border bg-background p-5">
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
            </div>
            <div className="border border-border bg-background p-5">
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
            </div>
          </div>
        </div>
      </section>

      {/* Local impact: India */}
      <section aria-labelledby="local" className="py-14 md:py-20">
        <div className={`${container} grid gap-12 lg:grid-cols-2`}>
          <div className="space-y-4">
            <h2 id="local" className="text-3xl">
              Local ground data, starting with India
            </h2>
            <p className="leading-relaxed text-secondary-foreground">
              A satellite layer averages a big area. Ours starts from {c("landing.src.modis_lst.res.n0")} km land surface temperature and averages it to {c("landing.tile_km")} km tiles, so Puga in Ladakh (about {group(c("sites.ladakh-tso-kar-and-puga-mars.elevation_m"))} m up, in a cold desert) is scored from a coarse view. A logger on the ground would tell us whether that view holds.
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
            <p className="text-sm text-secondary-foreground">Stored v1 values, looked up, not tested. A site with no score says nothing about how good an analog it is.</p>
          </div>
        </div>
      </section>

      {/* Built in the open, then the way in. */}
      <section aria-labelledby="open" className="border-t border-border bg-surface py-14 md:py-20">
        <div className={`${container} flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}>
          <div className="max-w-2xl space-y-3">
            <h2 id="open" className="text-3xl">
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
          </div>
          <Link href="/dashboard" className="inline-flex min-h-12 shrink-0 items-center whitespace-nowrap bg-[color-mix(in_srgb,var(--gsop-earth-blue)_80%,black)] px-7 font-display text-xl font-semibold text-white hover:opacity-90">
            Open the dashboard
          </Link>
        </div>
      </section>
    </>
  );
}
