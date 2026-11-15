import type { Metadata } from "next";
import Band from "../components/Band";
import { Meter } from "../components/Charts";
import PageHero from "../components/PageHero";
import PagePhoto from "../components/PagePhoto";
import { claim, v2File } from "@/lib/data";
import { sourcesUsed, type SourceRow } from "@/lib/pages-data";

export const metadata: Metadata = {
  title: "Data sources",
  description: "Every dataset behind the GSOP scores: where it comes from, what it contributed, its resolution or window, and the coverage limit of the Earth thermal layer.",
};

const link = "underline underline-offset-4";
const BODIES: { body: string; title: string; edge: string }[] = [
  { body: "Earth", title: "Earth", edge: "border-earth" },
  { body: "Moon", title: "Moon", edge: "border-moon" },
  { body: "Mars", title: "Mars", edge: "border-mars" },
  { body: "Display", title: "Display only", edge: "border-border" },
];

function Table({ rows, caption }: { rows: SourceRow[]; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="py-2 pr-4 font-medium">Source</th>
            <th scope="col" className="py-2 pr-4 font-medium">Contributed</th>
            <th scope="col" className="py-2 pr-4 font-medium">Resolution or window</th>
            <th scope="col" className="py-2 pr-4 font-medium">Used in</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border align-top">
              <th scope="row" className="py-2 pr-4 font-medium">
                <a href={r.url} className={link} target="_blank" rel="noopener noreferrer">
                  {r.name}
                </a>
                <span className="block font-normal text-secondary-foreground">{r.provider}</span>
              </th>
              <td className="py-2 pr-4">{r.contributes}</td>
              <td className="py-2 pr-4">{r.resolution_or_window}</td>
              <td className="py-2 pr-4 text-secondary-foreground">{r.used_in}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  const rows = sourcesUsed();
  const v2 = v2File();
  const cov = v2.results?.limitations.find((l) => l.id === "coverage");
  return (
    <>
      <PageHero
        title="Data sources"
        lede="Every source below fed a result shown on this site, and every source we used is listed. The list is one file in the repository, data/sources_used.csv, and the footer credits read the same file."
      />

      <p className="max-w-3xl text-secondary-foreground">Each dataset keeps its provider&apos;s licence. We do not redistribute the raw files.</p>

      <Band tone="accent" labelledBy="caveat">
        <h2 id="caveat" className="mb-6 text-2xl">
          Quality and coverage caveat
        </h2>
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div className="space-y-3">
            <p>
              Coverage share {claim("v2.result.g1.coverage")} against a required {claim("v2.result.g1.required")}. Gate G1 is <strong>{v2.results?.gate_statuses.G1 ?? "not available"}</strong>.
            </p>
            {cov ? <p className="text-secondary-foreground">{cov.text}</p> : null}
            <p className="text-secondary-foreground">
              Tiles with no thermal value are not scored, so a place in an excluded region has no v2 score. Skin temperature at satellite overpass is not air temperature, and cloud gaps remain.
            </p>
          </div>
          <Meter
            title="Land tiles with a thermal value"
            caption="Between the southern and northern latitude limits of the band."
            value={parseFloat(claim("v2.result.coverage_pct"))}
            display={`${claim("v2.result.coverage_pct")}%`}
            required={parseFloat(claim("v2.result.g1.required_pct"))}
            requiredDisplay={`${claim("v2.result.g1.required_pct")}%`}
            tone="mars"
          />
        </div>
      </Band>

      {BODIES.map((b, i) => {
        const r = rows.filter((x) => x.body === b.body);
        if (r.length === 0) return null;
        return (
          <section key={b.body} aria-labelledby={`b-${b.body}`} className={`mb-10 space-y-3 border-t-4 pt-5 ${b.edge}`}>
            <h2 id={`b-${b.body}`} className="text-2xl">
              {b.title}
            </h2>
            <Table rows={r} caption={`${b.title} sources`} />
            {i === 0 ? (
              <PagePhoto src="/data/overlays/shackleton_rim.png" alt="World map coloured by the score against the Shackleton rim target, base profile" width={3600} height={1383} dark className="pt-4" caption="One of the three score overlays built from these sources. Transparent means no v1 score, not a low one." />
            ) : null}
          </section>
        );
      })}

      <Band tone="raised" labelledBy="list-note">
        <h2 id="list-note" className="sr-only">
          About the site list
        </h2>
        <p className="max-w-3xl text-secondary-foreground">The reference site list is teammate-written. Candidates not in our reference list are suggestions, not findings.</p>
      </Band>
    </>
  );
}
