import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import PageHero from "../components/PageHero";
import PagePhoto from "../components/PagePhoto";

export const metadata: Metadata = {
  title: "Docs",
  description: "Guides for researchers and organisations who want to use the GSOP data files, and the list of files you can fetch.",
};

const DOCS = [
  { href: "/docs/researchers", title: "For independent researchers", edge: "border-earth", body: "What the claims files hold, how to follow one score back to its source, how to cite us, and what the data does not support." },
  { href: "/docs/organizations", title: "For research organisations", edge: "border-moon", body: "How to use the exported files as a candidate pre-filter, how to read PASS, FAIL and NOT TESTED, and how to work with us." },
  { href: "/docs/data-access", title: "Data file access", edge: "border-mars", body: "Every static file we serve, with its path, schema, example URL, update cadence and terms." },
];

export default function Page() {
  return (
    <>
      <PageHero title="Docs" lede="The data behind this site is open. These guides say how to use it without reading more into it than it holds." />

      <ul className="grid gap-6 md:grid-cols-3">
        {DOCS.map((d) => (
          <li key={d.href} className={`border-t-4 bg-surface p-6 ${d.edge}`}>
            <h2 className="text-xl">
              <Link href={d.href} className="underline underline-offset-4">
                {d.title}
              </Link>
            </h2>
            <p className="mt-3 text-secondary-foreground">{d.body}</p>
          </li>
        ))}
      </ul>

      <Band tone="grid" labelledBy="where">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h2 id="where" className="text-2xl">
              Static files, no interface
            </h2>
            <p className="text-secondary-foreground">Everything is served as a plain file, so any language can read it. There is nothing to sign up for.</p>
          </div>
          <PagePhoto src="/brand/motifs/gsop-planetary-comparison-dark.webp" alt="The Moon, Earth and Mars side by side" width={1920} height={900} dark />
        </div>
      </Band>
    </>
  );
}
