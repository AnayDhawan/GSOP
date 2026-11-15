import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What leaves your browser, and what stays in it, when you use GSOP. No accounts.",
};

const link = "underline underline-offset-4";

export default function Page() {
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-3xl">Privacy</h1>
      <p className="text-secondary-foreground">GSOP has no accounts and no forms. This is what leaves your browser, or stays in it.</p>
      <ul className="list-disc space-y-3 pl-6">
        <li>
          <strong>Vercel Web Analytics</strong> receives page views so we can see which pages are read. It does not use cookies. The site is hosted on Vercel, whose servers log requests as any host does.
        </li>
        <li>
          <strong>Theme choice</strong> is stored in your browser&apos;s local storage so the site remembers dark or light. It is not sent anywhere.
        </li>
        <li>
          <strong>Dashboard map tiles</strong> load directly from the tile provider, so that provider sees your IP address and the part of the map you view. The provider is credited on the{" "}
          <Link href="/data-sources" className={link}>
            data sources page
          </Link>
          .
        </li>
        <li>
          <strong>Fonts and data</strong> are served from this site. The data files are static and the deployed site does not query a database when you visit.
        </li>
        <li>
          <strong>Email</strong>: if you write to us, we keep your message and address to answer you.
        </li>
        <li>
          <strong>Location</strong>: the site does not ask for it. The locate button on the map, if you press it, uses your browser&apos;s own location prompt and the result stays in your browser.
        </li>
      </ul>
    </article>
  );
}
