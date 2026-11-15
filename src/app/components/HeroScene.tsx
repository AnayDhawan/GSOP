"use client";

import { useEffect, useRef, useState } from "react";
import "./hero.css";

/* The hero scene: the Moon, Earth and Mars as lit spheres, rendered in one WebGL2 fragment shader with no library.
   Each body is an equirectangular map wrapped on a ray-traced sphere, lit by one sun: a real terminator, night lights
   and a cloud layer on Earth, a thin atmosphere on Earth and a dust halo on Mars. Stars are procedural.
   Motion: slow axial rotation, pointer parallax on fine pointers. Rendering pauses off-screen and when the tab is
   hidden. prefers-reduced-motion renders one still frame. Without WebGL2 the static disc images are shown instead. */

const TEX = {
  day: "/img/tex/earth-day.jpg",
  night: "/img/tex/earth-night.jpg",
  clouds: "/img/tex/earth-clouds.jpg",
  moon: "/img/tex/moon.jpg",
  mars: "/img/tex/mars.jpg",
} as const;

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
uniform vec3 uEarth;   // x, y centre in scene units, z radius
uniform vec3 uMoon;
uniform vec3 uMars;
uniform sampler2D tDay;
uniform sampler2D tNight;
uniform sampler2D tClouds;
uniform sampler2D tMoon;
uniform sampler2D tMars;

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

