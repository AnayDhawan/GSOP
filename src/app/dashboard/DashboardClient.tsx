"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Loader2, LocateFixed, Maximize2, Minimize2 } from "lucide-react";
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

// Starred sites live in this browser only (localStorage). A read or write that fails is ignored.
const STAR_KEY = "gsop-dashboard-stars";
const starListeners = new Set<() => void>();
function readStars(): string {
  try {
    return localStorage.getItem(STAR_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
function writeStars(ids: string[]) {
  try {
    localStorage.setItem(STAR_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked. The star then lasts until the page closes only if the store is read again, which it is not.
  }
  starListeners.forEach((l) => l());
}
function subscribeStars(cb: () => void) {
  starListeners.add(cb);
  return () => {
    starListeners.delete(cb);
  };
}

const iconButton =
  "flex size-10 shrink-0 items-center justify-center text-secondary-foreground hover:bg-surface-raised hover:text-foreground disabled:opacity-60 md:size-9";

export default function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [body, setBody] = useState<DashBody>("Moon");
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [me, setMe] = useState<Locate>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const starsRaw = useSyncExternalStore(subscribeStars, readStars, () => "[]");
  const stars = useMemo<string[]>(() => {
    try {
      const v = JSON.parse(starsRaw);
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }, [starsRaw]);

  const theme: "light" | "dark" = resolvedTheme === "light" ? "light" : "dark";
  const bodySites = useMemo(() => data.sites.filter((s) => s.body === body), [data.sites, body]);
  const rankOf = useMemo(() => {
    const m = new Map<string, number>();
    let n = 0;
    for (const s of bodySites) if (s.scoreValue !== null) m.set(s.id, ++n);
    return m;
  }, [bodySites]);
  const rows = useMemo(() => {
    const f = filterSites(bodySites, query);
    // Starred sites float to the top, each group keeps the ranked order, and the rank number stays the real rank.
    return [...f].sort((a, b) => Number(stars.includes(b.id)) - Number(stars.includes(a.id)));
  }, [bodySites, query, stars]);

  const toggleStar = useCallback(
    (id: string) => {
      writeStars(stars.includes(id) ? stars.filter((x) => x !== id) : [...stars, id]);
    },
    [stars],
  );

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

  const helperTitle = `Each site shows its higher stored v1 score among: ${data.viewsByBody[body].join(", ")}. Hover a row for the target used.`;
  const note = body === "Mars" ? "Mars is a low-confidence secondary result. Sites are compared with the Jezero target only." : null;

  return (
    <div
      data-dashboard-root
      className={cn("flex min-h-0 flex-1 flex-col bg-background", fullscreen && "fixed inset-0 z-[100]")}
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section aria-label="Map" className="relative isolate min-h-[60vh] flex-1 md:min-h-0">
          <div className="absolute inset-0">
            <DashboardMap sites={bodySites} bodyKey={body} theme={theme} hoveredSlug={hovered} onOpen={open} me={me} resizeKey={fullscreen} />
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
            <button type="button" onClick={locate} disabled={locating} className={cn(iconButton, "rounded-full")} aria-label={locating ? "Finding your location" : "Show my location"} title="Show my location">
              {locating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LocateFixed className="h-4 w-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              className={cn(iconButton, "rounded-full")}
              aria-label={fullscreen ? "Exit fullscreen" : "View fullscreen"}
              title={fullscreen ? "Exit fullscreen (Esc)" : "View fullscreen"}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
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
            stars={stars}
            onToggleStar={toggleStar}
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
