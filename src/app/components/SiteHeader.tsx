"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { NAV, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

const MENU_ID = "mobile-menu";

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
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-2 text-sm transition-colors",
                  active ? "text-foreground underline underline-offset-8 decoration-2" : "text-secondary-foreground hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-border text-secondary-foreground md:hidden"
            aria-expanded={open}
            aria-controls={MENU_ID}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      <nav id={MENU_ID} aria-label="Main (menu)" hidden={!open} className="border-t border-border bg-background md:hidden">
        <ul className="mx-auto max-w-6xl px-6 py-2">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined} className="flex min-h-11 items-center text-base text-foreground">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