// Composites one body over the scene. Returns the colour and an alpha that includes the halo.
vec4 body(int kind, vec2 p, vec3 b, float rot) {
  vec2 q = (p - b.xy) / b.z;
  float d = length(q);
  // Edge width from the body's size on screen, not from fwidth: screen derivatives are not reliable near an early
  // return, and a bad width here drew a dashed ring at the halo edge.
  float aa = 1.3 / (b.z * uRes.y);
  float halo = kind == 1 ? 0.16 : (kind == 2 ? 0.07 : 0.02);
  float inside = step(d, 1.0 + halo);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (d < 1.0 + aa) {
    vec3 n = vec3(q, sqrt(max(0.0, 1.0 - d * d)));
    float diff = dot(n, SUN);
    float lit = clamp(diff, 0.0, 1.0);
    float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.6);
    if (kind == 1) {
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
    } else if (kind == 2) {
      vec3 nn = tilt(n, 0.44);
      vec3 tex = sampleEq(tMars, nn, rot).rgb;
      vec3 dust = vec3(0.95, 0.62, 0.45) * fres * (lit * 0.8 + 0.08) * 0.45;
      col = tex * (lit * 1.2 + 0.015) + dust;
    } else {
      vec3 nn = tilt(n, 0.12);
      vec3 tex = sampleEq(tMoon, nn, rot).rgb;
      col = tex * vec3(1.0, 0.985, 0.96) * (pow(lit, 0.85) * 1.25 + 0.01);
    }
    alpha = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, d);
  }

  // Outside the limb: the halo, brighter on the sunlit side.
  if (d > 1.0 - aa) {
    float side = clamp(dot(normalize(q), SUN.xy) * 0.5 + 0.6, 0.0, 1.0);
    float g = exp(-(d - 1.0) / (halo * 0.42)) * side * (1.0 - smoothstep(1.0 + halo * 0.55, 1.0 + halo, d));
    vec3 gc = kind == 1 ? vec3(0.3, 0.58, 1.0) : (kind == 2 ? vec3(0.9, 0.5, 0.35) : vec3(0.7, 0.72, 0.75));
    float ga = g * (kind == 1 ? 0.75 : (kind == 2 ? 0.35 : 0.18)) * (1.0 - alpha);
    col += gc * ga;
    alpha = alpha + ga;
  }
  return vec4(col, clamp(alpha, 0.0, 1.0)) * inside;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 col = vec3(0.0235, 0.0314, 0.0392) * 0.9;
  // A faint cold gradient, like the glow of a planet just out of frame.
  col += vec3(0.05, 0.08, 0.12) * smoothstep(1.2, -0.2, length(p - vec2(0.6, -0.9))) * 0.35;
  col += stars(p + uPtr * 0.006 + vec2(uTime * 0.0006, 0.0)) * 1.1;

  float t = uTime;
  vec4 m = body(0, p, uMoon + vec3(uPtr * 0.028, 0.0), 1.2 + t * 0.031);
  col = mix(col, m.rgb, m.a);
  vec4 r = body(2, p, uMars + vec3(uPtr * 0.022, 0.0), 2.4 + t * 0.057);
  col = mix(col, r.rgb, r.a);
  vec4 e = body(1, p, uEarth + vec3(uPtr * 0.012, 0.0), 1.344 + t * 0.07);
  col = mix(col, e.rgb, e.a);

  // Filmic-ish tone curve and a touch of vignette.
  col = col / (col + 0.55) * 1.42;
  col *= 1.0 - 0.28 * smoothstep(0.5, 1.4, length(p * vec2(0.8, 1.0)));
  col = mix(vec3(0.0235, 0.0314, 0.0392), col, uFade);
  fragColor = vec4(col, 1.0);
}`;

type Layout = { earth: [number, number, number]; moon: [number, number, number]; mars: [number, number, number] };

/** Body positions in scene units (y from -0.5 to 0.5, x scaled by aspect). Earth in front, Moon left, Mars right. */
function layoutFor(aspect: number): Layout {
  if (aspect < 1.2) {
    // Phones: the scene is a block above the copy, so the trio sits centred with Earth in front.
    return { earth: [0.0, -0.04, 0.36], moon: [-0.37, 0.27, 0.09], mars: [0.37, 0.25, 0.115] };
  }
  if (aspect < 1.5) {
    return { earth: [0.3, -0.06, 0.36], moon: [-0.08, 0.3, 0.1], mars: [0.66, 0.26, 0.14] };
  }
  const half = aspect / 2;
  return { earth: [half * 0.58, -0.1, 0.4], moon: [half * 0.24, 0.33, 0.1], mars: [half * 0.8, 0.3, 0.15] };
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
    const U = { res: u("uRes"), time: u("uTime"), ptr: u("uPtr"), fade: u("uFade"), earth: u("uEarth"), moon: u("uMoon"), mars: u("uMars") };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");

    // One texture unit per map. A 1x1 placeholder keeps the first frames valid while the images load.
    const names = ["tDay", "tNight", "tClouds", "tMoon", "tMars"] as const;
    const srcs = [TEX.day, TEX.night, TEX.clouds, TEX.moon, TEX.mars];
    names.forEach((n, i) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([20, 24, 28]));
      gl.uniform1i(u(n), i);
    });

    let fade = 0;
    let fadeTarget = 0;
    let loaded = false;
    let disposed = false;
    Promise.all(srcs.map(loadImage))
      .then((imgs) => {
        if (disposed) return;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        imgs.forEach((img, i) => {
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
        });
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
      const L = layoutFor(rect.width / Math.max(1, rect.height));
      gl.uniform3f(U.earth, ...L.earth);
      gl.uniform3f(U.moon, ...L.moon);
      gl.uniform3f(U.mars, ...L.mars);
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
    function draw(now: number) {
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      fade += (fadeTarget - fade) * 0.04;
      gl!.uniform1f(U.time, (now - t0) / 1000);
      gl!.uniform2f(U.ptr, px, py);
      gl!.uniform1f(U.fade, Math.min(1, fade + 0.001));
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
  }, []);

  if (fallback) {
    return (
      <div className="hero-fallback" role="img" aria-label="The Moon, Earth and Mars">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/bodies/moon.jpg" alt="" className="hero-fallback__moon" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/bodies/earth.jpg" alt="" className="hero-fallback__earth" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/bodies/mars.jpg" alt="" className="hero-fallback__mars" />
      </div>
    );
  }
  return (
    <>
      <canvas ref={ref} className="hero-scene" role="img" aria-label="The Moon, Earth and Mars, lit by the Sun, slowly turning" />
      {satellite && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/img/satellite.png" alt="" aria-hidden className="hero-sat" draggable={false} />
      )}
    </>
  );
}
