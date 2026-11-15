"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DEFAULT_VIEW, countryOptions, defaultFilters, filterRows, viewOptions, type ExplorerRow, type Filters } from "@/lib/explorer";
import { statusLabel } from "@/lib/format";

type Props = { rows: ExplorerRow[]; views: { Moon: string[]; Mars: string[] } };

const field = "w-full border border-border bg-surface px-3 py-2 text-sm";
const label = "gsop-label block";

function Card({ r, view }: { r: ExplorerRow; view: string }) {
  const c = r.cells[view];
  const scored = c?.status === "scored";
  const href = `/sites/${r.slug}`;
  return (
    <li className="flex flex-col border border-border bg-surface">
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[4/3] overflow-hidden bg-surface-raised">
        {r.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.photo.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.body === "Moon" ? "/img/bodies/moon.jpg" : "/img/bodies/mars.jpg"} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-30 grayscale" />
          </>
        )}
        <span className="absolute left-2 top-2 bg-black/70 px-2 py-1 font-mono text-xs uppercase tracking-wider text-white">{r.body}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg leading-snug">
          <Link href={href} className="underline-offset-4 hover:underline">
            {r.name}
          </Link>
        </h3>
        <p className="text-sm text-secondary-foreground">{r.place ?? r.country ?? "Country not provided"}</p>
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm">
          <span className={r.list === "known" ? "font-medium" : "text-secondary-foreground"}>{r.list === "known" ? "Reference site" : "Candidate, not in our reference list"}</span>
        </p>
        <p className="text-sm text-secondary-foreground">
          {scored ? (
            <>
              Stored v1 percentile <span className="font-mono tabular-nums text-foreground">{c.percentile}</span>
              {c.flagged ? ", in a flagged tile" : ""}
            </>
          ) : (
            <>
              {statusLabel(c?.status ?? "not in v1 outputs")}
              {c?.reason ? `: ${c.reason}` : ""}
            </>
          )}
        </p>
      </div>
      <p className="border-t border-border px-4 py-2 text-xs leading-snug text-muted-foreground">{r.photo ? `${r.photo.title ? r.photo.title + ". " : ""}${r.photo.credit}` : "No photo for this place yet."}</p>
    </li>
  );
}

export default function Explorer({ rows, views }: Props) {
  const [f, setF] = useState<Filters>(defaultFilters());
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));
  const shown = useMemo(() => filterRows(rows, f), [rows, f]);
  const options = viewOptions(views[f.body]);
  const countries = useMemo(() => countryOptions(rows, f.body), [rows, f.body]);

  return (
    <div className="space-y-6">
      <form className="space-y-4 border border-border bg-surface p-4" onSubmit={(e) => e.preventDefault()} aria-label="Filter sites">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-1 md:col-span-2">
            <span className={label}>Search name or country</span>
            <input className={field} type="search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Askja, India, lava tube" />
          </label>
          <fieldset className="space-y-1">
            <legend className={label}>Body</legend>
            <div className="flex gap-2">
              {(["Moon", "Mars"] as const).map((b) => (
                <label key={b} className={`flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 border px-3 text-sm ${f.body === b ? "border-foreground bg-surface-raised" : "border-border"}`}>
                  <input className="sr-only" type="radio" name="body" checked={f.body === b} onChange={() => set({ body: b, view: DEFAULT_VIEW[b], country: "all" })} />
                  {b}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="space-y-1">
            <span className={label}>Sort</span>
            <select className={field} value={f.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })}>
              <option value="name">Name</option>
              <option value="pct_desc">Percentile, high to low</option>
              <option value="pct_asc">Percentile, low to high</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className={label}>Entry type</span>
            <select className={field} value={f.list} onChange={(e) => set({ list: e.target.value as Filters["list"] })}>
              <option value="all">All entries</option>
              <option value="known">Reference sites</option>
              <option value="candidate">Candidates</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className={label}>Country</span>
            <select className={field} value={f.country} onChange={(e) => set({ country: e.target.value })}>
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className={label}>Score shown</span>
            <select className={field} value={f.view} onChange={(e) => set({ view: e.target.value })}>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" className="min-h-10 w-full border border-border px-3 text-sm hover:bg-surface-raised" onClick={() => setF(defaultFilters())}>
              Reset filters
            </button>
          </div>
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-secondary-foreground">More filters</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <label className="space-y-1">
              <span className={label}>v1 used this site</span>
              <select className={field} value={f.v1} onChange={(e) => set({ v1: e.target.value as Filters["v1"] })}>
                <option value="all">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className={label}>Result</span>
              <select className={field} value={f.result} onChange={(e) => set({ result: e.target.value as Filters["result"] })}>
                <option value="all">Scored and unscored</option>
                <option value="scored">Scored only</option>
                <option value="unscored">Unscored only</option>
              </select>
            </label>
            <label className="flex items-center gap-2 self-end pb-2">
              <input type="checkbox" checked={f.flaggedOnly} onChange={(e) => set({ flaggedOnly: e.target.checked })} />
              Only tiles flagged in the top group
            </label>
          </div>
        </details>
      </form>

      <div role="status" aria-live="polite" className="min-h-6 text-sm text-secondary-foreground">
        {shown.length === 0 ? "No sites match these filters." : `Showing ${shown.length} of ${rows.filter((r) => r.body === f.body).length} ${f.body} sites.`}
      </div>

      {shown.length > 0 && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Sites">
          {shown.map((r) => (
            <Card key={r.id} r={r} view={f.view} />
          ))}
        </ul>
      )}
    </div>
  );
}
