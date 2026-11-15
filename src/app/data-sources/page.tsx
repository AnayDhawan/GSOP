import type { Metadata } from "next";
import { claim, v2File } from "@/lib/data";
import { sourcesUsed, type SourceRow } from "@/lib/pages-data";

export const metadata: Metadata = {
  title: "Data sources",
  description: "Every dataset behind the GSOP scores: where it comes from, what it contributed, its resolution or window, and the coverage limit of the Earth thermal layer.",
};

const link = "underline underline-offset-4";
const BODY_ORDER = ["Earth", "Moon", "Mars", "Display"];
const BODY_TITLE: Record<string, string> = {
  Earth: "Earth",
  Moon: "Moon",
  Mars: "Mars",
  Display: "Display only",
};

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
                <a href={r.url} className={link} rel="noopener noreferrer">
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
    <article className="max-w-4xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl">Data sources</h1>
        <p className="text-secondary-foreground">
          Every source below was used in a result shown on this site, and every source used is listed. The list is one file in the repository (data/sources_used.csv); the footer credits read the same file. Each dataset keeps the licence of its provider. Raw files are not redistributed here.
        </p>
      </header>

      <section className="space-y-3 border border-control p-4" aria-labelledby="caveat">
        <h2 id="caveat" className="text-xl">
          Quality and coverage caveat
        </h2>
        <p>
          The Earth thermal layer has a valid value for {claim("v2.result.coverage_pct")}% of land tiles between {claim("v2.result.cov.band_south")} S and {claim("v2.result.cov.band_north")} N: {claim("v2.result.g1.coverage")} against a required {claim("v2.result.g1.required")}. Gate G1 is{" "}
          <strong>{v2.results?.gate_statuses.G1 ?? "not available"}</strong>.
        </p>
        {cov ? <p className="text-secondary-foreground">{cov.text}</p> : null}
        <p className="text-secondary-foreground">
          Tiles with no thermal value are not scored, so a place in an excluded region has no v2 score. Skin temperature at satellite overpass is not air temperature, and cloud gaps remain.
        </p>
      </section>

      {BODY_ORDER.map((b) => {
        const r = rows.filter((x) => x.body === b);
        if (r.length === 0) return null;
        return (
          <section key={b} className="space-y-3" aria-labelledby={`b-${b}`}>
            <h2 id={`b-${b}`} className="text-2xl">
              {BODY_TITLE[b]}
            </h2>
            <Table rows={r} caption={`${BODY_TITLE[b]} sources`} />
          </section>
        );
      })}

      <p className="text-secondary-foreground">The reference site list is teammate-written and unreviewed. Candidates not in our reference list are suggestions, not findings.</p>
    </article>
  );
}
