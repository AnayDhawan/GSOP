"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import DashboardPanel from "./DashboardPanel";
import SiteCard from "./SiteCard";
import { EXTENTS, filterSites, LEGEND_TITLE, RAMP_CSS, type DashBody, type DashExtent, type DashSite, type DashboardData } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { Locate } from "./DashboardMap";

function MapPlaceholder() {
  return (
    <div role="status" className="h-full w-full bg-surface-raised motion-safe:animate-pulse">
      <span className="sr-only">Loading map</span>
    </div>
  );
}

const DashboardMap = dynamic(() => import("./DashboardMap"), { ssr: false, loading: () => <MapPlaceholder /> });

const BODIES: DashBody[] = ["Moon", "Mars"];
const DEFAULT_RADIUS_KM = 20;

const barButton =
  "flex min-h-10 shrink-0 items-center justify-center px-3 text-sm text-secondary-foreground hover:bg-surface-raised hover:text-foreground disabled:opacity-60 md:min-h-9";

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [body, setBody] = useState<DashBody>("Moon");
  const [extent, setExtent] = useState<DashExtent>("World");
  const [selected, setSelected] = useState<DashSite | null>(null);
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [me, setMe] = useState<Locate>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const bodySites = useMemo(() => data.sites.filter((s) => s.body === body), [data.sites, body]);
  const rankOf = useMemo(() => {
    const m = new Map<string, number>();
    let n = 0;
    for (const s of bodySites) if (s.scoreValue !== null) m.set(s.id, ++n);
    return m;
  }, [bodySites]);
  const rows = useMemo(() => filterSites(bodySites, query), [bodySites, query]);

  const select = useCallback((s: DashSite) => setSelected(s), []);
  const radiusKm = data.matchRadiusKm ?? DEFAULT_RADIUS_KM;

  function locate() {
    if (!navigator.geolocation) {
      setLocateError("This browser cannot share a location.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMe({ lat: p.coords.latitude, lon: p.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocateError("Location is not available. Check the browser permission.");
        setLocating(false);
      },
      { timeout: 10000 },
    );
  }

  // Escape closes the site card first, then leaves fullscreen.
  useEffect(() => {
    if (!fullscreen && !selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, selected]);

  const helperTitle = `Each site shows its higher stored v1 score against ${data.viewsByBody[body].join(" and ")}. Hover a row to see which target it came from.`;
  const note = body === "Mars" ? "Mars is a low-confidence secondary result. Sites are compared with the Jezero target only." : null;

  return (
    <div
      data-dashboard-root
      className={cn("flex min-h-0 flex-1 flex-col bg-background", fullscreen && "fixed inset-0 z-[100]")}
    >
      <h1 className="sr-only">Dashboard: reference sites ranked by similarity</h1>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section aria-label="Map" className="relative isolate min-h-[60vh] flex-1 md:min-h-0">
          <div className="absolute inset-0">
            <DashboardMap sites={bodySites} india={extent === "India" ? (data.india ?? []) : []} bodyKey={body} extent={extent} hoveredSlug={hovered} selected={selected} onSelect={select} radiusKm={radiusKm} me={me} resizeKey={fullscreen} />
          </div>
          {extent === "India" && (data.india?.length ?? 0) > 0 && (
            <p className="absolute left-3 top-16 z-[1000] flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded border border-border bg-surface/95 px-2.5 py-1.5 text-xs text-secondary-foreground shadow-sm backdrop-blur-sm">
              <span aria-hidden className="inline-block h-3 w-3 shrink-0 rounded-full border-2 border-white bg-[#7C3AED]" />
              India highlight: public sources, not scored
            </p>
          )}
          {/* The bar sits in a full-width row and is centred in it. A left-1/2 box shrinks to half the map and the last button spills out of the pill. */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[1000] flex justify-center">
          <div className="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full border border-border bg-surface/95 p-1 shadow-sm backdrop-blur-sm">
            <div role="group" aria-label="Reference body" className="flex items-center gap-0.5">
              {BODIES.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={body === b}
                  onClick={() => {
                    setBody(b);
                    setQuery("");
                    setSelected(null);
                  }}
                  className={cn(
                    "min-h-10 rounded-full px-4 text-sm font-medium md:min-h-9",
                    body === b ? "bg-foreground text-background" : "text-secondary-foreground hover:bg-surface-raised hover:text-foreground",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
            <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
            <div role="group" aria-label="Map extent" className="flex items-center gap-0.5">
              {EXTENTS.map((x) => (
                <button
                  key={x}
                  type="button"
                  aria-pressed={extent === x}
                  onClick={() => setExtent(x)}
                  className={cn(
                    "min-h-10 rounded-full px-4 text-sm font-medium md:min-h-9",
                    extent === x ? "bg-foreground text-background" : "text-secondary-foreground hover:bg-surface-raised hover:text-foreground",
                  )}
                >
                  {x}
                </button>
              ))}
            </div>
            <span className="mx-1 h-5 w-px shrink-0 bg-border max-sm:hidden" aria-hidden />
            <button type="button" onClick={locate} disabled={locating} className={cn(barButton, "rounded-full max-sm:hidden")} title="Show my location on the map">
              {locating ? "Locating..." : "My location"}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              className={cn(barButton, "rounded-full max-md:hidden")}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              title={fullscreen ? "Exit fullscreen (Esc)" : "View the map fullscreen"}
            >
              {fullscreen ? "Exit" : "Fullscreen"}
            </button>
          </div>
          </div>
          {selected && <SiteCard site={selected} radiusKm={radiusKm} onClose={() => setSelected(null)} />}
          {locateError && (
            <p role="status" className="absolute left-1/2 top-16 z-[1000] -translate-x-1/2 border border-border bg-surface/95 px-3 py-1 text-sm text-foreground">
              {locateError}
            </p>
          )}
          <div className={cn("absolute bottom-7 left-3 z-[1000] w-[220px] border border-border bg-surface/95 p-3 text-xs backdrop-blur-sm", selected && "max-md:hidden")}>
            <p className="mb-1.5 font-semibold text-foreground">{LEGEND_TITLE}</p>
            <div className="h-3 rounded-sm" style={{ background: RAMP_CSS }} aria-hidden />
            <div className="mt-1 flex justify-between text-secondary-foreground">
              <span>Less similar</span>
              <span>Most similar</span>
            </div>
            <p className="mt-1.5 text-muted-foreground">Grey dot: no score.</p>
          </div>
        </section>
        <aside aria-label="Site ranking" className="flex w-full flex-none flex-col border-t border-border bg-background md:min-h-0 md:w-[340px] md:border-l md:border-t-0">
          <DashboardPanel
            body={body}
            count={bodySites.length}
            rows={rows}
            rankOf={rankOf}
            query={query}
            onQuery={setQuery}
            onHover={setHovered}
            helperTitle={helperTitle}
            note={note}
            e32={data.e32}
          />
        </aside>
      </div>
      <footer className="border-t border-border bg-background px-4 py-1.5">
        <p className="text-xs text-muted-foreground">
          Data refreshed {data.refreshed} - computed from {data.window}
        </p>
      </footer>
    </div>
  );
}
