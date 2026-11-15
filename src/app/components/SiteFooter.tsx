import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import BodiesStrip from "./BodiesStrip";
import { CONTACT_EMAIL, FOOTER_LEGAL, FOOTER_QUICK, REPO_URL } from "@/lib/nav";
import { licenseName } from "@/lib/sources";

const LINK = "inline-flex min-h-10 items-center text-sm text-secondary-foreground transition-colors hover:text-foreground";
const KICKER = "gsop-label";

const DISCLAIMER = "GSOP is a research prototype, built independently for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA or any government body.";
const CREDITS =
  "Data credits: NASA MODIS MOD11A2 via LP DAAC and Google Earth Engine; LRO Diviner and MGS TES via the NASA PDS Geosciences Node; LOLA via NASA PGDA; MOLA via USGS Astrogeology; SRTM and Copernicus DEM; Natural Earth; NASA Blue Marble; OpenStreetMap contributors. Basemap: Esri, HERE, Garmin, FAO, NOAA, USGS.";

export default function SiteFooter() {
  return (
    <>
      {/* The footer is black in both themes: data-theme="dark" scopes the dark tokens to it. */}
      <footer data-theme="dark" className="mt-16 border-t border-border bg-black text-foreground">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <Link href="/" aria-label="GSOP home" className="inline-flex items-center gap-3">
                <Logo height={32} />
                <span className="font-display text-2xl font-semibold tracking-wide text-foreground">GSOP</span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-secondary-foreground">
                A screening index for Earth analog sites, built from open data, with its sources and limits in public.
              </p>
            </div>

            <nav aria-label="Quick links" className="space-y-2">
              <p className={KICKER}>Quick links</p>
              <ul>
                {FOOTER_QUICK.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={LINK}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal" className="space-y-2">
              <p className={KICKER}>Legal</p>
              <ul>
                {FOOTER_LEGAL.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={LINK}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Connect" className="space-y-2">
              <p className={KICKER}>Connect</p>
              <ul>
                <li>
                  <Link href="/contact" className={LINK}>
                    Contact
                  </Link>
                </li>
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className={`${LINK} gap-2`}>
                    Email
                  </a>
                </li>
                <li>
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                    GitHub
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-10 space-y-3 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            <p>{DISCLAIMER}</p>
            <p>{CREDITS}</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p>
                &copy; 2026 GSOP. Code released under the {licenseName()}.
              </p>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
      <BodiesStrip />
    </>
  );
}
