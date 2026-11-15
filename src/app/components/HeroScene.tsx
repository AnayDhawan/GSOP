"use client";

import { useEffect, useId, useRef } from "react";
import "./hero.css";

/* Moon, Earth and Mars on the brand's three-body composition, with a tile-grid scan over Earth.
   SVG and CSS only. Motion: slow float, satellites on rings, pointer parallax on fine pointers, a scan sweep
   across Earth. Animation pauses off-screen and is switched off for prefers-reduced-motion (static scene). */

const W = 1200;
const H = 520;
const CY = 270;
const BODIES = [
  { key: "moon", src: "/img/bodies/moon.jpg", cx: 215, r: 118, dur: "10s", delay: "-2s", ring: 46, spin: "52s", rev: true, label: "Moon" },
  { key: "earth", src: "/img/bodies/earth.jpg", cx: 600, r: 128, dur: "12s", delay: "-6s", ring: 52, spin: "44s", rev: false, label: "Earth" },
  { key: "mars", src: "/img/bodies/mars.jpg", cx: 985, r: 118, dur: "9s", delay: "-4s", ring: 46, spin: "58s", rev: true, label: "Mars" },
] as const;

// Fixed star field, from a seeded generator so server and client markup match.
function stars() {
  let s = 20261115;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: 64 }, (_, i) => ({ x: Math.round(rnd() * W), y: Math.round(rnd() * H), r: 0.6 + rnd() * 1.3, g: i % 3 }));
}
const STARS = stars();

// Earth tiles that light up during the scan: x offset, y offset from the Earth centre, in scene units.
const TILES = [
  { x: -60, y: -50, d: "0s" },
  { x: -18, y: 4, d: "0.5s" },
  { x: 24, y: -62, d: "1.1s" },
  { x: 58, y: 30, d: "1.6s" },
  { x: -80, y: 52, d: "2.1s" },
  { x: 4, y: 62, d: "0.8s" },
] as const;

export default function HeroScene() {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    // Pause every animation while the scene is off-screen or the tab is hidden.
    const io = new IntersectionObserver(([e]) => el.setAttribute("data-paused", String(!e.isIntersecting)), { threshold: 0 });
    io.observe(el);
    const onVis = () => document.hidden && el.setAttribute("data-paused", "true");
    document.addEventListener("visibilitychange", onVis);

    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--px", nx.toFixed(3));
      el.style.setProperty("--py", ny.toFixed(3));
    };
    const onMove = (ev: PointerEvent) => {
      if (reduce.matches || !fine.matches) return;
      const b = el.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, ((ev.clientX - b.left) / b.width) * 2 - 1));
      ny = Math.max(-1, Math.min(1, ((ev.clientY - b.top) / b.height) * 2 - 1));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const earth = BODIES[1];

  return (
    <svg ref={ref} className="hero-scene" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The Moon, Earth and Mars, with a tile grid scanning across Earth" preserveAspectRatio="xMidYMid meet">
      <defs>
        {BODIES.map((b) => (
          <clipPath key={b.key} id={`${uid}-clip-${b.key}`}>
            <circle cx={b.cx} cy={CY} r={b.r} />
          </clipPath>
        ))}
        <pattern id={`${uid}-grid`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="rgb(var(--hero-grid))" strokeOpacity="0.16" strokeWidth="0.8" />
        </pattern>
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0.55" stopColor="var(--hero-halo)" stopOpacity="var(--hero-halo-alpha)" />
          <stop offset="1" stopColor="var(--hero-halo)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0" stopColor="rgb(var(--hero-shadow))" stopOpacity="var(--hero-shadow-alpha)" />
          <stop offset="1" stopColor="rgb(var(--hero-shadow))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-scan`} x1="0" x2="1">
          <stop offset="0" stopColor="var(--hero-scan)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--hero-scan)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--hero-scan)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="hero-layer hero-layer--stars" aria-hidden>
        {[0, 1, 2].map((g) => (
          <g key={g} className="hero-twinkle" style={{ "--dur": `${5 + g * 2}s`, "--delay": `${-g * 1.7}s` } as React.CSSProperties}>
            {STARS.filter((s) => s.g === g).map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="rgb(var(--hero-star))" fillOpacity="var(--hero-star-alpha)" />
            ))}
          </g>
        ))}
      </g>

      <g className="hero-layer hero-layer--rings" aria-hidden>
        {/* Path between the three bodies: the comparison the screening makes. */}
        <path d={`M ${BODIES[0].cx} ${CY + 170} Q ${earth.cx} ${CY + 235} ${BODIES[2].cx} ${CY + 170}`} fill="none" stroke="rgb(var(--hero-ring))" strokeOpacity="var(--hero-ring-alpha)" strokeWidth="1" strokeDasharray="2 7" />
      </g>

      {BODIES.map((b) => (
        <g key={b.key} className={`hero-layer hero-layer--${b.key}`}>
          <ellipse cx={b.cx} cy={CY + b.r + 34} rx={b.r * 0.8} ry={9} fill={`url(#${uid}-shadow)`} aria-hidden />
          {b.key === "earth" && <circle cx={b.cx} cy={CY} r={b.r * 1.55} fill={`url(#${uid}-halo)`} aria-hidden />}
          <g className="hero-float" style={{ "--dur": b.dur, "--delay": b.delay } as React.CSSProperties}>
            <image href={b.src} x={b.cx - b.r} y={CY - b.r} width={b.r * 2} height={b.r * 2} clipPath={`url(#${uid}-clip-${b.key})`} preserveAspectRatio="xMidYMid slice">
              <title>{b.label}</title>
            </image>
            {/* Tile grid over every body: the unit the screening scores. */}
            <circle cx={b.cx} cy={CY} r={b.r} fill={`url(#${uid}-grid)`} aria-hidden />
            <g aria-hidden style={{ transformOrigin: `${b.cx}px ${CY}px`, "--dur": b.spin } as React.CSSProperties} className={`hero-spin${b.rev ? " hero-spin--rev" : ""}`}>
              <circle cx={b.cx} cy={CY} r={b.r + b.ring} fill="none" stroke="rgb(var(--hero-ring))" strokeOpacity="var(--hero-ring-alpha)" strokeWidth="1" strokeDasharray="1 6" />
              <circle cx={b.cx + b.r + b.ring} cy={CY} r={3.2} fill="rgb(var(--hero-ring))" fillOpacity="0.8" />
            </g>
            {b.key === "earth" && (
              <g clipPath={`url(#${uid}-clip-earth)`} aria-hidden>
                {TILES.map((t, i) => (
                  <rect key={i} className="hero-tile" x={b.cx + t.x} y={CY + t.y} width={16} height={16} fill="var(--hero-scan)" style={{ "--delay": t.d } as React.CSSProperties} />
                ))}
                <g style={{ transformOrigin: `${b.cx}px ${CY}px` }}>
                  <rect className="hero-scan" x={b.cx - 24} y={CY - b.r} width={48} height={b.r * 2} fill={`url(#${uid}-scan)`} />
                </g>
              </g>
            )}
          </g>
        </g>
      ))}
    </svg>
  );
}
