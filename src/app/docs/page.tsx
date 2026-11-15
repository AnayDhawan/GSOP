import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs",
  description: "Guides for researchers and organizations who want to use the GSOP data files, and the list of files you can fetch.",
};

const DOCS = [
  { href: "/docs/researchers", title: "For independent researchers", body: "What the claims files contain, how to follow one score back to its source, how to cite, and what the data does not support." },
  { href: "/docs/organizations", title: "For research organizations", body: "Using the exported files as a candidate pre-filter, reading PASS, FAIL and NOT TESTED, and how to collaborate." },
  { href: "/docs/data-access", title: "Data file access", body: "Every static file we serve: path, schema, example URL, update cadence and terms." },
];

export default function Page() {
  return (
    <article className="max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl">Docs</h1>
        <p className="text-lg text-secondary-foreground">The data behind this site is open. These guides say how to use it without reading more into it than it holds.</p>
      </header>
      <ul className="space-y-4">
        {DOCS.map((d) => (
          <li key={d.href} className="border border-border p-4">
            <h2 className="text-xl">
              <Link href={d.href} className="underline underline-offset-4">
                {d.title}
              </Link>
            </h2>
            <p className="mt-1 text-secondary-foreground">{d.body}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
