"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { DOCS, NAV, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

const MENU_ID = "mobile-menu";
const DOCS_ID = "docs-menu";

const linkClass = (active: boolean) =>
  cn("px-3 py-2 text-sm transition-colors", active ? "text-foreground underline underline-offset-8 decoration-2" : "text-secondary-foreground hover:text-foreground");

function DocsMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = isActive(pathname, "/docs");

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-controls={DOCS_ID} aria-haspopup="true" onClick={() => setOpen((v) => !v)} className={linkClass(active || open)}>
        Docs
      </button>
      <ul id={DOCS_ID} hidden={!open} className="absolute left-0 top-full z-50 mt-2 w-72 border border-border bg-surface py-1 shadow-lg">
        {DOCS.map((d) => (
          <li key={d.href}>
            <Link href={d.href} onClick={() => setOpen(false)} aria-current={isActive(pathname, d.href) ? "page" : undefined} className="block px-4 py-2.5 text-sm hover:bg-surface-raised">
              <span className="block text-foreground">{d.label}</span>
              <span className="block text-xs text-muted-foreground">{d.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu after navigating and on Escape.
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" aria-label="GSOP home" className="relative flex shrink-0 items-center before:absolute before:-inset-2 before:content-['']">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.slice(0, 2).map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined} className={linkClass(isActive(pathname, n.href))}>
              {n.label}
            </Link>
          ))}
          <DocsMenu pathname={pathname} />
          {NAV.slice(2).map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined} className={linkClass(isActive(pathname, n.href))}>
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="group relative -mr-2 inline-flex size-11 items-center justify-center text-foreground md:hidden"
          aria-expanded={open}
          aria-controls={MENU_ID}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Three bars that turn into an X. Plain spans, so the header carries no icon svg. */}
          <span aria-hidden className="relative block h-3.5 w-6">
            <span className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-200 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition-opacity duration-150 ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-200 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      <nav id={MENU_ID} aria-label="Main (menu)" hidden={!open} className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-border bg-background md:hidden">
        <ul className="mx-auto max-w-6xl px-6 py-2">
          {NAV.map((n) => (
            <li key={n.href} className="border-b border-border last:border-b-0">
              <Link
                href={n.href}
                aria-current={isActive(pathname, n.href) ? "page" : undefined}
                className={`flex min-h-12 items-center justify-between text-lg ${isActive(pathname, n.href) ? "font-semibold text-foreground" : "text-secondary-foreground"}`}
              >
                {n.label}
                {isActive(pathname, n.href) ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-earth" /> : null}
              </Link>
            </li>
          ))}
          <li className="border-t border-border pb-2 pt-3">
            <p className="gsop-label py-1">Docs</p>
            <ul>
              {DOCS.map((d) => (
                <li key={d.href}>
                  <Link href={d.href} aria-current={isActive(pathname, d.href) ? "page" : undefined} className="flex min-h-12 items-center text-base text-secondary-foreground">
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
}
