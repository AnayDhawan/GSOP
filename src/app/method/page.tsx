import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import { BarChart } from "../components/Charts";
import PageHero from "../components/PageHero";
import { claim, e32Sentence, hasClaim, v2File } from "@/lib/data";
import { group } from "@/lib/format";
import { viewName } from "@/lib/names";
import LimitsDoc from "./LimitsDoc";

export const metadata: Metadata = { title: "Methods and limits", description: "How GSOP scores Earth tiles against a lunar or Martian target, and what that score cannot see." };

const link = "underline underline-offset-4";
const ul = "list-disc space-y-2 pl-6";
const h2 = "text-3xl";
const h3 = "font-display text-lg";
const card = "space-y-3 border border-border bg-surface p-5";

const VIEWS = [
  "connecting_ridge_c1__base",
  "connecting_ridge_c1__landing_mobility",
  "connecting_ridge_c1__power_night",
  "shackleton_rim__base",
  "shackleton_rim__landing_mobility",
  "shackleton_rim__power_night",
  "jezero__base",
  "jezero__ice_resources",
  "jezero__landing_mobility",
  "jezero__power_night",
];

const GLOSSARY: [string, string][] = [
  ["Tile", "One equal-area cell of the Earth grid. Each gets at most one score per target."],
  ["Gate", "A rule that removes a tile before scoring: water or ice, vegetation, built or farmed land, or missing data."],
  ["Percentile", "The share of scored tiles in a view with a lower score than this one."],
  ["Flag", "A tile that stays in the top group across most Monte Carlo runs. It measures stability, not correctness."],
  ["Negative control", "A place that should score low. A high score means the ranking cannot tell it from a good match."],
  ["Pre-registration", "A written plan of the criteria, fixed before results were computed."],
  ["Reference site", "A place named as an analog in our list. It is not a scored result."],
  ["Candidate", "A tile, region or suggested place that is not in our reference list. Unreviewed."],
  ["Provisional", "Not yet checked by us. Most ledger entries are provisional."],
];

