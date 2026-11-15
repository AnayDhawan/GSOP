"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap, ZoomControl } from "react-leaflet";
import { latLngBounds } from "leaflet";
import { INDIA_BOUNDS, scoreColor, type DashExtent, type DashSite } from "@/lib/dashboard";

export type Locate = { lat: number; lon: number } | null;

// Esri World Street Map: a normal coloured web map, no key needed. CARTO's free tiles now serve a watermarked placeholder
// (the same finding as the UCIP dashboard, which moved to Esri). Both themes use the same map.
const TILE_URL = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const ATTRIBUTION = '&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors';
const RADIUS_COLOR = "#E8A33D";

/** Frames the map whenever the body or the extent changes: the India window, or the sites of the active body. */
function FitToExtent({ sites, bodyKey, extent }: { sites: DashSite[]; bodyKey: string; extent: DashExtent }) {
  const map = useMap();
  const last = useRef<string | null>(null);
  useEffect(() => {
    const key = `${bodyKey}/${extent}`;
    if (last.current === key) return;
    const first = last.current === null;
    last.current = key;
    if (extent === "India") {
      map.fitBounds(latLngBounds(INDIA_BOUNDS), { padding: [24, 24], animate: !first });
      return;
    }
    if (sites.length === 0) return;
    const b = latLngBounds(sites.map((s) => [s.lat, s.lon] as [number, number]));
    if (b.isValid()) map.fitBounds(b, { padding: [40, 40], maxZoom: 4, animate: !first });
  }, [map, sites, bodyKey, extent]);
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

/** Zooms to the selected site so the match-radius ring is readable, and keeps the current zoom if already close. */
function FlyToSelected({ site }: { site: DashSite | null }) {
  const map = useMap();
  useEffect(() => {
    if (site) map.flyTo([site.lat, site.lon], Math.max(map.getZoom(), 9), { duration: 0.9 });
  }, [site, map]);
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
  extent,
  hoveredSlug,
  selected,
  onSelect,
  radiusKm,
  me,
  resizeKey,
}: {
  sites: DashSite[];
  bodyKey: string;
  extent: DashExtent;
  hoveredSlug: string | null;
  selected: DashSite | null;
  onSelect: (site: DashSite) => void;
  radiusKm: number;
  me: Locate;
  resizeKey: unknown;
}) {
  // Draw the lowest scores first so the highest sit on top, and unscored sites underneath everything.
  const drawOrder = useMemo(() => [...sites].reverse(), [sites]);
  return (
    <MapContainer center={[20, 10]} zoom={2} minZoom={2} worldCopyJump zoomSnap={0.5} zoomControl={false} style={{ height: "100%", width: "100%" }} attributionControl>
      {/* Bottom right, so the control bar at the top never covers it on a phone. */}
      <ZoomControl position="bottomright" />
      <TileLayer attribution={ATTRIBUTION} url={TILE_URL} />
      {selected && (
        // The v1 match radius: the area v1 searched around the site for its best tile. A search window, not a site boundary.
        <Circle
          center={[selected.lat, selected.lon]}
          radius={radiusKm * 1000}
          interactive={false}
          pathOptions={{ color: RADIUS_COLOR, weight: 1.5, dashArray: "6 6", fillColor: RADIUS_COLOR, fillOpacity: 0.07 }}
        >
          <Tooltip direction="bottom" permanent offset={[0, 74]} className="gsop-radius-tip">
            {radiusKm} km v1 match radius
          </Tooltip>
        </Circle>
      )}
      {drawOrder.map((s) => {
        const hovered = s.slug === hoveredSlug;
        const active = selected?.id === s.id;
        return (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lon]}
            radius={hovered || active ? 12 : 8}
            pathOptions={{ fillColor: scoreColor(s.scoreValue), fillOpacity: s.scoreValue === null ? 0.7 : 0.95, color: active ? RADIUS_COLOR : "#ffffff", weight: hovered || active ? 3 : 2 }}
            eventHandlers={{
              click: () => onSelect(s),
              add: (e) => {
                // Path layers are not focusable by default. Make each one a button that opens the site card.
                const el = (e.target as unknown as { getElement?: () => HTMLElement | undefined }).getElement?.();
                if (!el) return;
                el.setAttribute("tabindex", "0");
                el.setAttribute("role", "button");
                el.setAttribute("aria-label", `${s.name}${s.scoreText ? `, score ${s.scoreText}` : ", no score"}`);
                el.addEventListener("keydown", (ev: KeyboardEvent) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onSelect(s);
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
      <FitToExtent sites={sites} bodyKey={bodyKey} extent={extent} />
      <InvalidateSize dep={resizeKey} />
      <FlyToLocation at={me} />
      <FlyToSelected site={selected} />
      <MapAccessibleName label={`Map of ${bodyKey} analog sites, coloured by similarity score`} />
    </MapContainer>
  );
}
