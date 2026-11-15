import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Band from "../../components/Band";
import { BarChart, type Row } from "../../components/Charts";
import PageHero from "../../components/PageHero";
import { chipFor, claim, lookupFile, measurementsFile, photoFor, profileFor, sitesFile } from "@/lib/data";
import { claimIds, evidenceFor } from "@/lib/evidence";
import MeasuredEvidence from "./MeasuredEvidence";
import { group, statusLabel } from "@/lib/format";
import { viewName } from "@/lib/names";
import type { Profile, Site } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...new Set(sitesFile().sites.map((s) => s.slug))].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = sitesFile().sites.find((x) => x.slug === slug);
  if (!s) return { title: "Site" };
  const p = profileFor(slug);
  const ph = photoFor(slug);
  const description = p?.summary ?? s.why_analog ?? `${s.name}, listed as a ${s.body} analog.`;
  return { title: s.name, description, openGraph: { images: ph ? [{ url: ph.src, alt: ph.alt }] : [{ url: "/brand/og/gsop-og-image-1200x630.png", width: 1200, height: 630, alt: "The Moon, Earth and Mars" }] } };
}

const link = "underline underline-offset-4 hover:text-foreground";
const NONE = "Nothing found yet.";

function Card({ title, text, tag }: { title: string; text: string | null; tag?: string }) {
  return (
    <section className="space-y-2 border border-border border-t-2 border-t-earth bg-surface p-5">
      <h3 className="text-xl">{title}</h3>
      <p className={text ? "leading-relaxed" : "text-muted-foreground"}>{text && text.trim() ? text : NONE}</p>
      {tag ? <p className="text-xs text-muted-foreground">{tag}</p> : null}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <li className="border border-border bg-background/60 px-3 py-1 text-sm">{children}</li>;
}

function Photo({ slug, body, name }: { slug: string; body: string; name: string }) {
  const ph = photoFor(slug);
  if (!ph) {
    return (
      <figure className="space-y-2">
        <div className="relative flex aspect-[16/6] items-center justify-center overflow-hidden border border-border bg-surface-raised">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={body === "Moon" ? "/img/bodies/moon.jpg" : "/img/bodies/mars.jpg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale" />
          <p className="relative max-w-md px-6 text-center text-secondary-foreground">We have not found a freely licensed photo of {name} yet.</p>
        </div>
      </figure>
    );
  }
  return (
    <figure className="space-y-2">
      <div className="aspect-[16/7] overflow-hidden border border-border bg-surface-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph.src} alt={`${ph.alt}: ${name}`} className="h-full w-full object-cover" decoding="async" />
      </div>
      <figcaption className="text-xs text-muted-foreground">
        {ph.alt}. {ph.credit}.{" "}
        <a href={ph.sourceUrl} className={link} target="_blank" rel="noopener noreferrer">
          Original file
        </a>
      </figcaption>
    </figure>
  );
}

function v1Line(s: Site): string {
  const id = s.v1_match.site_id.replace(/^[a-z_]+\//, "").replace(/_/g, " ");
  const km = claim(`sites.${s.id}.v1_match_km`);
  if (s.v1_used === true) return `Yes. This place matches the v1 site "${id}", about ${km} km away.`;
  if (s.v1_used === false) return `No. The nearest v1 site, "${id}", is about ${km} km away.`;
  return `Unknown. The nearest v1 site, "${id}", is about ${km} km away, and the files cannot say whether v1 meant the same place.`;
}

function FactsTable({ s, p }: { s: Site; p: Profile | null }) {
  const lat = claim(`sites.${s.id}.lat`);
  const lon = claim(`sites.${s.id}.lon`);
  const elev = s.elevation_m !== null ? group(claim(`sites.${s.id}.elevation_m`)) : null;
  const year = s.year_first_used_as_analog !== null ? claim(`sites.${s.id}.year_first_used_as_analog`) : null;
  const rows: { k: string; v: string; src?: string }[] = [
    { k: "Country", v: s.country ?? "not provided" },
    { k: "Coordinates", v: `${lat}, ${lon}${s.coord_source === "csv_approx" ? " (approximate)" : ""}` },
    // A researched Elevation fact (with its source link) replaces the stored list value rather than repeating it.
    ...(elev && !(p?.facts ?? []).some((f) => /^elevation\b/i.test(f.label)) ? [{ k: "Elevation", v: `${elev} m` }] : []),
    ...(year ? [{ k: "First used as an analog", v: year }] : []),
    ...(p?.facts ?? []).map((f) => ({ k: f.label, v: `${f.value} ${f.unit}`.trim(), src: f.source_url })),
  ];
  return (
    <div className="border border-border bg-surface">
      <h3 className="border-b border-border px-5 py-3 text-xl">Key facts</h3>
      <dl className="divide-y divide-border text-sm">
        {rows.map((r, i) => (
          <div key={`${r.k}-${i}`} className="grid grid-cols-[minmax(7rem,10rem)_1fr] gap-3 px-5 py-2.5">
            <dt className="text-muted-foreground">{r.k}</dt>
            <dd>
              <span className="font-mono tabular-nums">{r.v}</span>
              {r.src ? (
                <>
                  {" "}
                  <a href={r.src} className={`${link} text-xs text-muted-foreground`} target="_blank" rel="noopener noreferrer">
                    source
                  </a>
                </>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SiteBody({ s, withBody }: { s: Site; withBody: boolean }) {
  const p = profileFor(s.slug);
  const lookupAll = lookupFile();
  const lookup = lookupAll.sites[s.id] ?? {};
  const views = Object.keys(lookup);
  const meas = measurementsFile();
  const siteRows = meas?.by_site[s.id] ?? [];
  const ids = claimIds(s.id, siteRows);
  const evidence = meas ? evidenceFor(siteRows, (m) => claim(ids.get(m) as string)) : null;
  const sources = [...new Set([...(p?.source_urls ?? []), s.source_url_1, s.source_url_2, s.source_url_3].filter(Boolean) as string[])];
  const tone = s.body === "Moon" ? "moon" : "mars";
  const scored = views.filter((v) => lookup[v].status === "scored");
  const short = (v: string) => viewName(v).replace("Landing and mobility", "Landing").replace("Power and night", "Power");
  const scoreRows: Row[] = scored.map((v) => ({ label: short(v), value: parseFloat(claim(`lookup.${s.id}.${v}.score`)), display: claim(`lookup.${s.id}.${v}.score`), tone }));
  const pctRows: Row[] = scored.map((v) => ({ label: short(v), value: parseFloat(claim(`lookup.${s.id}.${v}.percentile`)), display: claim(`lookup.${s.id}.${v}.percentile`), tone }));
  const label = s.body === "Moon" ? "Moon" : "Mars";

  return (
    <div aria-label={withBody ? `${s.name}, ${label}` : undefined}>
      {withBody && <h2 className="mb-6 mt-4 font-display text-3xl">Listed for the {label}</h2>}

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="space-y-4" aria-labelledby={`sum-${s.id}`}>
          <h2 id={`sum-${s.id}`} className="text-3xl">
            About this place
          </h2>
          <p className="text-lg leading-relaxed">{p?.summary ?? s.summary ?? s.why_analog ?? NONE}</p>
          <p className="text-xs text-muted-foreground">{p?.summary ? "Researched from public sources, unreviewed." : "Teammate-written, unreviewed."}</p>
          {s.list === "candidate" && <p className="border-l-2 border-border pl-3 text-secondary-foreground">This is a candidate: a suggestion that is not in our reference list.</p>}
        </section>
        <FactsTable s={s} p={p} />
      </div>

      <Band tone="raised">
        <h2 className="mb-6 text-3xl">The place itself</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Card title="Terrain and geology" text={p?.terrain_geology ?? s.terrain_geology} />
          <Card title="Climate" text={p?.climate ?? s.climate} />
          <Card title="Access and facilities" text={p?.access_and_facilities ?? s.access_and_facilities} />
          <Card title="Hazards" text={p?.hazards ?? s.hazards} />
        </div>
      </Band>

      <Band tone="grid" labelledBy={`why-${s.id}`}>
        <div className="space-y-6">
        <h2 id={`why-${s.id}`} className="text-3xl">
          Why it counts as an analog, and where that stops
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="gsop-label">Why it is listed</h3>
            <p className="leading-relaxed">{s.why_analog ?? NONE}</p>
            {s.parameters_matched ? <p className="text-secondary-foreground">Parameters matched: {s.parameters_matched}</p> : null}
          </div>
          <div className="space-y-2 border-l-2 border-control pl-5">
            <h3 className="gsop-label">Where the analogy breaks down</h3>
            <p className="leading-relaxed">{s.key_differences ?? NONE}</p>
          </div>
        </div>
        <div className="grid gap-6 border-t border-border pt-6 md:grid-cols-3">
          <div className="space-y-1">
            <h3 className="text-lg">Experiments done</h3>
            <p className="text-secondary-foreground">{s.experiments_done ?? NONE}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg">Experiments proposed</h3>
            <p className="text-secondary-foreground">{s.experiments_possible ?? NONE}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg">How to adjust it</h3>
            <p className="text-secondary-foreground">{s.how_to_modify ?? NONE}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Teammate-written, unreviewed.</p>
        </div>
      </Band>

      <Band tone="accent">
        <div className="space-y-8">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-3xl">The score we stored for it</h2>
            <p className="text-secondary-foreground">
              A lookup of values v1 already stored near this place. It is not a test. The percentile takes the best tile within the match radius, so a place with random features would also score high: about {claim("v2.result.audit.chance_best")}.
            </p>
            <p>
              <span className="gsop-label">v1 used this site</span>
              <br />
              {v1Line(s)}
            </p>
          </div>
          {scored.length > 0 ? (
            <div className="grid gap-10 lg:grid-cols-2">
              <BarChart title="Score by view" caption="The composite score v1 stored." rows={scoreRows} />
              <BarChart title="Percentile by view" caption="Rank among the scored tiles of that view." rows={pctRows} reference={{ value: parseFloat(claim("v2.result.audit.chance_best")), label: "chance level for the best tile within the radius" }} />
            </div>
          ) : (
            <p className="border border-dashed border-border p-4 text-secondary-foreground">No view has a score for this place, so there is nothing to chart. The table gives the reason for each view.</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Stored v1 scores near {s.name}</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-2 pr-4 font-medium">Score view</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Result</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Percentile</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Score</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Distance to tile (km)</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Overlap flag</th>
                </tr>
              </thead>
              <tbody>
                {views.map((v) => {
                  const e = lookup[v];
                  const ok = e.status === "scored";
                  return (
                    <tr key={v} className="border-b border-border align-top">
                      <th scope="row" className="py-2 pr-4 font-medium">
                        {viewName(v)}
                      </th>
                      <td className="py-2 pr-4">
                        {ok ? "Scored" : statusLabel(e.status)}
                        {!ok && "reason" in e ? <span className="block text-xs text-muted-foreground">{e.reason}</span> : null}
                      </td>
                      <td className="py-2 pr-4">{ok ? claim(`lookup.${s.id}.${v}.percentile`) : "none"}</td>
                      <td className="py-2 pr-4">{ok ? claim(`lookup.${s.id}.${v}.score`) : "none"}</td>
                      <td className="py-2 pr-4">{ok ? claim(`lookup.${s.id}.${v}.km_to_tile`) : "none"}</td>
                      <td className="py-2 pr-4">{ok && e.status === "scored" ? (e.top5_in_90pct_runs ? "In a flagged tile" : "Not in a flagged tile") : "none"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">Overlap flag: whether the tile used for the score is one v1 flagged as stable in its top group across the Monte Carlo runs.</p>
          <details className="text-sm text-secondary-foreground">
            <summary className="cursor-pointer">What these scores can and cannot tell you</summary>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {lookupAll.meta.limits.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </details>
        </div>
      </Band>

      <div className="space-y-8">
        <MeasuredEvidence evidence={evidence} chip={chipFor(s.slug)} radiusClaim={(r) => claim(`v2.evidence.radius.${r}`)} />

        <section className="space-y-2" aria-labelledby={`src-${s.id}`}>
          <h2 id={`src-${s.id}`} className="text-2xl">
            Sources
          </h2>
          {sources.length === 0 ? (
            <p className="text-muted-foreground">Sources pending ({s.source_note}).</p>
          ) : (
            <ul className="list-disc space-y-1 pl-6">
              {sources.map((u) => (
                <li key={u} className="break-all">
                  <a href={u} className={link} target="_blank" rel="noopener noreferrer">
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {p ? <p className="text-xs text-muted-foreground">Confidence in the researched text: {p.confidence}. Nobody on the team has checked it.</p> : null}
        </section>
      </div>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = sitesFile().sites.filter((x) => x.slug === slug).sort((a, b) => Number(a.body === "Mars") - Number(b.body === "Mars"));
  if (rows.length === 0) notFound();
  const first = rows[0];
  const p = profileFor(slug);
  return (
    <>
      <PageHero title={first.name} lede={p?.place ?? first.country ?? undefined}>
        <ul className="flex flex-wrap items-center gap-2">
          {rows.map((r) => (
            <Chip key={r.id}>{r.body}</Chip>
          ))}
          <Chip>{first.list === "known" ? "Reference site" : "Candidate, not in our reference list"}</Chip>
          {first.country ? <Chip>{first.country}</Chip> : null}
          <Chip>{p ? "Researched from public sources, unreviewed" : "Teammate-written, unreviewed"}</Chip>
          {p?.confidence === "low" ? <Chip>Low confidence</Chip> : null}
          <li>
            <Link href="/sites" className={`px-2 py-1 text-sm ${link}`}>
              All sites
            </Link>
          </li>
        </ul>
      </PageHero>

      <article className="space-y-12">
        <Photo slug={slug} body={first.body} name={first.name} />
        {rows.length > 1 && rows.some((r) => r.name !== first.name) && <p className="text-sm text-secondary-foreground">The same place appears under both bodies, with its own text for each.</p>}
        {rows.map((s) => (
          <SiteBody key={s.id} s={s} withBody={rows.length > 1} />
        ))}
      </article>
    </>
  );
}
