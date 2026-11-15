"use client";

import { useEffect, useRef, useState } from "react";

/* Fades a block in the first time it scrolls into view. Server markup is plain, so the content is visible without
   JavaScript and in tests; the reveal class is added only after mount. Reduced motion skips the movement (see globals.css). */
export default function Reveal({ children, className, delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "in">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const rect = el.getBoundingClientRect();
    // Already on screen at load: show it at once, no animation.
    if (rect.top < window.innerHeight * 0.92) return;
    setState("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    // Safety: nothing stays hidden if the observer never fires (print, odd embeds, very tall captures).
    const t = window.setTimeout(() => {
      setState("in");
      io.disconnect();
    }, 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    // @ts-expect-error: the ref type depends on the tag
    <Tag ref={ref} className={className} data-reveal={state === "idle" ? undefined : state} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}
