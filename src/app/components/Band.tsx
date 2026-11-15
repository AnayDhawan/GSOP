import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* A full-width band with its own look, so the sections of a page read as different from each other.
   plain: no fill. raised: filled surface with rules. grid: tile-grid pattern (the grid the screening scores). accent: heavy left rule. */
const TONES = {
  plain: "",
  raised: "bg-surface border-y border-border",
  grid: "band-grid border-y border-border",
  accent: "bg-surface-raised border-y border-border band-accent",
} as const;

export default function Band({ tone = "plain", children, className, labelledBy }: { tone?: keyof typeof TONES; children: ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cn("relative left-1/2 my-10 w-screen -translate-x-1/2", TONES[tone], className)}>
      <div className="mx-auto w-full max-w-6xl px-6 py-12">{children}</div>
    </section>
  );
}
