import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import { BarChart } from "../components/Charts";
import PageHero from "../components/PageHero";
import { e32Sentence, ledgerFile, metricsFile, v2File } from "@/lib/data";
import { shortHash, sourceName, statusLabel } from "@/lib/format";
import { targetName, viewName } from "@/lib/names";
import type { LedgerEntry, Metric } from "@/lib/types";

export const metadata: Metadata = { title: "Failure-First Ledger", description: "What failed, where the analogy breaks down, and what is not scored, before any result." };

const RUNS = [
  { id: "moon", label: "Moon" },
  { id: "moon_lat20-40", label: "Moon, latitude band check" },
  { id: "mars", label: "Mars (low confidence)" },
];
const CRITERIA = [
  { key: "primary_median_ge_min", label: "Primary site median" },
  { key: "controls_below_max", label: "Negative controls" },
  { key: "gate_tests_all_rejected", label: "Gate tests" },
];
const GATES = [
  { key: "G1", label: "G1 data coverage" },
  { key: "G2", label: "G2 scoring" },
  { key: "G2a", label: "G2(a) Moon controls" },
  { key: "G2b", label: "G2(b) Mars analog recall" },
  { key: "G2c", label: "G2(c) baseline reproduces v1" },
  { key: "G3", label: "G3 supported regions" },
  { key: "D1", label: "D1 held-out false-positive rate" },
  { key: "D2", label: "D2 Mars leave-one-out recall" },
  { key: "moon_recall", label: "Moon recall" },
] as const;
const CONTROLS = [
  { id: "namib_sand_sea", label: "Namib sand sea" },
  { id: "rub_al_khali", label: "Rub' al Khali" },
  { id: "amazon_basin", label: "Amazon basin" },
  { id: "congo_basin", label: "Congo basin" },
];

function Source({ file, sha }: { file: string; sha: string }) {
  return (
    <p className="gsop-mono text-xs text-muted-foreground [overflow-wrap:anywhere]">
      Source: {sourceName(file)} ({shortHash(sha)})
    </p>
  );
}

function Entry({ e, failed = false }: { e: LedgerEntry; failed?: boolean }) {
  return (
    <li className={`space-y-2 border p-4 ${failed ? "border-control" : "border-border"}`}>
      <p>{e.statement}</p>
      <p className="text-secondary-foreground">
        <span className="gsop-label">What this means for the analogy</span>
        <br />
        {e.what_this_means_for_the_analogy}
      </p>
      <p className="gsop-label">
        {statusLabel(e.status)}
        {e.provisional ? " | Provisional" : ""}
      </p>
      <Source file={e.source_file} sha={e.sha256} />
    </li>
  );
}

