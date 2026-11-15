"use client";

import { useEffect, useRef, useState } from "react";
import "./hero.css";

/* The hero scene: Earth turning, with a satellite orbiting it. One WebGL2 fragment shader, no library.
   Earth is an equirectangular map on a ray-traced sphere, lit by one sun: a real terminator, night lights, a cloud
   layer and a thin atmosphere. The satellite is a sprite on a tilted orbit. It grows as it comes toward the viewer,
   crosses in front of Earth, and goes behind it on the far side, where the planet hides it. Stars are procedural.
   Motion: the turn of Earth, the orbit, pointer parallax on fine pointers. Rendering pauses off-screen and when the tab is
   hidden. prefers-reduced-motion draws one still frame. Without WebGL2 the Earth disc image is shown instead. */

const TEX = {
  day: "/img/tex/earth-day.jpg",
  night: "/img/tex/earth-night.jpg",
  clouds: "/img/tex/earth-clouds.jpg",
} as const;
const SAT_SRC = "/img/satellite.png";

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPtr;
uniform float uFade;
uniform vec3 uEarth;    // x, y centre in scene units, z radius
uniform vec4 uSat;      // x, y centre, half width, roll
uniform vec3 uSatMeta;  // x: 1 when the satellite exists, y: 1 when it is in front of Earth, z: image width over height
uniform sampler2D tDay;
uniform sampler2D tNight;
uniform sampler2D tClouds;
uniform sampler2D tSat;

const float PI = 3.14159265;
const vec3 SUN = normalize(vec3(-0.62, 0.38, 0.69));

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// Star field: two scales of jittered cells, a few of them bright, all of them twinkling slowly.
vec3 stars(vec2 uv) {
  vec3 c = vec3(0.0);
  for (int layer = 0; layer < 2; layer++) {
    float scale = layer == 0 ? 90.0 : 46.0;
    vec2 g = uv * scale;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id + float(layer) * 17.0);
    if (h > (layer == 0 ? 0.93 : 0.975)) {
      vec2 off = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;
      float d = length(f - off * 0.8);
      float size = layer == 0 ? 0.06 : 0.11;
      float tw = 0.6 + 0.4 * sin(uTime * (0.6 + h * 1.4) + h * 40.0);
      float b = smoothstep(size, 0.0, d) * tw * (layer == 0 ? 0.9 : 1.4);
      vec3 tint = mix(vec3(0.82, 0.88, 1.0), vec3(1.0, 0.93, 0.82), hash(id + 11.3));
      c += tint * b;
    }
  }
  return c;
}

// Equirectangular lookup with seam-safe gradients: the longitude wraps, so mip selection uses the smaller derivative.
vec4 sampleEq(sampler2D t, vec3 n, float rot) {
  float lon = atan(n.x, n.z) + rot;
  float lat = asin(clamp(n.y, -1.0, 1.0));
  float u = lon / (2.0 * PI) + 0.5;
  float v = 0.5 + lat / PI;
  float ua = fract(u);
  float ub = fract(u + 0.5);
  float dxa = dFdx(ua), dya = dFdy(ua);
  float dxb = dFdx(ub), dyb = dFdy(ub);
  vec2 gx = abs(dxa) < abs(dxb) ? vec2(dxa, dFdx(v)) : vec2(dxb, dFdx(v));
  vec2 gy = abs(dya) < abs(dyb) ? vec2(dya, dFdy(v)) : vec2(dyb, dFdy(v));
  return textureGrad(t, vec2(ua, v), gx, gy);
}

vec3 tilt(vec3 n, float a) {
  float c = cos(a), s = sin(a);
  return vec3(n.x * c - n.y * s, n.x * s + n.y * c, n.z);
}

// Earth over the scene. Returns the colour and an alpha that includes the atmosphere glow.
vec4 earth(vec2 p, vec3 b, float rot) {
  vec2 q = (p - b.xy) / b.z;
  float d = length(q);
  // Edge width from the body's size on screen, not from fwidth: a screen derivative near the limb drew a ring.
  float aa = 1.3 / (b.z * uRes.y);
  float halo = 0.16;
  float inside = step(d, 1.0 + halo);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (d < 1.0 + aa) {
    vec3 n = vec3(q, sqrt(max(0.0, 1.0 - d * d)));
    float diff = dot(n, SUN);
    float lit = clamp(diff, 0.0, 1.0);
    float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.6);
    vec3 nn = tilt(n, 0.41);
    vec3 day = sampleEq(tDay, nn, rot).rgb;
    vec3 night = sampleEq(tNight, nn, rot).rgb;
    float cl = sampleEq(tClouds, nn, rot * 1.12 + 0.6).r;
    float ocean = smoothstep(0.08, 0.22, day.b - day.r);
    float spec = pow(max(dot(reflect(-SUN, n), vec3(0.0, 0.0, 1.0)), 0.0), 60.0) * 0.35 * ocean;
    vec3 surf = day * (lit * 1.15 + 0.02) + vec3(spec) * lit;
    surf = mix(surf, vec3(1.0) * (lit * 1.1 + 0.03), cl * 0.9);
    float dusk = smoothstep(0.14, -0.08, diff);
    vec3 lights = night * vec3(1.0, 0.86, 0.6) * dusk * (1.0 - cl * 0.8) * 1.3;
    vec3 atmo = vec3(0.36, 0.62, 1.0) * fres * (lit * 0.9 + 0.12) * 1.1;
    // Terminator warmth: a thin band of scattered light where day meets night.
    float band = smoothstep(0.0, 0.08, diff) * (1.0 - smoothstep(0.08, 0.3, diff));
    col = surf + lights + atmo + vec3(0.9, 0.55, 0.3) * band * 0.08;
    alpha = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, d);
  }

  // Outside the limb: the atmosphere glow, brighter on the sunlit side.
  if (d > 1.0 - aa) {
    float side = clamp(dot(normalize(q), SUN.xy) * 0.5 + 0.6, 0.0, 1.0);
    float g = exp(-(d - 1.0) / (halo * 0.42)) * side * (1.0 - smoothstep(1.0 + halo * 0.55, 1.0 + halo, d));
    float ga = g * 0.75 * (1.0 - alpha);
    col += vec3(0.3, 0.58, 1.0) * ga;
    alpha = alpha + ga;
  }
  return vec4(col, clamp(alpha, 0.0, 1.0)) * inside;
}

