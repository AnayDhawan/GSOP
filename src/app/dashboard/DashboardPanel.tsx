"use client";

import Link from "next/link";
import { Search, Star } from "lucide-react";
import { scoreColor, type DashBody, type DashSite } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

/**
 * The right panel: a ranked, searchable list of the sites for the active body.
 * Rank numbers count scored sites only, in the stored-score order the server built. Sites with no score follow, without a
 * rank and without a number. The row is one link to the site profile, and the star is a separate button.
 */
export default function DashboardPanel({
  body,
  count,
  rows,
  rankOf,
  query,
  onQuery,
  stars,
  onToggleStar,
  onHover,
  helperTitle,
  note,
  e32,
}: {
  body: DashBody;
  /** Number of sites in the list for this body, before the search filter. */
  count: number;
  rows: DashSite[];
  rankOf: Map<string, number>;
  query: string;
  onQuery: (q: string) => void;
  stars: string[];
  onToggleStar: (id: string) => void;
  onHover: (slug: string | null) => void;
  helperTitle: string;
  note: string | null;
  e32: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-foreground">{count} sites, ranked by similarity</h2>
        <p className="mt-1 text-xs leading-snug text-secondary-foreground" title={helperTitle}>
          Pick a site, here or on the map, to open its full profile.
        </p>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            id="site-search"
            name="site-search"
            aria-label="Find a site or region"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Find a site or region..."
            className="h-10 w-full border border-border bg-surface pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto max-md:max-h-[60vh]" aria-label={`${body} sites`}>
        {rows.length === 0 && <li className="px-4 py-6 text-sm text-secondary-foreground">No site matches that search.</li>}
        {rows.map((s) => {
          const rank = rankOf.get(s.id);
          const starred = stars.includes(s.id);
          return (
            <li key={s.id} className="flex items-stretch border-b border-border" onMouseEnter={() => onHover(s.slug)} onMouseLeave={() => onHover(null)}>
              <Link
                href={`/sites/${s.slug}`}
                className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 px-4 py-2 hover:bg-surface-raised"
                title={s.viewLabel ? `Score against ${s.viewLabel}` : s.tagTitle}
              >
                <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground" aria-label={rank ? `Rank ${rank}` : "Not ranked"}>
                  {rank ?? "-"}
                </span>
                <span className="h-3 w-3 shrink-0 rounded-full border border-border" style={{ background: scoreColor(s.scoreValue) }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{s.name}</span>
                  <span
                    className={cn("block truncate text-xs", s.tagKind === "gated" || s.tagKind === "not-tested" ? "text-muted-foreground" : "text-secondary-foreground")}
                    title={s.tagTitle}
                  >
                    {s.tagKind === "not-tested" ? <span className="border border-border px-1 font-mono text-[10px] uppercase">Not tested</span> : s.tag}
                  </span>
                </span>
                <span className="shrink-0 text-right font-mono text-sm tabular-nums text-foreground">{s.scoreText ?? ""}</span>
              </Link>
              <button
                type="button"
                onClick={() => onToggleStar(s.id)}
                aria-pressed={starred}
                aria-label={starred ? `Unstar ${s.name}` : `Star ${s.name}`}
                title={starred ? "Starred: kept at the top of the list" : "Star this site to keep it at the top of the list"}
                className="flex w-10 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Star className={cn("h-4 w-4", starred && "fill-current text-foreground")} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="space-y-2 border-t border-border px-4 py-3 text-xs leading-snug text-secondary-foreground">
        {note && <p>{note}</p>}
        <p>{e32}</p>
      </div>
    </div>
  );
}