export default function Page() {
  const ledger = ledgerFile();
  const metrics = metricsFile().metrics;
  const byId = new Map<string, Metric>(metrics.map((m) => [m.id, m]));
  const m = (id: string): Metric => {
    const v = byId.get(id);
    if (!v) throw new Error(`metrics.json has no ${id}`);
    return v;
  };
  const of = (type: LedgerEntry["type"]) => ledger.entries.filter((e) => e.type === type);
  const failedControls = of("failed_control");
  const limits = of("known_limit");
  const terrainOnly = limits.filter((e) => e.id === "known_limit.moon_terrain_only");
  const otherLimits = limits.filter((e) => e.id !== "known_limit.moon_terrain_only");
  const unscored = of("unscored_property");
  const physical = of("physical_difference");
  const hashes = ledger.meta.preregistration_hashes as Record<string, string>;
  const v2 = v2File();
  const layers = new Map<string, { site: string; layer: string; product: string; status: string }>();
  for (const r of v2.thermal_refs?.rows ?? []) {
    const k = `${r.site}|${r.layer}`;
    const have = layers.get(k);
    const status = r.status === "value" || r.status === "label" ? "Values stored" : "Not covered";
    if (!have || (have.status === "Not covered" && status === "Values stored")) layers.set(k, { site: r.site, layer: r.layer, product: r.product === "none" ? "none" : r.product, status });
  }

  return (
    <>
      <PageHero title="Failure-First Ledger" lede="What failed, where the analogy breaks down, and what the score never looked at. It comes before the results on purpose." />

      <div className="grid gap-8 md:grid-cols-[3fr_2fr]">
        <div className="space-y-3">
          <p className="text-lg">v1 is an earlier analysis whose criteria were fixed before it ran. Several of them failed or could not be tested.</p>
          <p className="text-secondary-foreground">Nothing here is a success claim. The ranking has not been checked against independent data.</p>
        </div>
        <blockquote className="self-start border-l-2 border-border pl-4 text-sm">{e32Sentence()}</blockquote>
      </div>

      <Band tone="plain" labelledBy="failed">
        <div className="space-y-4">
        <h2 id="failed" className="text-3xl">
          What failed
        </h2>
        <ul className="space-y-4">
          {failedControls.map((e) => (
            <Entry key={e.id} e={e} failed />
          ))}
        </ul>

        <h3 className="text-lg">Pre-registered criteria, by run</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium">Run</th>
                {CRITERIA.map((c) => (
                  <th key={c.key} className="py-2 pr-4 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="py-2 pr-4 font-medium">All criteria passed</th>
              </tr>
            </thead>
            <tbody>
              {RUNS.map((r) => (
                <tr key={r.id} className="border-b border-border align-top">
                  <th scope="row" className="py-2 pr-4 font-medium">
                    {r.label}
                  </th>
                  {CRITERIA.map((c) => {
                    const v = m(`${r.id}.status.${c.key}`).display;
                    return (
                      <td key={c.key} className={`py-2 pr-4 ${v === "fail" ? "text-control" : ""}`}>
                        {statusLabel(v)}
                      </td>
                    );
                  })}
                  <td className="py-2 pr-4">{statusLabel(m(`${r.id}.all_criteria_passed`).display)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Source file={m("moon.status.controls_below_max").source_file} sha={m("moon.status.controls_below_max").sha256} />

        <h3 className="text-lg">Negative controls</h3>
        <p className="text-secondary-foreground">
          Controls are places that should score low. Scores are percentiles among scored tiles. The pre-registered maximum was percentile{" "}
          {m("moon.criterion.negative_control_rank_pct_max").display}.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium">Control</th>
                <th className="py-2 pr-4 font-medium">Moon run</th>
                <th className="py-2 pr-4 font-medium">Mars run</th>
              </tr>
            </thead>
            <tbody>
              {CONTROLS.map((c) => {
                const moonScore = byId.get(`moon.control.${c.id}.rank_pct`);
                const moonStatus = byId.get(`moon.control.${c.id}.status`);
                const marsStatus = byId.get(`mars.control.${c.id}.status`);
                return (
                  <tr key={c.id} className="border-b border-border">
                    <th scope="row" className="py-2 pr-4 font-medium">
                      {c.label}
                    </th>
                    <td className={`py-2 pr-4 ${moonScore ? "text-control" : ""}`}>
                      {moonScore ? `Percentile ${moonScore.display}` : moonStatus ? statusLabel(moonStatus.display) : "Not run"}
                    </td>
                    <td className="py-2 pr-4">{marsStatus ? statusLabel(marsStatus.display) : "Not run"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-secondary-foreground">
          Mars primary site median: percentile {m("mars.primary_median_rank_pct").display}, against a pre-registered minimum of percentile{" "}
          {m("mars.criterion.primary_median_rank_pct_min").display}.
        </p>
        <div className="grid gap-6 border border-border bg-surface p-5 md:grid-cols-2">
          <BarChart
            title="Moon negative controls"
            caption="Percentile in the Moon run. These places should score low."
            rows={CONTROLS.filter((c) => byId.get(`moon.control.${c.id}.rank_pct`)).map((c) => ({ label: c.label, value: Number(m(`moon.control.${c.id}.rank_pct`).display), display: m(`moon.control.${c.id}.rank_pct`).display, tone: "control" as const }))}
            reference={{ value: Number(m("moon.criterion.negative_control_rank_pct_max").display), label: `the pre-registered maximum, ${m("moon.criterion.negative_control_rank_pct_max").display}` }}
          />
          <BarChart
            title="Mars primary sites"
            caption="Median percentile of the primary sites. These should score high."
            rows={[{ label: "Median percentile", value: Number(m("mars.primary_median_rank_pct").display), display: m("mars.primary_median_rank_pct").display, tone: "mars" }]}
            reference={{ value: Number(m("mars.criterion.primary_median_rank_pct_min").display), label: `the pre-registered minimum, ${m("mars.criterion.primary_median_rank_pct_min").display}` }}
          />
        </div>
        <Source file={m("moon.control.namib_sand_sea.rank_pct").source_file} sha={m("moon.control.namib_sand_sea.rank_pct").sha256} />
        </div>
      </Band>

      <Band tone="grid" labelledBy="terrain">
        <div className="space-y-4">
        <h2 id="terrain" className="text-3xl">
          The Moon score is terrain only
        </h2>
        <ul className="space-y-4">
          {terrainOnly.map((e) => (
            <Entry key={e.id} e={e} />
          ))}
        </ul>
        <div className="border border-border bg-surface p-5">
          <BarChart
            title="Top group with and without the illumination term"
            caption="Share of the top tiles that stay in the top group when the illumination weight is removed. A value near one means the term changed almost nothing."
            max={1}
            rows={metrics
              .filter((x) => x.id.startsWith("terrain_only.") && x.id.endsWith(".illumination_weight"))
              .map((w) => {
                const view = w.id.split(".")[1];
                const d = m(`terrain_only.${view}.overlap_without_illumination`).display;
                return { label: viewName(view), value: Number(d), display: d, tone: "moon" as const };
              })}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium">Moon view</th>
                <th className="py-2 pr-4 font-medium">Illumination weight</th>
                <th className="py-2 pr-4 font-medium">Highest lighting match on any tile</th>
                <th className="py-2 pr-4 font-medium">Overlap without illumination</th>
              </tr>
            </thead>
            <tbody>
              {metrics
                .filter((x) => x.id.startsWith("terrain_only.") && x.id.endsWith(".illumination_weight"))
                .map((w) => {
                  const view = w.id.split(".")[1];
                  return (
                    <tr key={view} className="border-b border-border">
                      <th scope="row" className="py-2 pr-4 font-medium">
                        {viewName(view)}
                      </th>
                      <td className="py-2 pr-4">{w.display}</td>
                      <td className="py-2 pr-4">{m(`terrain_only.${view}.illum_match_max`).display}</td>
                      <td className="py-2 pr-4">{m(`terrain_only.${view}.overlap_without_illumination`).display}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        </div>
      </Band>

      <Band tone="raised" labelledBy="breaks">
        <div className="space-y-4">
        <h2 id="breaks" className="text-3xl">
          Where the analogy breaks down
        </h2>
        <p className="text-secondary-foreground">
          These physical differences come from the v1 limits ledger. Most entries are provisional and have not been verified by us.
        </p>
        <ul className="grid gap-4 md:grid-cols-2">
          {physical.map((e) => (
            <Entry key={e.id} e={e} />
          ))}
        </ul>
        </div>
      </Band>

      <Band tone="plain" labelledBy="unscored">
        <div className="space-y-4">
        <h2 id="unscored" className="text-3xl">
          What is not scored
        </h2>
        {(["moon", "mars"] as const).map((b) => (
          <div key={b} className="space-y-3">
            <h3 className="text-lg">{b === "moon" ? "Moon" : "Mars"}</h3>
            <ul className="grid gap-4 md:grid-cols-2">
              {unscored
                .filter((e) => e.body === b)
                .map((e) => (
                  <Entry key={e.id} e={e} />
                ))}
            </ul>
          </div>
        ))}
        </div>
      </Band>

      <Band tone="accent" labelledBy="other">
        <div className="space-y-4">
        <h2 id="other" className="text-3xl">
          Other known limits
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {otherLimits.map((e) => (
            <Entry key={e.id} e={e} />
          ))}
        </ul>
        </div>
      </Band>

      <Band tone="raised" labelledBy="v2">
        <div className="space-y-4">
        <h2 id="v2" className="text-3xl">
          The v2 run
        </h2>
        <p className={v2.run_completed ? "" : "text-control"}>{v2.status_text}</p>
        <p className="text-secondary-foreground">
          {v2.run_completed
            ? "The v2 result files are present. Their hashes are in the data manifest. The gate statuses are below and in full on the gates page."
            : "Gate results for v2 are not shown because the run has no result files here. Nothing is filled in."}
        </p>
        {v2.results && (
          <div className="space-y-4">
            <ul className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
              {GATES.filter((k) => v2.results?.gate_statuses[k.key]).map((k) => {
                const st = v2.results?.gate_statuses[k.key];
                return (
                  <li key={k.key} className="flex justify-between gap-4 border-b border-border py-1">
                    <span>{k.label}</span>
                    <span className={`font-medium ${st === "FAIL" ? "text-control" : ""}`}>{st}</span>
                  </li>
                );
              })}
            </ul>
            <p>
              <Link href="/gates" className="underline underline-offset-4">
                Read the full gate results, the limitations and the one positive result
              </Link>
              .
            </p>
            <h3 className="text-lg">Run record</h3>
            <ul className="space-y-2 text-sm">
              {v2.results.runs.map((run) => (
                <li key={run.track} className="border border-border p-3">
                  <p className="font-medium">{run.label}</p>
                  <p className="text-secondary-foreground">
                    Branch <span className="gsop-mono">{run.branch}</span>, commit <span className="gsop-mono">{shortHash(run.commit)}</span>
                    {run.engine_commit ? (
                      <>
                        , engine commit <span className="gsop-mono">{run.engine_commit}</span> (not on the public repository)
                      </>
                    ) : null}
                    . Last updated {run.updated_ist}. Stage: {run.stage}.
                  </p>
                  <Source file={run.source_file} sha={run.sha256} />
                </li>
              ))}
            </ul>
            <h3 className="text-lg">v2 ledger entries</h3>
            <p className="text-secondary-foreground">Sources used, limits and unscored properties, as recorded by each track. Statements are quoted from the track ledgers.</p>
            {(["A", "D"] as const).map((track) => {
              const rows = v2.results?.ledger.filter((e) => e.track === track) ?? [];
              if (rows.length === 0) return null;
              return (
                <div key={track} className="space-y-2">
                  <h4 className="font-medium">{track === "A" ? "Track A: Earth thermal layer and gates" : "Track D: fitted thermal terms"}</h4>
                  <ul className="space-y-3">
                    {rows.map((e) => (
                      <li key={`${e.track}-${e.id}`} className="space-y-1 border border-border p-3 text-sm">
                        <p>{e.statement}</p>
                        {e.note && <p className="text-secondary-foreground">{e.note}</p>}
                        <p className="gsop-label">
                          {statusLabel(e.status)} | {e.type.replace(/_/g, " ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        {v2.preregistrations.length > 0 && (
          <ul className="space-y-2 text-sm">
            {v2.preregistrations.map((p) => (
              <li key={p.id} className="border border-border p-3">
                <p className="font-medium">{p.title}</p>
                <p className="gsop-mono break-all text-xs">{p.actual_sha256}</p>
                <p className={p.matches === false ? "text-control" : "text-secondary-foreground"}>
                  {p.matches === true ? "The recorded hash matches the document." : p.matches === false ? "The recorded hash does not match the document." : "No recorded hash was found for this document."}
                  {p.deviations_file ? " A deviations file is recorded for it." : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        {layers.size > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg">Thermal reference layers for the targets</h3>
            <p className="text-secondary-foreground">Context for the Moon and Mars targets, compared only by rank inside each body. Earth cannot reach polar lunar temperatures. A layer marked not covered has no value in this run.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Thermal reference layers and their coverage</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 pr-4 font-medium">Target</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Layer</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Product</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {[...layers.values()]
                    .sort((a, b) => a.site.localeCompare(b.site) || a.layer.localeCompare(b.layer))
                    .map((l) => (
                      <tr key={`${l.site}-${l.layer}`} className="border-b border-border align-top">
                        <th scope="row" className="py-2 pr-4 font-medium">
                          {targetName(l.site)}
                        </th>
                        <td className="py-2 pr-4">{l.layer.replace(/_/g, " ")}</td>
                        <td className="py-2 pr-4">{l.product}</td>
                        <td className={`py-2 pr-4 ${l.status === "Not covered" ? "text-control" : ""}`}>{l.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </Band>

      <Band tone="plain" labelledBy="prereg">
        <div className="space-y-4">
        <h2 id="prereg" className="text-3xl">
          Pre-registration
        </h2>
        <p className="text-secondary-foreground">
          The criteria were written down before results were computed. The hash identifies that record. It does not mean the test was passed.
        </p>
        <ul className="space-y-1">
          {Object.entries(hashes).map(([run, h]) => (
            <li key={run} className="gsop-mono break-all text-xs">
              {run}: {h}
            </li>
          ))}
        </ul>
        <p>
          See the{" "}
          <Link href="/method" className="underline underline-offset-4">
            method page
          </Link>{" "}
          for what the screening does.
        </p>
        </div>
      </Band>
    </>
  );
}