export default function Page() {
  const v2 = v2File();
  const doc = (id: string) => v2.limits_docs.find((d) => d.id === id);
  const refs = doc("refs_limits");
  const runs = claim("metrics.view.shackleton_rim__base.runs");
  const p5 = claim("method.top_fraction_five_pct");
  const p90 = claim("method.min_run_share_pct");
  const area = claim("regions.tile_area_km2");
  const radius = claim("lookup.match_radius_km");
  const minTiles = claim("regions.min_tiles");
  const dropKm = claim("regions.drop_distance_km");
  const topN = claim("regions.top_n");
  const nearKm = claim("regions.near_km");
  const terrainShare = claim("metrics.earth.share_land_tiles_with_terrain");
  const unconfirmed = claim("ledger.moon.unconfirmed_sites");
  const maxControl = claim("metrics.moon.criterion.negative_control_rank_pct_max");
  const minMedian = claim("metrics.mars.criterion.primary_median_rank_pct_min");
  const namib = claim("metrics.moon.control.namib_sand_sea.rank_pct");
  const rub = claim("metrics.moon.control.rub_al_khali.rank_pct");
  const marsMedian = claim("metrics.mars.primary_median_rank_pct");
  const illumWeight = claim("metrics.terrain_only.shackleton_rim__base.illumination_weight");
  const illumMax = claim("metrics.terrain_only.shackleton_rim__base.illum_match_max");
  const gated = VIEWS.filter((v) => hasClaim(`metrics.view.${v}.n_gated_tiles`)).map((v) => ({ v, display: claim(`metrics.view.${v}.n_gated_tiles`) }));
  const gatedMax = Math.max(...gated.map((g) => Number(g.display)));

  return (
    <>
      <PageHero title="Methods and limits" lede="How GSOP scores Earth tiles against a lunar or Martian target, and the long list of things that score cannot see." />

      <div className="grid items-start gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-lg">GSOP scores every land tile on Earth by how closely its terrain matches a lunar or Martian target, then ranks the tiles. It tells you where to look, not where to go.</p>
          <ul className={`${ul} text-secondary-foreground`}>
            <li>The Moon score is effectively terrain only. Mars is a low-confidence secondary result.</li>
            <li>
              The method failed its own pre-registered negative-control test. The{" "}
              <Link href="/ledger" className={link}>
                Failure-First Ledger
              </Link>{" "}
              lists every failure first, and so does this page.
            </li>
            <li>The ranking has not been checked against independent data.</li>
          </ul>
        </div>
        <figure className="space-y-2">
          <div className="border border-border bg-[#000a30] p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/data/overlays/shackleton_rim.png" alt="World map in which land tiles that have a v1 score for the Shackleton rim target are coloured from purple (low) to yellow (high). Large regions have no score." width={3600} height={1383} className="h-auto w-full" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/data/overlays/legend.png" alt="Colour scale from a low score (dark purple) to a high score (yellow)" width={512} height={64} className="h-auto w-64 max-w-full" />
          <figcaption className="text-sm text-secondary-foreground">Where v1 produced a score for the Shackleton rim target. Blank land was gated out or had no data, which is not the same as a low score.</figcaption>
        </figure>
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-[1fr_2fr]" aria-labelledby="question">
        <h2 id="question" className={h2}>
          The question
        </h2>
        <div className="space-y-3">
          <p>The challenge asks for Earth places that could stand in for candidate Moon-base locations or Mars landing and exploration sites. It also asks what makes a place analogous, where the analogy breaks down, and how studying it could help.</p>
          <p className="text-secondary-foreground">GSOP answers one narrow part: which Earth places have terrain like a lunar or Martian target, using open data. It does not say what to test at a place. An analog is useful only for the properties that match, and the ones that do not are on the ledger and in the limits below.</p>
        </div>
      </section>

      <Band tone="raised" labelledBy="limits">
        <h2 id="limits" className={`${h2} mb-8`}>
          Limits
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={card}>
            <h3 className={h3}>What the score cannot see</h3>
            <ul className={ul}>
              <li>
                The Moon score is effectively terrain only. The illumination family was given a weight of {illumWeight}, but the highest lighting match on any Earth tile is {illumMax}, so it changes nothing.
              </li>
              <li>Gravity, air pressure, dust, radiation and regolith are not scored. Neither are temperature, rock composition and thermal inertia for the Moon, or water, dust and temperature for Mars.</li>
              <li>An Earth place can match a target&apos;s terrain and still differ in everything else that matters for a mission. The ledger lists those differences, most of them provisional.</li>
            </ul>
          </div>
          <div className={card}>
            <h3 className={h3}>Data limits</h3>
            <ul className={ul}>
              <li>Only tiles that passed the land-cover and data gates have a score. Water and ice, vegetated tiles, built or farmed tiles and tiles without data are left out, so large regions never appear.</li>
              <li>Terrain data exist for a share of {terrainShare} of land tiles. Tiles without terrain data are never scored. The coverage report names tiles beyond the reach of the main elevation dataset as part of the gap but does not explain all of it.</li>
              <li>Earth slope is not corrected for the map projection, so it reads too steep toward the equator and too gentle toward the poles. A latitude band check was run to see whether the ranking holds.</li>
              <li>Terrain data change source at the northern edge of the main elevation dataset, and roughness steps up across that seam.</li>
              <li>The coordinates of {unconfirmed} of the sites v1 used are not confirmed from a primary source.</li>
            </ul>
          </div>
          <div className="space-y-3 border-l-4 border-control bg-surface-raised p-5">
            <h3 className={h3}>Result limits</h3>
            <ul className={ul}>
              <li>
                Two negative controls scored high on the Moon run: the Namib sand sea at percentile {namib} and the Rub&apos; al Khali at percentile {rub}, against a pre-registered maximum of percentile {maxControl}.
              </li>
              <li>
                On the Mars run the median percentile of the primary sites was {marsMedian}, below the pre-registered minimum of percentile {minMedian}. The Moon primary-site criterion could not be tested.
              </li>
              <li>The score bands come from varying the weights and not the Earth data, so they understate the real uncertainty. The uncertainty section below prints the full statement.</li>
              <li>Everything from v1 is provisional.</li>
            </ul>
          </div>
          <div className={card}>
            <h3 className={h3}>Site and region limits</h3>
            <ul className={ul}>
              <li>Reference sites come from a teammate-supplied list. Their text is teammate-written and unreviewed, and no source has been checked yet.</li>
              <li>Regions and tiles are candidates not in our reference list. They are unreviewed.</li>
              <li>
                Region names are labels from Natural Earth, which is generalised: the desert, plateau or range the centre lies in, one whose outline is within {nearKm} km, or else the nearest populated place. A name is not a claim about the ground.
              </li>
            </ul>
          </div>
        </div>
      </Band>

      <section className="grid items-start gap-10 md:grid-cols-2" aria-labelledby="control-chart">
        <div className="space-y-3">
          <h2 id="control-chart" className={h2}>
            The two tests v1 failed
          </h2>
          <p className="text-secondary-foreground">
            Before any result existed, v1 set a ceiling for the negative controls and a floor for the Mars primary sites. The bars show where they landed. The vertical line is the limit we wrote down.
          </p>
        </div>
        <div className="space-y-8 border border-border bg-surface p-5">
          <BarChart
            title="Moon negative controls"
            caption="Should score low."
            rows={[
              { label: "Namib sand sea", value: Number(namib), display: namib, tone: "control" },
              { label: "Rub' al Khali", value: Number(rub), display: rub, tone: "control" },
            ]}
            reference={{ value: Number(maxControl), label: `the maximum we allowed, ${maxControl}` }}
          />
          <BarChart
            title="Mars primary sites"
            caption="Should score high."
            rows={[{ label: "Median percentile", value: Number(marsMedian), display: marsMedian, tone: "mars" }]}
            reference={{ value: Number(minMedian), label: `the minimum we wanted, ${minMedian}` }}
          />
        </div>
      </section>

      <Band tone="grid" labelledBy="works">
        <h2 id="works" className={`${h2} mb-8`}>
          How the screening works
        </h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Tiles", `Land is split into equal-area tiles of ${area} square kilometres each.`],
            ["Gates", "Tiles that are water or ice, vegetated, built or farmed, or that lack data are removed."],
            ["Targets", "The Moon targets are Connecting Ridge C1 and the Shackleton rim at the south pole. The Mars target is Jezero."],
            ["Features", "The Moon score uses slope, illumination, roughness and relief. The Mars score uses sunlight, slope, relief and air density."],
            ["Score", "Each tile gets a similarity to the target, where higher means more similar. Three purpose profiles weight the features differently: base, landing and mobility, and power and night."],
            ["Monte Carlo", `${runs} runs vary the weights. For the Moon they also vary the slope and relief measurement error.`],
            ["Flag", `A tile is flagged when it is in the top ${p5}% of scores in at least ${p90}% of runs. This measures stability to the weights, not whether the ranking is right.`],
            ["Sites", `A site gets the score of the best-scoring scored tile within ${radius} km. Its percentile is the share of scored tiles in that view with a lower score. This is a lookup of stored values, not a test.`],
            ["Regions", `Neighbouring flagged tiles are joined. Groups under ${minTiles} tiles and groups within ${dropKm} km of a reference site are dropped. Each target lists its top ${topN} regions by median score.`],
            ["This site", "Pages read stored results. Nothing here recomputes a score, and every number traces to a source file and hash."],
          ].map(([t, body]) => (
            <li key={t} className="space-y-2 border border-border bg-surface p-4">
              <p className="font-display text-lg">{t}</p>
              <p className="text-sm text-secondary-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </Band>

      <section className="grid items-start gap-10 md:grid-cols-2" aria-labelledby="gated">
        <div className="space-y-3">
          <h2 id="gated" className={h2}>
            How many tiles survive the gates
          </h2>
          <p className="text-secondary-foreground">Each view is one target and one purpose profile. The count is the tiles that passed the gates and got a score. Bars are drawn to one scale, so the differences between profiles look small. The numbers beside the bars are exact.</p>
        </div>
        <div className="border border-border bg-surface p-5">
          <BarChart
            title="Scored tiles per view"
            rows={gated.map((g) => ({ label: viewName(g.v), value: Number(g.display), display: group(g.display), tone: g.v.startsWith("jezero") ? "mars" : "moon" }))}
            max={gatedMax}
          />
        </div>
      </section>

      <Band tone="accent" labelledBy="checks">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <h2 id="checks" className={h2}>
            Checks fixed before the run
          </h2>
          <ul className={ul}>
            <li>Before results were computed, v1 fixed three criteria: the primary sites must rank high, the negative controls must rank low, and obviously unsuitable ground must be rejected by the gates.</li>
            <li>Pre-registration hashes are on the ledger. A hash identifies the plan. It does not mean the plan was met.</li>
            <li>
              Result: the controls failed, the Moon primary criterion could not be tested, the Mars primary criterion failed, and the gate tests passed. See the{" "}
              <Link href="/ledger" className={link}>
                ledger
              </Link>{" "}
              for the numbers and what each means for the analogy.
            </li>
          </ul>
        </div>
      </Band>

      <section className="space-y-4" aria-labelledby="what">
        <h2 id="what" className={h2}>
          What each score uses
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Features used and not used, by body</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-medium">Body</th>
                <th scope="col" className="py-2 pr-4 font-medium">Used in the score</th>
                <th scope="col" className="py-2 pr-4 font-medium">Not scored</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border align-top">
                <th scope="row" className="py-2 pr-4 font-medium">Moon</th>
                <td className="py-2 pr-4">Slope, illumination (no effect), roughness, relief</td>
                <td className="py-2 pr-4">Water or ice, composition, temperature, thermal inertia</td>
              </tr>
              <tr className="border-b border-border align-top">
                <th scope="row" className="py-2 pr-4 font-medium">Mars (low confidence)</th>
                <td className="py-2 pr-4">Sunlight, slope, relief, air density</td>
                <td className="py-2 pr-4">Roughness, composition, water, dust, temperature, thermal inertia</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Band tone="raised" labelledBy="v2">
        <div className="max-w-4xl space-y-4">
          <h2 id="v2" className={h2}>
            The v2 limits
          </h2>
          <p className={v2.run_completed ? "" : "text-control"}>{v2.status_text}</p>
          {v2.results && (
            <p className="text-secondary-foreground">
              The v2 gate results and the limitations of the v2 run are on the{" "}
              <Link href="/gates" className={link}>
                gates page
              </Link>
              .
            </p>
          )}
          {refs ? (
            <>
              <p className="text-secondary-foreground">The reference thermal layers give context for the Moon and Mars targets. This is where each layer cannot match Earth, as written with the data.</p>
              <details className="border border-border bg-surface p-4" open>
                <summary className="cursor-pointer font-display text-lg">{refs.title}</summary>
                <div className="mt-3">
                  <LimitsDoc blocks={refs.blocks} />
                </div>
              </details>
            </>
          ) : (
            <p className="text-muted-foreground">The thermal reference limits are not available.</p>
          )}
          {(["evidence_limits", "data_resources"] as const).map((id) => {
            const d = doc(id);
            return d ? (
              <details key={id} className="border border-border bg-surface p-4" open>
                <summary className="cursor-pointer font-display text-lg">{d.title}</summary>
                <div className="mt-3">
                  <LimitsDoc blocks={d.blocks} />
                </div>
              </details>
            ) : (
              <p key={id} className="text-muted-foreground">
                {id === "evidence_limits" ? "Site evidence limits: not available yet. The evidence run has not produced them." : "Data resource table: not available yet."}
              </p>
            );
          })}
        </div>
      </Band>

      <section className="space-y-3" aria-labelledby="uncertainty">
        <h2 id="uncertainty" className={h2}>
          Uncertainty
        </h2>
        <blockquote className="max-w-3xl border-l-2 border-border pl-4 text-lg">{e32Sentence()}</blockquote>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-[1fr_2fr]" aria-labelledby="data">
        <h2 id="data" className={h2}>
          Data and reproducibility
        </h2>
        <ul className={ul}>
          <li>One build command turns the stored results into the data files this site reads. A second run gives identical files.</li>
          <li>Every number on a page has a row in a claims file that names its source file and hash. A check on every change fails on banned wording, an unsourced number or an altered uncertainty sentence.</li>
          <li>
            The open data behind the scores are on the{" "}
            <Link href="/credits" className={link}>
              data credits page
            </Link>
            .
          </li>
          <li>Anything v1 did not store reads &quot;not in v1 outputs&quot;. Nothing is estimated.</li>
        </ul>
      </section>

      <Band tone="grid" labelledBy="glossary">
        <h2 id="glossary" className={`${h2} mb-8`}>
          Glossary
        </h2>
        <dl className="grid gap-4 md:grid-cols-3">
          {GLOSSARY.map(([term, def]) => (
            <div key={term} className="border border-border bg-surface p-4">
              <dt className="font-display text-lg">{term}</dt>
              <dd className="mt-1 text-sm text-secondary-foreground">{def}</dd>
            </div>
          ))}
        </dl>
      </Band>
    </>
  );
}
