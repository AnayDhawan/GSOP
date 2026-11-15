import type { Metadata } from "next";
import Link from "next/link";
import { claim } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mission",
  description: "Why GSOP exists: a transparent, reproducible screening method for Earth places that resemble Moon and Mars targets, with an India focus and its failures published.",
};

const link = "underline underline-offset-4";

const POINTS = [
  {
    title: "A screening method, not a verdict",
    body: "GSOP scores Earth land tiles by how closely their terrain and thermal traits match a lunar or Martian target, then ranks them. The ranking tells a person where to look first. It does not say a place is a good analog.",
  },
  {
    title: "Pre-registered gates, published as stored",
    body: "Thresholds were written down before the v2 run. Every result is printed with a literal status, PASS, FAIL or NOT TESTED, including the failures.",
  },
  {
    title: "A reproducible data build",
    body: "The data files are built by one command from stored results. Every number on the site traces to a row in a claims file with a source path and a hash.",
  },
  {
    title: "An India focus",
    body: "Ground data from India is thin in most analog work. The site lists Indian sites next to the global ones and invites field measurements with provenance, so local places can be compared on the same terms.",
  },
];

export default function Page() {
  return (
    <article className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl">Mission</h1>
        <p className="text-lg text-secondary-foreground">
          Space agencies need places on Earth to test equipment and train crews for work on the Moon and Mars. GSOP is an open screening method that helps choose which places to look at, and says plainly how far the evidence goes.
        </p>
      </header>

      <section className="space-y-4" aria-labelledby="what">
        <h2 id="what" className="text-2xl">
          What we are doing
        </h2>
        <ul className="space-y-3">
          {POINTS.map((p) => (
            <li key={p.title} className="border border-border p-4">
              <h3 className="text-lg">{p.title}</h3>
              <p className="mt-1 text-secondary-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="honest">
        <h2 id="honest" className="text-2xl">
          Honesty is part of the design
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Adding an Earth thermal layer lowered the own-tile percentile of the Namib sand sea from {claim("v2.result.own.namib.before")} to {claim("v2.result.own.namib.after")}. That is the one positive result, and it comes with caveats on the{" "}
            <Link href="/gates" className={link}>
              gates page
            </Link>
            .
          </li>
          <li>
            The thermal layer covers {claim("v2.result.coverage_pct")}% of land tiles in its band, below the share the plan required. Gate G1 failed.
          </li>
          <li>Mars is a low-confidence secondary result.</li>
          <li>The ranking has not been checked against independent data.</li>
        </ul>
        <p>
          Read the{" "}
          <Link href="/method" className={link}>
            methodology
          </Link>{" "}
          and the{" "}
          <Link href="/ledger" className={link}>
            failure-first ledger
          </Link>{" "}
          for the limits in full.
        </p>
      </section>

      <p className="flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/dashboard" className={`font-display text-lg ${link}`}>
          Open the dashboard
        </Link>
        <Link href="/contribute" className={`font-display text-lg ${link}`}>
          Contribute
        </Link>
      </p>
    </article>
  );
}