// The satellite sprite: rotated by its roll, sampled with straight alpha.
vec4 satellite(vec2 p) {
  if (uSatMeta.x < 0.5) return vec4(0.0);
  vec2 d = p - uSat.xy;
  float cr = cos(uSat.w), sr = sin(uSat.w);
  vec2 q = vec2(cr * d.x + sr * d.y, -sr * d.x + cr * d.y);
  vec2 uv = vec2(q.x / (2.0 * uSat.z) + 0.5, q.y / (2.0 * uSat.z / uSatMeta.z) + 0.5);
  float inb = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec4 s = texture(tSat, clamp(uv, 0.0, 1.0));
  s.a *= inb;
  return s;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 col = vec3(0.0235, 0.0314, 0.0392) * 0.9;
  // A faint cold gradient, like the glow of a planet just out of frame.
  col += vec3(0.05, 0.08, 0.12) * smoothstep(1.2, -0.2, length(p - vec2(0.6, -0.9))) * 0.35;
  col += stars(p + uPtr * 0.006 + vec2(uTime * 0.0006, 0.0)) * 1.1;

  vec4 s = satellite(p);
  // Behind Earth: drawn first, so the planet covers it. In front: drawn last.
  if (uSatMeta.y < 0.5) col = mix(col, s.rgb, s.a);
  // Earth turns west to east, so features move to the right.
  vec4 e = earth(p, uEarth + vec3(uPtr * 0.012, 0.0), 1.344 - uTime * 0.07);
  col = mix(col, e.rgb, e.a);
  if (uSatMeta.y >= 0.5) col = mix(col, s.rgb, s.a);

  // Filmic-ish tone curve and a touch of vignette.
  col = col / (col + 0.55) * 1.42;
  col *= 1.0 - 0.28 * smoothstep(0.5, 1.4, length(p * vec2(0.8, 1.0)));
  col = mix(vec3(0.0235, 0.0314, 0.0392), col, uFade);
  fragColor = vec4(col, 1.0);
}`;

type Layout = { earth: [number, number, number]; orbit: { cx: number; cy: number; a: number; b: number }; satW: number };

/** Scene units: y runs from -0.5 to 0.5 and x is scaled by the aspect ratio. The canvas is the whole hero. Earth rises from
    the bottom edge so its top sits just under the text, and the orbit wraps the visible face. */
function layoutFor(aspect: number): Layout {
  const wide = aspect >= 1.2;
  const r = Math.min(wide ? 0.4 : 0.3, aspect * 0.39); // Earth radius
  const visible = wide ? 0.47 : 0.36; // how much of the canvas height the top of Earth rises into
  const ey = -0.5 + visible - r;
  const satW = r * 0.55;
  const a = Math.max(r * 0.8, Math.min(r * 1.75, aspect / 2 - satW / 2 - 0.03));
  return { earth: [0, ey, r], orbit: { cx: 0, cy: ey + r * 0.62, a, b: wide ? 0.13 : 0.09 }, satW };
}

/** The satellite's place on its orbit at phase phi: position, size factor, in front of Earth or not, and roll. */
function orbit(L: Layout, phi: number) {
  const tilt = -0.2;
  const z = Math.sin(phi); // +1 nearest the viewer
  const lx = -L.orbit.a * Math.cos(phi); // moves left to right in front, the way Earth turns
  const ly = -L.orbit.b * z; // lower on screen when nearer
  const x = L.orbit.cx + lx * Math.cos(tilt) - ly * Math.sin(tilt);
  const y = L.orbit.cy + lx * Math.sin(tilt) + ly * Math.cos(tilt);
  const scale = 0.93 + 0.23 * z;
  return { x, y, scale, front: z > 0, roll: tilt * 0.5 + 0.08 * Math.sin(phi) };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`texture failed: ${src}`));
    img.src = src;
  });
}

export default function HeroScene({ satellite = false }: { satellite?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // preserveDrawingBuffer keeps the last frame on screen, which the reduced-motion still image depends on.
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
    if (!gl || gl.isContextLost()) {
      setFallback(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
    } catch {
      setFallback(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = { res: u("uRes"), time: u("uTime"), ptr: u("uPtr"), fade: u("uFade"), earth: u("uEarth"), sat: u("uSat"), satMeta: u("uSatMeta") };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");

    // One texture unit per map. A 1x1 placeholder keeps the first frames valid while the images load.
    const names = ["tDay", "tNight", "tClouds", "tSat"] as const;
    names.forEach((n, i) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 24, 28, 0]));
      gl.uniform1i(u(n), i);
    });

    let fade = 0;
    let fadeTarget = 0;
    let loaded = false;
    let disposed = false;
    let satReady = false;
    let satAR = 1.6;

    const upload = (unit: number, img: HTMLImageElement, wrapS: number, rgba: boolean) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      const fmt = rgba ? gl.RGBA : gl.RGB;
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    };

    Promise.all([TEX.day, TEX.night, TEX.clouds].map(loadImage))
      .then(async (imgs) => {
        if (disposed) return;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        imgs.forEach((img, i) => upload(i, img, gl.REPEAT, false));
        // The satellite is optional. If its file is missing or fails, Earth still turns on its own.
        if (satellite) {
          try {
            const sat = await loadImage(SAT_SRC);
            if (!disposed) {
              upload(3, sat, gl.CLAMP_TO_EDGE, true);
              satAR = sat.naturalWidth / sat.naturalHeight;
              satReady = true;
            }
          } catch {
            satReady = false;
          }
        }
        if (disposed) return;
        loaded = true;
        fadeTarget = 1;
        canvas.setAttribute("data-ready", "true");
        if (reduce.matches) {
          fade = 1;
          drawStill();
        } else {
          schedule();
        }
      })
      .catch(() => {
        if (!disposed) setFallback(true);
      });

    // Size: device pixels capped at 1.5x and at 1600 px wide, so phones and 4K displays both stay smooth.
    let layout: Layout = layoutFor(1.6);
    let w = 1;
    let h = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5, 1600 / Math.max(1, rect.width));
      w = Math.max(1, Math.round(rect.width * dpr));
      h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      layout = layoutFor(rect.width / Math.max(1, rect.height));
      gl.uniform3f(U.earth, ...layout.earth);
      gl.uniform2f(U.res, w, h);
      if (reduce.matches && loaded) drawStill();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Pointer parallax, eased, fine pointers only.
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    const onMove = (ev: PointerEvent) => {
      if (reduce.matches || !fine.matches) return;
      const b = canvas.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((ev.clientX - b.left) / b.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, -(((ev.clientY - b.top) / b.height) * 2 - 1)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const t0 = performance.now();
    // The orbit period is about 30 s, a few times faster than Earth turns.
    const PHI0 = 2.3;
    function draw(now: number) {
      const t = (now - t0) / 1000;
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      fade += (fadeTarget - fade) * 0.04;
      gl!.uniform1f(U.time, t);
      gl!.uniform2f(U.ptr, px, py);
      gl!.uniform1f(U.fade, Math.min(1, fade + 0.001));
      const o = orbit(layout, reduce.matches ? PHI0 : PHI0 + t * 0.21);
      const satW = layout.satW * o.scale;
      gl!.uniform4f(U.sat, o.x, o.y, satW / 2, o.roll);
      gl!.uniform3f(U.satMeta, satReady ? 1 : 0, o.front ? 1 : 0, satAR);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden || disposed) return;
      draw(now);
      schedule();
    }
    function schedule() {
      if (!raf && !reduce.matches) raf = requestAnimationFrame(frame);
    }
    // Reduced motion: one still image. Drawn on three consecutive frames so a layout pass right after the first
    // draw (fonts, header height) cannot clear the canvas and leave it empty.
    let stillFrames = 0;
    function drawStill() {
      stillFrames = 3;
      const tick = (now: number) => {
        if (disposed) return;
        draw(now);
        if (--stillFrames > 0) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && loaded) schedule();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden && visible && loaded) schedule();
    };
    document.addEventListener("visibilitychange", onVis);
    const onReduce = () => {
      if (!reduce.matches) schedule();
      else if (loaded) drawStill();
    };
    reduce.addEventListener("change", onReduce);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      reduce.removeEventListener("change", onReduce);
      // The context is left alive on purpose: React can remount this component (StrictMode, navigation back),
      // and a context that was lost on purpose cannot compile shaders again.
    };
  }, [satellite]);

  if (fallback) {
    return (
      <div className="hero-fallback" role="img" aria-label="Earth">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/bodies/earth.jpg" alt="" className="hero-fallback__earth" />
      </div>
    );
  }
  return <canvas ref={ref} className="hero-scene" role="img" aria-label="Earth turning, with a satellite orbiting it" />;
}
