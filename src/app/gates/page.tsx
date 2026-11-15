import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import { BarChart, DumbbellChart, Meter } from "../components/Charts";
import PageHero from "../components/PageHero";
import { claim, e32Sentence, v2File } from "@/lib/data";
import { shortHash } from "@/lib/format";
import { targetName } from "@/lib/names";
import { REPO_URL } from "@/lib/nav";
import type { GateStatus } from "@/lib/types";

export const metadata: Metadata = { title: "v2 gate results", description: "Every pre-registered gate from the v2 run, with its literal status and the numbers behind it." };

const link = "underline underline-offset-4";
const h2 = "text-3xl";
// Chart geometry reads the stored display string; the printed label is that same string.
const num = (s: string) => parseFloat(s);

// Statuses are printed exactly as stored: PASS, FAIL or NOT TESTED. A coloured square sits beside the word; the word carries the meaning.
function Status({ s }: { s: GateStatus | undefined }) {
  if (!s) return <span className="text-muted-foreground">Not available</span>;
  const dot = s === "FAIL" ? "bg-control" : s === "PASS" ? "bg-positive" : "border border-dashed border-muted-foreground";
  return (
    <span className="inline-flex items-center gap-2 font-medium">
      <span aria-hidden className={`h-2.5 w-2.5 shrink-0 ${dot}`} />
      {s}
    </span>
  );
}

function Row({ gate, status, children, sub = false }: { gate: string; status: GateStatus | undefined; children: React.ReactNode; sub?: boolean }) {
  return (
    <tr className="border-b border-border align-top">
      <th scope="row" className={`py-2 pr-4 font-medium ${sub ? "pl-6" : ""}`}>
        {gate}
      </th>
      <td className="py-2 pr-4">
        <Status s={status} />
      </td>
      <td className="py-2 pr-4 text-secondary-foreground">{children}</td>
    </tr>
  );
}

