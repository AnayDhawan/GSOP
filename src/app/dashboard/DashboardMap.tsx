"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import { scoreColor, type DashSite } from "@/lib/dashboard";

export type Locate = { lat: number; lon: number } | null;

// Esri Canvas tiles need no key. CARTO's free tiles now serve a watermarked placeholder (the same finding as the UCIP
// dashboard, which moved to Esri), so both themes use the Esri gray canvases.
const ESRI = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas";
const TILES = {
  light: { base: `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labels: `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
  dark: { base: `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labels: `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
} as const;
const ATTRIBUTION = '&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors';

/** Frames the map to the sites of the active body whenever the body changes. */
function FitToSites({ sites, bodyKey }: { sites: DashSite[]; bodyKey: string }) {
  const map = useMap();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current === bodyKey || sites.length === 0) return;
    last.current = bodyKey;
    const b = latLngBounds(sites.map((s) => [s.lat, s.lon] as [number, number]));
    if (b.isValid()) map.fitBounds(b, { padding: [40, 40], maxZoom: 4, animate: false });
  }, [map, sites, bodyKey]);
  return null;
}

/** Leaflet caches the container size, so tell it when the layout changes (panel stacking, fullscreen). */
function InvalidateSize({ dep }: { dep: unknown }) {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    map.invalidateSize();
    const ids = [60, 260].map((ms) => window.setTimeout(() => map.invalidateSize(), ms));
    return () => ids.forEach(window.clearTimeout);
  }, [dep, map]);
  return null;
}

function FlyToLocation({ at }: { at: Locate }) {
  const map = useMap();
  useEffect(() => {
    if (at) map.flyTo([at.lat, at.lon], Math.max(map.getZoom(), 5), { duration: 0.8 });
  }, [at, map]);
  return null;
}

/** react-leaflet does not forward aria-label to the container, so set it on the real node. */
function MapAccessibleName({ label }: { label: string }) {
  const map = useMap();
  useEffect(() => {
    map.getContainer().setAttribute("aria-label", label);
  }, [map, label]);
  return null;
}

export default function DashboardMap({
  sites,
  bodyKey,
  theme,
  hoveredSlug,
  onOpen,
  me,
  resizeKey,
}: {
  sites: DashSite[];
  bodyKey: string;
  theme: "light" | "dark";
  hoveredSlug: string | null;
  onOpen: (slug: string) => void;
  me: Locate;
  resizeKey: unknown;
}) {
  // Draw the lowest scores first so the highest sit on top, and unscored sites underneath everything.
  const drawOrder = useMemo(() => [...sites].reverse(), [sites]);
  const stroke = theme === "dark" ? "#ecede8" : "#171c20";
  const tiles = TILES[theme];
  return (
    <MapContainer center={[20, 10]} zoom={2} minZoom={2} worldCopyJump zoomSnap={0.5} style={{ height: "100%", width: "100%" }} attributionControl>
      <TileLayer key={`${theme}-base`} attribution={ATTRIBUTION} url={tiles.base} />
      <TileLayer key={`${theme}-labels`} url={tiles.labels} />
      {drawOrder.map((s) => {
        const hovered = s.slug === hoveredSlug;
        return (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lon]}
            radius={hovered ? 11 : 7}
            pathOptions={{ fillColor: scoreColor(s.scoreValue), fillOpacity: s.scoreValue === null ? 0.55 : 0.9, color: stroke, weight: hovered ? 2.5 : 1 }}
            eventHandlers={{
              click: () => onOpen(s.slug),
              add: (e) => {
                // Path layers are not focusable by default. Make each one a button that opens the profile.
                const el = (e.target as unknown as { getElement?: () => HTMLElement | undefined }).getElement?.();
                if (!el) return;
                el.setAttribute("tabindex", "0");
                el.setAttribute("role", "link");
                el.setAttribute("aria-label", `${s.name}${s.scoreText ? `, score ${s.scoreText}` : ", no score"}`);
                el.addEventListener("keydown", (ev: KeyboardEvent) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onOpen(s.slug);
                  }
                });
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <strong>{s.name}</strong>
              <br />
              {s.scoreText ? `Score ${s.scoreText}` : "No score"}
            </Tooltip>
          </CircleMarker>
        );
      })}
      {me && <CircleMarker center={[me.lat, me.lon]} radius={6} pathOptions={{ fillColor: "#287DB5", fillOpacity: 1, color: "#ffffff", weight: 2 }} interactive={false} />}
      <FitToSites sites={sites} bodyKey={bodyKey} />
      <InvalidateSize dep={resizeKey} />
      <FlyToLocation at={me} />
      <MapAccessibleName label={`Map of ${bodyKey} analog sites, colored by similarity score`} />
    </MapContainer>
  );
}
