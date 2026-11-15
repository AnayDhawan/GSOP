import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import PageHero from "../components/PageHero";
import { indiaFile } from "@/lib/data";

export const metadata: Metadata = {
  title: "India highlights",
  description: "Places in India that public sources describe as Moon or Mars analogs. They are not scored. They are listed so ground data can be sent for them.",
};

const link = "underline underline-offset-4";

const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");

export default function Page() {
  const { meta, places } = indiaFile();
  const listed = places.filter((p) => p.in_reference_list);
  const others = places.filter((p) => !p.in_reference_list);

  const card = (p: (typeof places)[number]) => (
    <li key={p.id} className="flex flex-col gap-3 border border-border bg-surface p-5">
      <div className="space-y-1">
        <h3 className="font-display text-xl">{p.name}</h3>
        <p className="text-sm text-secondary-foreground">
          {p.state} · {p.bodies.join(" and ")} · {p.kind === "area" ? "marker at the middle of the area" : "marker on the place"}
        </p>
      </div>
      <p className="text-secondary-foreground">{p.why}</p>
      <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {p.slug ? (
          <Link href={`/sites/${p.slug}`} className={link}>
            Profile and stored score
          </Link>
        ) : (
          <span className="text-muted-foreground">Not in our reference list</span>
        )}
        {p.source_urls.map((u) => (
          <a key={u} href={u} className={link} target="_blank" rel="noopener noreferrer">
            {host(u)}
          </a>
        ))}
      </p>
    </li>
  );

  return (
    <>
      <PageHero title="India highlights" lede="Places in India that public sources describe as Moon or Mars analogs. They are listed so ground data can be sent for them." />

      <div className="mx-auto mb-10 max-w-3xl space-y-3 border-l-2 border-border pl-4 text-secondary-foreground">
        <p>{meta.note}</p>
        <p>
          {meta.text_label} {meta.review_note}
        </p>
        <p className="text-sm">{meta.marker_note}</p>
      </div>

      <section className="space-y-6" aria-labelledby="listed">
        <h2 id="listed" className="text-3xl">
          Already in our reference list
        </h2>
        <ul data-left className="grid gap-5 md:grid-cols-2">
          {listed.map(card)}
        </ul>
      </section>

      <Band tone="grid" labelledBy="others">
        <div className="space-y-6">
          <h2 id="others" className="text-3xl">
            Not in our reference list
          </h2>
          <ul data-left className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {others.map(card)}
          </ul>
        </div>
      </Band>

      <section className="space-y-4" aria-labelledby="gap">
        <h2 id="gap" className="text-3xl">
          What is missing
        </h2>
        <ul className="mx-auto max-w-2xl list-disc space-y-2 pl-6">
          <li>We hold no ground measurements from any of these places.</li>
          <li>The places outside our reference list have no v1 score, because the score lookup was built from the list.</li>
          <li>The match to the Moon or Mars is each source&apos;s claim, not ours. Nobody on the team has checked the sources yet.</li>
        </ul>
        <p className="flex flex-wrap justify-center gap-x-8 gap-y-2 font-display text-lg">
          <Link href="/dashboard" className={link}>
            See them on the dashboard map
          </Link>
          <Link href="/contribute" className={link}>
            Send ground data
          </Link>
        </p>
      </section>
    </>
  );
}
