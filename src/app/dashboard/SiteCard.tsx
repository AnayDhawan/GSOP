"use client";

import Link from "next/link";
import { scoreColor, type DashSite } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

/**
 * The card that opens when a site is picked on the map: the name, the key facts stored for it, the honest status line
 * and a link to the full profile. Descriptive text comes from the teammate-supplied list and is unreviewed.
 * Phones: a sheet at the bottom of the map. Wider screens: a panel at the top right.
 */
export default function SiteCard({ site, radiusKm, onClose }: { site: DashSite; radiusKm: number; onClose: () => void }) {
  const facts: [string, string][] = [
    ["Reference body", site.body],
    ["Listed as", site.list === "known" ? "Reference site" : "Candidate, not in our reference list"],
    ["Country", site.country || "not provided"],
    ["Elevation", site.elevationText ?? "not provided"],
    ["Position", `${site.lat.toFixed(2)}, ${site.lon.toFixed(2)}`],
  ];
  return (
    <aside
      role="dialog"
      aria-label={`${site.name}, site card`}
      data-testid="site-card"
      className="absolute inset-x-3 bottom-7 z-[1000] max-h-[calc(100%-5.5rem)] overflow-y-auto border border-border bg-surface/95 text-sm shadow-lg backdrop-blur-sm md:bottom-auto md:left-auto md:right-3 md:top-16 md:max-h-[calc(100%-9rem)] md:w-[340px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {site.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.photo} alt="" width={44} height={44} loading="lazy" decoding="async" className="h-11 w-11 shrink-0 object-cover" />
          ) : null}
          <div className="min-w-0">
            <p className="gsop-label">{site.body} analog</p>
            <h2 className="mt-1 truncate font-display text-lg font-semibold text-foreground">{site.name}</h2>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close site card" className="-mr-1 -mt-1 shrink-0 px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>

      <div className="border-b border-border px-4 py-2">
        <Link href={`/sites/${site.slug}`} className="inline-flex min-h-9 items-center font-display text-sm font-semibold text-foreground underline underline-offset-4">
          Open the full profile
        </Link>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="h-3 w-3 shrink-0 rounded-full border border-border" style={{ background: scoreColor(site.scoreValue) }} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-base tabular-nums text-foreground">{site.scoreText ? `Score ${site.scoreText}` : "No score"}</p>
          <p className={cn("truncate text-xs", site.tagKind === "gated" || site.tagKind === "not-tested" ? "text-muted-foreground" : "text-secondary-foreground")} title={site.tagTitle}>
            {site.tagKind === "not-tested" ? "Not tested" : site.tag}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 px-4 py-3 text-xs">
        {facts.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      {(site.whyAnalog || site.experiments) && (
        <div className="space-y-3 border-t border-border px-4 py-3 text-xs leading-snug">
          {site.whyAnalog && (
            <div>
              <p className="gsop-label mb-1">Why an analog</p>
              <p className="text-secondary-foreground">{site.whyAnalog}</p>
            </div>
          )}
          {site.experiments && (
            <div>
              <p className="gsop-label mb-1">Experiments possible</p>
              <p className="text-secondary-foreground">{site.experiments}</p>
            </div>
          )}
          <p className="text-muted-foreground">Teammate-written notes. Check the cited source before you rely on them.</p>
        </div>
      )}

      <div className="space-y-2 border-t border-border px-4 py-3 text-xs">
        <p className="text-muted-foreground">
          <span className="mr-1.5 inline-block h-2 w-5 border-t-2 border-dashed border-[#E8A33D] align-middle" aria-hidden />
          Dashed ring: the {radiusKm} km v1 match radius, the area v1 searched for the best tile. A search window, not a surveyed site boundary.
        </p>
      </div>
    </aside>
  );
}
