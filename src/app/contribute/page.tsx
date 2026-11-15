import type { Metadata } from "next";
import Link from "next/link";
import { REPO_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Useful contributions to GSOP: field measurements with provenance for analog sites, source corrections, and critique of the method.",
};

const link = "underline underline-offset-4";

const WAYS = [
  {
    title: "Field measurements for analog sites",
    body: "The most useful contribution. Ground measurements from a named analog site, especially in India, with the instrument, date, location, method and licence. Without provenance we cannot use a number.",
  },
  {
    title: "Source corrections",
    body: "Each site row cites sources, and the site list is unreviewed. If a coordinate, description or link is wrong, open an issue on the repository with the page and the better source.",
  },
  {
    title: "Question the method",
    body: "The gates page and the ledger list what failed. If a threshold, statistic or limit looks wrong, say so with the file and row you mean. Pointed critique makes the audit better.",
  },
  {
    title: "Reuse the data",
    body: "The exported files are open static files, listed on the data access page. Tell us what you built, and cite the project.",
  },
];

export default function Page() {
  return (
    <article className="max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl">Contribute</h1>
        <p className="text-lg text-secondary-foreground">GSOP is open. If you hold ground data for an analog site, or can show where the screening goes wrong, here is how to help.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {WAYS.map((w) => (
          <li key={w.title} className="border border-border p-4">
            <h2 className="text-lg">{w.title}</h2>
            <p className="mt-2 text-secondary-foreground">{w.body}</p>
          </li>
        ))}
      </ul>

      <section className="space-y-3" aria-labelledby="how">
        <h2 id="how" className="text-xl">
          How to send something
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Open an issue on{" "}
            <a href={REPO_URL} className={link} rel="noopener noreferrer">
              the repository
            </a>
            , or email the maintainer from the{" "}
            <Link href="/contact" className={link}>
              contact page
            </Link>
            .
          </li>
          <li>For measurements, give the site name, coordinates, date range, instrument or product, units and whether the data can be shared publicly.</li>
          <li>Contributions are checked before they appear. Nothing you send is shown as a result until it has a source and a row in the claims file.</li>
        </ul>
        <p>
          Read the{" "}
          <Link href="/docs/researchers" className={link}>
            guide for independent researchers
          </Link>{" "}
          first to see how the files are laid out.
        </p>
      </section>
    </article>
  );
}
