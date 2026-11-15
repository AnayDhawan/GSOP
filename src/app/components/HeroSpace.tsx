"use client";

import { useEffect, useRef } from "react";

/* Deep-space backdrop for the landing hero: a nebula glow in CSS, and a canvas of drifting, twinkling stars with the
   odd shooting star. Pauses off-screen and when the tab is hidden. Under prefers-reduced-motion it paints one still
   frame. Decorative only. */

type Star = { x: number; y: number; z: number; r: number; p: number; s: number; hue: number };

function makeStars(n: number): Star[] {
  let seed = 20261115;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: n }, () => ({ x: rnd(), y: rnd(), z: 0.25 + rnd() * 0.75, r: 0.4 + rnd() * 1.2, p: rnd() * Math.PI * 2, s: 0.4 + rnd() * 1.4, hue: rnd() }));
}

export default function HeroSpace() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = makeStars(window.innerWidth < 640 ? 140 : 260);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let visible = true;
    let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = 3500;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const b = canvas.getBoundingClientRect();
      w = b.width;
      h = b.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        // Slow drift to the left, faster for the near stars, wrapping at the edge.
        const x = (((s.x - (reduce ? 0 : t * 0.000004 * s.z)) % 1) + 1) % 1;
        const tw = reduce ? 0.85 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.s + s.p);
        const a = Math.min(1, tw * (0.35 + s.z * 0.65));
        // A few stars lean blue or warm, the rest are white.
        ctx.fillStyle = s.hue < 0.12 ? `rgba(160,200,255,${a})` : s.hue > 0.9 ? `rgba(255,214,170,${a})` : `rgba(240,242,248,${a})`;
        ctx.beginPath();
        ctx.arc(x * w, s.y * h, s.r * (0.6 + s.z * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) {
        nextShoot -= dt;
        if (!shoot && nextShoot <= 0) {
          shoot = { x: w * (0.3 + Math.random() * 0.6), y: h * Math.random() * 0.35, vx: -(0.5 + Math.random() * 0.4), vy: 0.22 + Math.random() * 0.15, life: 1 };
          nextShoot = 6000 + Math.random() * 7000;
        }
        if (shoot) {
          const len = 90;
          const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * len, shoot.y - shoot.vy * len);
          g.addColorStop(0, `rgba(255,255,255,${0.9 * shoot.life})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(shoot.x - shoot.vx * len, shoot.y - shoot.vy * len);
          ctx.stroke();
          shoot.x += shoot.vx * dt;
          shoot.y += shoot.vy * dt;
          shoot.life -= dt / 1100;
          if (shoot.life <= 0) shoot = null;
        }
      }
    };

    let last = performance.now();
    const loop = (now: number) => {
      raf = 0;
      if (!running || !visible) return;
      const dt = Math.min(now - last, 64);
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce || raf || !running || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    resize();
    draw(0, 0);
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now(), 0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => {
      running = !document.hidden;
      if (running) start();
    };
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div aria-hidden data-testid="hero-space" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#02030a]">
      <div className="space-nebula absolute inset-0" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 space-vignette" />
    </div>
  );
}
