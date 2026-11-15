import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import { BarChart } from "../components/Charts";
import PageHero from "../components/PageHero";
import { claim, e32Sentence } from "@/lib/data";
import { mapData } from "@/lib/map-data";
import HonestMap from "./HonestMap";

export const metadata: Metadata = { title: "Honest Map", description: "Where v1 produced a similarity score for a lunar or Martian target, with the negative controls that failed marked in red." };

const link = "underline underline-offset-4";

export default function Page() {
  const { targets, controlMax } = mapData();
  const namib = claim("metrics.moon.control.namib_sand_sea.rank_pct");
  const rub = claim("metrics.moon.control.rub_al_khali.rank_pct");
  const marsMedian = claim("metrics.mars.primary_median_rank_pct");
  const marsMin = claim("metrics.mars.criterion.primary_median_rank_pct_min");
  return (
    <>
      <PageHero title="Honest Map" lede="Where v1 produced a similarity score for one lunar or Martian target, drawn over a satellite picture of Earth. The places that should have scored low are marked in red." />

      <div className="grid gap-6 md:grid-cols-3">
        <p className="border-l-4 border-control pl-4">
          Two negative controls scored high on the Moon run. Read the{" "}
          <Link href="/ledger" className={link}>
            Failure-First Ledger
          </Link>{" "}
          before you trust a colour.
        </p>
        <p className="border-l-4 border-positive pl-4">Regions and tiles are candidates not in our reference list. They are unreviewed.</p>
        <p className="border-l-4 border-border pl-4">The Moon score is effectively terrain only. Mars is a low-confidence secondary result. The ranking has not been checked against independent data.</p>
      </div>

      <div className="mt-10">
        <HonestMap targets={targets} sentence={e32Sentence()} controlMax={controlMax} />
      </div>

      <Band tone="grid" labelledBy="map-numbers">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-3">
            <h2 id="map-numbers" className="text-3xl">
              What the red markers mean in numbers
            </h2>
            <p className="text-secondary-foreground">
              A negative control is a place that should look nothing like a lunar target. The pre-registered limit was percentile {controlMax}. On the Moon run both controls landed far above it, and the Mars primary sites landed below the minimum we wanted.
            </p>
          </div>
          <div className="space-y-8 border border-border bg-surface p-5">
            <BarChart
              title="Moon negative controls, v1"
              caption="Percentile of each control in the Shackleton rim ranking."
              rows={[
                { label: "Namib sand sea", value: parseFloat(namib), display: namib, tone: "control" },
                { label: "Rub' al Khali", value: parseFloat(rub), display: rub, tone: "control" },
              ]}
              reference={{ value: parseFloat(controlMax), label: `the pre-registered maximum, ${controlMax}` }}
            />
            <BarChart
              title="Mars primary sites, v1"
              caption="Median percentile of the primary sites against the minimum we set."
              rows={[{ label: "Median of primary sites", value: parseFloat(marsMedian), display: marsMedian, tone: "mars" }]}
              reference={{ value: parseFloat(marsMin), label: `the pre-registered minimum, ${marsMin}` }}
            />
          </div>
        </div>
      </Band>
    </>
  );
}
