import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import PageHero from "../components/PageHero";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What leaves your browser, and what stays in it, when you use GSOP. No accounts.",
};

const link = "underline underline-offset-4";

export default function Page() {
  return (
    <>
      <PageHero title="Privacy" lede="GSOP has no accounts and no forms. Here is what leaves your browser, and what stays in it." />

      <Band tone="raised" labelledBy="list">
        <h2 id="list" className="sr-only">
          What the site stores or sends
        </h2>
        <dl className="divide-y divide-border">
          <div data-left className="grid gap-2 py-5 md:grid-cols-[14rem_1fr]">
            <dt className="font-display text-lg">Vercel Web Analytics</dt>
            <dd className="text-secondary-foreground">It receives page views so we can see which pages get read. It uses no cookies. The site is hosted on Vercel, whose servers log requests the way any host does.</dd>
          </div>
          <div data-left className="grid gap-2 py-5 md:grid-cols-[14rem_1fr]">
            <dt className="font-display text-lg">Map tiles</dt>
            <dd className="text-secondary-foreground">
              The dashboard loads tiles straight from the tile provider, so that provider sees your IP address and the part of the map you look at. The provider is credited on the{" "}
              <Link href="/data-sources" className={link}>
                data sources page
              </Link>
              .
            </dd>
          </div>
          <div data-left className="grid gap-2 py-5 md:grid-cols-[14rem_1fr]">
            <dt className="font-display text-lg">Location</dt>
            <dd className="text-secondary-foreground">The site never asks for it. If you press the locate button on the map, your browser shows its own prompt and the answer stays in your browser.</dd>
          </div>
        </dl>
      </Band>

      <div className="grid gap-10 md:grid-cols-2">
        <section aria-labelledby="stays" className="space-y-3 border-t-4 border-earth pt-5">
          <h2 id="stays" className="text-xl">
            Stays on your device
          </h2>
          <p className="text-secondary-foreground">Your theme choice, dark or light, sits in your browser&apos;s local storage so the site remembers it. Nothing sends it anywhere.</p>
        </section>
        <section aria-labelledby="ours" className="space-y-3 border-t-4 border-mars pt-5">
          <h2 id="ours" className="text-xl">
            Served from this site
          </h2>
          <p className="text-secondary-foreground">Fonts and data files come from this site. The data files are static, and the deployed site does not query a database when you visit.</p>
        </section>
      </div>

      <Band tone="accent" labelledBy="mail">
        <h2 id="mail" className="mb-2 text-xl">
          If you write to us
        </h2>
        <p className="max-w-2xl text-secondary-foreground">We keep your message and your address so we can answer you.</p>
      </Band>
    </>
  );
}
