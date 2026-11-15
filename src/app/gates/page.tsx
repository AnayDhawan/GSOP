import type { Metadata } from "next";
import Link from "next/link";
import { claim, e32Sentence, v2File } from "@/lib/data";
import { shortHash } from "@/lib/format";
import { targetName } from "@/lib/names";
import { REPO_URL } from "@/lib/nav";
import type { GateStatus } from "@/lib/types";

export const metadata: Metadata = { title: "v2 gate results" };

const link = "underline underline-offset-4";
const h2 = "text-2xl";

// Statuses are printed exactly as stored: PASS, FAIL or NOT TESTED. FAIL rows use the failure colour.
function Status({ s }: { s: GateStatus | undefined }) {
  if (!s) return <span className="text-muted-foreground">Not available</span>;
  return <span className={`font-medium ${s === "FAIL" ? "text-control" : ""}`}>{s}</span>;
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

export default function Page() {
  const v2 = v2File();
  const r = v2.results;
  if (!v2.run_completed || !r) {
    return (
      <div className="max-w-4xl space-y-4">
        <h1 className="text-3xl">v2 gate results</h1>
        <p className="text-control">{v2.status_text}</p>
        <p className="text-secondary-foreground">Gate results are not shown because the v2 result files are not here. Nothing is filled in.</p>
      </div>
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
    <div className="max-w-4xl space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl">v2 gate results</h1>
        <ul className="list-disc space-y-1 pl-6 text-secondary-foreground">
          <li>The gates were set in a pre-registration before the v2 scores were computed. G1, G2 and G3 all failed. Nothing is hidden or reordered here.</li>
          <li>The fitted-model tests were not run as pass or fail tests, because the coverage gate failed first.</li>
          <li>The ranking has not been checked against independent data. These are results of a screening method with a published self-audit.</li>
        </ul>
        <blockquote className="border-l-2 border-border pl-4">{e32Sentence()}</blockquote>
      </header>

      <section className="space-y-4" aria-labelledby="track-a">
        <h2 id="track-a" className={h2}>
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
      </section>

      <section className="space-y-4" aria-labelledby="track-d">
        <h2 id="track-d" className={h2}>
          Fitted-model gates (track D)
        </h2>
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
      </section>

      <section className="space-y-4" aria-labelledby="limits">
        <h2 id="limits" className={h2}>
          Limitations
        </h2>
        <ol className="space-y-4">
          {r.limitations.map((l, i) => (
            <li key={l.id} className="space-y-1 border border-border p-4">
              <p className="font-medium">
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
        <section className="space-y-4" aria-labelledby="positive">
          <h2 id="positive" className={h2}>
            The one positive result
          </h2>
          <p>{r.positive_finding.text}</p>
          <p className="text-secondary-foreground">{r.positive_finding.model_note}</p>
          <ul className="list-disc space-y-1 pl-6 text-secondary-foreground">
            {r.positive_finding.caveats.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3" aria-labelledby="where">
        <h2 id="where" className={h2}>
          Where this comes from
        </h2>
        <ul className="list-disc space-y-1 pl-6 text-secondary-foreground">
          {runA && <li>Track A: {runA.label}. Stored in {runA.source_file}.</li>}
          {runD && <li>Track D: {runD.label}. Stored in {runD.source_file}.</li>}
          <li>
            Run dates and commits are on the{" "}
            <Link href="/ledger#v2" className={link}>
              ledger page
            </Link>
            . The pre-registration hashes are there too.
          </li>
        </ul>
      </section>
    </div>
  );
}
