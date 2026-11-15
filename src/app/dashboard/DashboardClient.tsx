"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import DashboardPanel from "./DashboardPanel";
import { filterSites, LEGEND_TITLE, RAMP_CSS, type DashBody, type DashboardData } from "@/lib/dashboard";
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

const barButton =
  "flex min-h-10 shrink-0 items-center justify-center px-3 text-sm text-secondary-foreground hover:bg-surface-raised hover:text-foreground disabled:opacity-60 md:min-h-9";

export default function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [body, setBody] = useState<DashBody>("Moon");
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
  const rows = useMemo(() => {
    return filterSites(bodySites, query);
  }, [bodySites, query]);

  const open = useCallback((slug: string) => router.push(`/sites/${slug}`), [router]);

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

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const helperTitle = `Each site shows its higher stored v1 score against ${data.viewsByBody[body].join(" and ")}. Hover a row to see which target it came from.`;
  const note = body === "Mars" ? "Mars is a low-confidence secondary result. Sites are compared with the Jezero target only." : null;

  return (
    <div
      data-dashboard-root
      className={cn("flex min-h-0 flex-1 flex-col bg-background", fullscreen && "fixed inset-0 z-[100]")}
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section aria-label="Map" className="relative isolate min-h-[60vh] flex-1 md:min-h-0">
          <div className="absolute inset-0">
            <DashboardMap sites={bodySites} bodyKey={body} hoveredSlug={hovered} onOpen={open} me={me} resizeKey={fullscreen} />
          </div>
          <div className="absolute left-1/2 top-3 z-[1000] flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-0.5 rounded-full border border-border bg-surface/95 p-1 shadow-sm backdrop-blur-sm">
            <div role="group" aria-label="Reference body" className="flex items-center gap-0.5">
              {BODIES.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={body === b}
                  onClick={() => {
                    setBody(b);
                    setQuery("");
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
            <button type="button" onClick={locate} disabled={locating} className={cn(barButton, "rounded-full")} title="Show my location on the map">
              {locating ? "Locating..." : "Locate"}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              className={cn(barButton, "rounded-full")}
              title={fullscreen ? "Exit fullscreen (Esc)" : "View the map fullscreen"}
            >
              {fullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
          </div>
          {locateError && (
            <p role="status" className="absolute left-1/2 top-16 z-[1000] -translate-x-1/2 border border-border bg-surface/95 px-3 py-1 text-sm text-foreground">
              {locateError}
            </p>
          )}
          <div className="absolute bottom-7 left-3 z-[1000] w-[220px] border border-border bg-surface/95 p-3 text-xs backdrop-blur-sm">
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
