import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import PageHero from "../components/PageHero";
import PagePhoto from "../components/PagePhoto";
import { REPO_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Useful contributions to GSOP: field measurements with provenance for analog sites, source corrections, and critique of the method.",
};

const link = "underline underline-offset-4";

const INCLUDE = [
  ["Site", "The name as it appears on the site list, or a new name with coordinates."],
  ["Place", "Latitude and longitude, and how you got them."],
  ["Dates", "When the measurements were taken, start and end."],
  ["Instrument", "The logger, sensor or satellite product, with model or version."],
  ["Units", "What the numbers are in, so nobody has to guess."],
  ["Sharing", "Whether we may publish the data, and under which licence."],
];

const OTHER = [
  {
    title: "Source corrections",
    tone: "border-moon",
    body: "Each site row cites sources, and the site list is unreviewed. If a coordinate, description or link is wrong, open an issue on the repository with the page and the better source.",
  },
  {
    title: "Questions about the method",
    tone: "border-earth",
    body: "The gates page and the ledger list what failed. If a threshold, statistic or limit looks wrong to you, point at the file and row. Specific critique is the most useful kind.",
  },
  {
    title: "Reuse of the data",
    tone: "border-mars",
    body: "The exported files are static and open, and the data access page lists them. If you build something from them, tell us and cite the project.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero title="Contribute" lede="GSOP is open. If you hold ground data for an analog site, or can show where the screening goes wrong, this page says how to send it." />

      <h2 className="text-2xl">Field measurements for analog sites</h2>
      <div className="grid items-start gap-10 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <p className="text-secondary-foreground">
            This is the most useful thing you can send. A satellite layer averaged over a tile hides what a logger on the ground records, and for Indian sites such as Ladakh we have almost nothing but the satellite view.
          </p>
          <p className="text-secondary-foreground">Without provenance we cannot use a number, so please send the details below with it.</p>
          <dl className="grid gap-x-8 gap-y-3 pt-2 sm:grid-cols-2">
            {INCLUDE.map(([term, body]) => (
              <div key={term} className="border-l-2 border-earth pl-3">
                <dt className="font-medium">{term}</dt>
                <dd className="text-sm text-secondary-foreground">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
        <PagePhoto src="/img/bodies/earth.jpg" alt="The Earth" width={600} height={600} className="mx-auto w-2/3 md:w-full [&_img]:rounded-full [&_img]:border-0" caption="Earth, the place the measurements come from." />
      </div>

      <Band tone="raised" labelledBy="other">
        <h2 id="other" className="mb-6 text-2xl">
          Other ways to help
        </h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {OTHER.map((o) => (
            <li key={o.title} className={`border-t-4 bg-background p-5 ${o.tone}`}>
              <h3 className="text-lg">{o.title}</h3>
              <p className="mt-2 text-sm text-secondary-foreground">{o.body}</p>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="accent" labelledBy="how">
        <h2 id="how" className="text-2xl">
          How to send it
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <p>
              Open an issue on{" "}
              <a href={REPO_URL} className={link} target="_blank" rel="noopener noreferrer">
                the repository
              </a>
              , or email the maintainer from the{" "}
              <Link href="/contact" className={link}>
                contact page
              </Link>
              .
            </p>
          </div>
          <div className="space-y-3 text-secondary-foreground">
            <p>We check everything before it appears. Nothing you send shows up as a result until it has a source and a row in the claims file.</p>
            <p>
              Read the{" "}
              <Link href="/docs/researchers" className={link}>
                guide for independent researchers
              </Link>{" "}
              first if you want to see how the files are laid out.
            </p>
          </div>
        </div>
      </Band>
    </>
  );
}