function GateTable({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="py-2 pr-4 font-medium">
              Gate
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Status
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              What was found
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const card = "border border-border bg-surface p-5";

export default function Page() {
  const v2 = v2File();
  const r = v2.results;
  if (!v2.run_completed || !r) {
    return (
      <>
        <PageHero title="v2 gate results" lede="The v2 result files are not here, so nothing is shown." />
        <p className="text-control">{v2.status_text}</p>
        <p className="mt-3 max-w-2xl text-secondary-foreground">Gate results are not shown because the v2 result files are not here. Nothing is filled in.</p>
      </>
    );
  }
  const g = r.gate_statuses;
  const c = claim;
  const scorable = r.g2b_sites.filter((s) => s.scorable);
  const gatedOut = r.g2b_sites.filter((s) => !s.scorable);
  const supported = r.g3_targets.filter((t) => t.n_supported > 0);
  const supportedTotal = r.g3_targets.reduce((n, t) => n + t.n_supported, 0);
  const runA = r.runs.find((x) => x.track === "A");
  const runD = r.runs.find((x) => x.track === "D");

  return (
    <>
      <PageHero title="v2 gate results" lede="We wrote the gates down before any v2 score existed. Here is every one of them, in the order the run reported it." />

      <div className="grid gap-8 md:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <p className="text-lg">G1, G2 and G3 failed. Nothing on this page is hidden or moved down the list.</p>
          <p className="text-secondary-foreground">
            The fitted-model tests were never run as pass or fail tests, because the coverage gate failed first. The ranking has not been checked against independent data. What follows is a screening method and the audit we published of it.
          </p>
        </div>
        <blockquote className="self-start border-l-2 border-border pl-4 text-sm">{e32Sentence()}</blockquote>
      </div>

      <Band tone="raised" labelledBy="track-a">
        <h2 id="track-a" className={`${h2} mb-6`}>
          Scoring gates (track A)
        </h2>
        <GateTable caption="Track A gate statuses">
          <Row gate="G1" status={g.G1}>
            Coverage {c("v2.result.g1.coverage")} vs required {c("v2.result.g1.required")}.
          </Row>
          <Row gate="G2" status={g.G2}>
            Fails because at least one clause failed. The clauses are listed next.
          </Row>
          <Row gate="G2(a)" status={g.G2a} sub>
            Moon negative controls scored too high: Namib {c("v2.result.g2a.namib")}, Rub&apos; al Khali {c("v2.result.g2a.rak")}, against a maximum of {c("v2.result.g2a.max")}.
          </Row>
          <Row gate="G2(b)" status={g.G2b} sub>
            {c("v2.result.g2b.n_at_or_above")}/{c("v2.result.g2b.n_scorable")} scorable analog sites at or above the {c("v2.result.g2b.percentile")}th percentile:{" "}
            {scorable.map((s, i) => (
              <span key={s.slug}>
                {i > 0 ? ", " : ""}
                {s.name} {s.claim ? c(s.claim) : ""}
              </span>
            ))}
            . {gatedOut.map((s) => s.name).join(" and ")} gated out.
          </Row>
          <Row gate="G2(c)" status={g.G2c} sub>
            The terrain-only baseline reproduces v1 ({c("v2.result.g2c.namib")} / {c("v2.result.g2c.rub")} / {c("v2.result.g2c.mars_median")}). This checks the engine, not the analogy.
          </Row>
          <Row gate="G2, Moon layer two recall" status={g.G2_moon_layer2} sub>
            {r.gate_reasons.G2_moon_layer2}
          </Row>
          <Row gate="G3" status={g.G3}>
            {c("v2.result.g3.total")} supported regions, {supportedTotal === 2 ? "both" : "all"} {supported.map((t) => targetName(t.target)).join(" and ")}. No other target has a supported region.
          </Row>
        </GateTable>
      </Band>

      <Band tone="grid" labelledBy="numbers">
        <h2 id="numbers" className={`${h2} mb-8`}>
          The numbers behind track A
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={card}>
            <Meter
              title="G1: how much of Earth got a thermal value"
              caption="Share of land tiles inside the latitude limits that have a valid MODIS temperature."
              value={num(c("v2.result.coverage_pct"))}
              display={`${c("v2.result.coverage_pct")}%`}
              required={num(c("v2.result.g1.required_pct"))}
              requiredDisplay={`${c("v2.result.g1.required_pct")}%`}
              tone="control"
            />
          </div>
          <div className={card}>
            <BarChart
              title="G2(a): Moon negative controls"
              caption="Percentile of each control. These places should score low."
              rows={[
                { label: "Namib sand sea", value: num(c("v2.result.g2a.namib")), display: c("v2.result.g2a.namib"), tone: "control" },
                { label: "Rub' al Khali", value: num(c("v2.result.g2a.rak")), display: c("v2.result.g2a.rak"), tone: "control" },
              ]}
              reference={{ value: num(c("v2.result.g2a.max")), label: `the maximum allowed, ${c("v2.result.g2a.max")}` }}
            />
          </div>
          <div className={card}>
            <BarChart
              title="G2(b): Mars analog sites that could be scored"
              caption={`Percentile within the Mars set. The gate wanted the ${c("v2.result.g2b.percentile")}th or higher.`}
              rows={scorable.map((s) => ({ label: s.name, value: s.claim ? num(c(s.claim)) : 0, display: s.claim ? c(s.claim) : "", tone: "mars" as const }))}
              reference={{ value: num(c("v2.result.g2b.percentile")), label: `the ${c("v2.result.g2b.percentile")}th percentile` }}
            />
          </div>
          <div className={card}>
            <BarChart
              title="G2(c): terrain-only baseline"
              caption="The same engine rebuilding the v1 scores. They match, which says the engine works and nothing about the analogy."
              rows={[
                { label: "Namib sand sea", value: num(c("v2.result.g2c.namib")), display: c("v2.result.g2c.namib"), tone: "moon" },
                { label: "Rub' al Khali", value: num(c("v2.result.g2c.rub")), display: c("v2.result.g2c.rub"), tone: "moon" },
                { label: "Mars primary median", value: num(c("v2.result.g2c.mars_median")), display: c("v2.result.g2c.mars_median"), tone: "mars" },
              ]}
            />
          </div>
        </div>
      </Band>

      <Band tone="accent" labelledBy="track-d">
        <h2 id="track-d" className={h2}>
          Fitted-model gates (track D)
        </h2>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            {r.d_track_present ? (
              <GateTable caption="Track D gate statuses">
                <Row gate="D1" status={g.D1}>
                  Blocked by the G1 coverage gate: the thermal layer covers {c("v2.result.coverage_pct")}% of land tiles in the band, below the required share of {c("v2.result.g1.required")}.
                </Row>
                <Row gate="D2" status={g.D2}>
                  Blocked by the same coverage gate. Mars numbers are shown as descriptions only.
                </Row>
                <Row gate="Moon recall" status={g.moon_recall}>
                  {r.gate_reasons.moon_recall ? r.gate_reasons.moon_recall.charAt(0).toUpperCase() + r.gate_reasons.moon_recall.slice(1) : ""}. No claim is made about Moon recall.
                </Row>
              </GateTable>
            ) : (
              <p className="text-secondary-foreground">The track D files are not here. Nothing is filled in.</p>
            )}
          </div>
          {r.d_track_present && (
            <div className={`${card} self-center`}>
              <BarChart
                title="Held-out Moon false positives"
                caption="Share of negative tiles the model ranked as top hits. Lower is better, but this is a description, not a passed test."
                max={40}
                rows={[
                  { label: "Terrain only", value: num(c("v2.result.d.fpr.terrain_only")), display: `${c("v2.result.d.fpr.terrain_only")}%`, tone: "moon" },
                  { label: "With thermal layer", value: num(c("v2.result.d.fpr.fitted")), display: `${c("v2.result.d.fpr.fitted")}%`, tone: "positive" },
                  { label: "Chance, low end", value: num(c("v2.result.d.fpr.chance_min")), display: `${c("v2.result.d.fpr.chance_min")}%`, tone: "muted" },
                  { label: "Chance, high end", value: num(c("v2.result.d.fpr.chance_max")), display: `${c("v2.result.d.fpr.chance_max")}%`, tone: "muted" },
                ]}
              />
            </div>
          )}
        </div>
      </Band>

      <section className="space-y-6" aria-labelledby="limits">
        <h2 id="limits" className={h2}>
          Limitations
        </h2>
        <ol className="grid gap-4 md:grid-cols-2">
          {r.limitations.map((l, i) => (
            <li key={l.id} className={`space-y-2 border-border p-5 ${i % 3 === 0 ? "border bg-surface" : "border bg-surface-raised"}`}>
              <p className="font-display text-lg">
                {i + 1}. {l.title}
              </p>
              <p className="text-secondary-foreground">{l.text}</p>
            </li>
          ))}
        </ol>
        <p>
          Source for the audit values:{" "}
          <a href={`${REPO_URL}/blob/main/${r.engine_audit.path}`} className={link}>
            engine audit
          </a>{" "}
          <span className="gsop-mono text-xs text-muted-foreground">({shortHash(r.engine_audit.sha256)})</span>.
        </p>
      </section>

      {r.positive_finding && (
        <Band tone="raised" labelledBy="positive">
          <h2 id="positive" className={h2}>
            The one positive result
          </h2>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <p>{r.positive_finding.text}</p>
              <p className="text-secondary-foreground">{r.positive_finding.model_note}</p>
              <ul className="list-disc space-y-1 pl-6 text-secondary-foreground">
                {r.positive_finding.caveats.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className={`${card} self-start`}>
              <DumbbellChart
                title="Own-tile percentile, before and after the thermal layer"
                caption="Lower is the better answer for these two places, which should not look like a lunar target."
                fromLabel="terrain only"
                toLabel="terrain plus thermal"
                rows={[
                  { label: "Namib sand sea", from: num(c("v2.result.own.namib.before")), to: num(c("v2.result.own.namib.after")), fromDisplay: c("v2.result.own.namib.before"), toDisplay: c("v2.result.own.namib.after") },
                  { label: "Rub' al Khali", from: num(c("v2.result.own.rak.before")), to: num(c("v2.result.own.rak.after")), fromDisplay: c("v2.result.own.rak.before"), toDisplay: c("v2.result.own.rak.after") },
                ]}
              />
            </div>
          </div>
        </Band>
      )}

      <section className="space-y-3" aria-labelledby="where">
        <h2 id="where" className={h2}>
          Where this comes from
        </h2>
        <ul className="list-disc space-y-1 pl-6 text-secondary-foreground">
          {runA && (
            <li>
              Track A: {runA.label}. Stored in {runA.source_file}.
            </li>
          )}
          {runD && (
            <li>
              Track D: {runD.label}. Stored in {runD.source_file}.
            </li>
          )}
          <li>
            Run dates and commits are on the{" "}
            <Link href="/ledger#v2" className={link}>
              ledger page
            </Link>
            . The pre-registration hashes are there too.
          </li>
        </ul>
      </section>
    </>
  );
}
