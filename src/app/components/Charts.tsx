import type { ReactNode } from "react";

/* Small charts drawn with plain HTML and CSS, so every value is also real text on the page. Geometry comes from the
   numeric `value`; the printed label is `display`, the string stored in claims.csv. Colour is never the only signal:
   each row names itself and prints its value. */

export type Tone = "moon" | "earth" | "mars" | "control" | "positive" | "muted";
const FILL: Record<Tone, string> = { moon: "bg-moon", earth: "bg-earth", mars: "bg-mars", control: "bg-control", positive: "bg-positive", muted: "bg-muted-foreground" };

export type Row = { label: string; value: number; display: string; tone?: Tone; note?: string };

function Figure({ title, caption, children }: { title: string; caption?: ReactNode; children: ReactNode }) {
  return (
    <figure className="space-y-3">
      <figcaption className="space-y-1">
        <span className="block font-display text-lg">{title}</span>
        {caption ? <span className="block text-sm text-secondary-foreground">{caption}</span> : null}
      </figcaption>
      {children}
    </figure>
  );
}

/** Horizontal bars on a 0 to max scale, with an optional reference line (a pre-registered threshold, a chance level). */
export function BarChart({ title, caption, rows, max = 100, reference }: { title: string; caption?: ReactNode; rows: Row[]; max?: number; reference?: { value: number; label: string } }) {
  return (
    <Figure title={title} caption={caption}>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[minmax(7rem,12rem)_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate" title={r.label}>
              {r.label}
            </span>
            <span className="relative block h-3 bg-surface-raised">
              <span className={`absolute inset-y-0 left-0 ${FILL[r.tone ?? "earth"]}`} style={{ width: `${Math.max(0, Math.min(100, (r.value / max) * 100))}%` }} />
              {reference ? <span aria-hidden className="absolute -inset-y-1 w-px bg-foreground" style={{ left: `${(reference.value / max) * 100}%` }} /> : null}
            </span>
            <span className="w-14 text-right font-mono tabular-nums">{r.display}</span>
          </li>
        ))}
      </ul>
      {reference ? <p className="text-xs text-muted-foreground">Vertical line: {reference.label}</p> : null}
    </Figure>
  );
}

export type Pair = { label: string; from: number; to: number; fromDisplay: string; toDisplay: string };

/** Before and after on one 0 to max track per row, joined by a line. */
export function DumbbellChart({ title, caption, rows, max = 100, fromLabel, toLabel }: { title: string; caption?: ReactNode; rows: Pair[]; max?: number; fromLabel: string; toLabel: string }) {
  return (
    <Figure title={title} caption={caption}>
      <ul className="space-y-5">
        {rows.map((r) => {
          const a = (r.from / max) * 100;
          const b = (r.to / max) * 100;
          return (
            <li key={r.label} className="space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <span>{r.label}</span>
                <span className="font-mono tabular-nums text-secondary-foreground">
                  {r.fromDisplay} to {r.toDisplay}
                </span>
              </div>
              <span className="relative block h-4 bg-surface-raised">
                <span aria-hidden className="absolute top-1/2 h-px -translate-y-1/2 bg-foreground" style={{ left: `${Math.min(a, b)}%`, width: `${Math.abs(a - b)}%` }} />
                <span aria-hidden className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground bg-surface" style={{ left: `${a}%` }} />
                <span aria-hidden className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-positive" style={{ left: `${b}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Open dot: {fromLabel}. Filled dot: {toLabel}.
      </p>
    </Figure>
  );
}

/** One value against a required level, on a 0 to max track. */
export function Meter({ title, caption, value, display, required, requiredDisplay, max = 100, tone = "earth" }: { title: string; caption?: ReactNode; value: number; display: string; required: number; requiredDisplay: string; max?: number; tone?: Tone }) {
  return (
    <Figure title={title} caption={caption}>
      <div className="space-y-2">
        <span className="relative block h-5 bg-surface-raised">
          <span className={`absolute inset-y-0 left-0 ${FILL[tone]}`} style={{ width: `${(value / max) * 100}%` }} />
          <span aria-hidden className="absolute -inset-y-1.5 w-0.5 bg-foreground" style={{ left: `${(required / max) * 100}%` }} />
        </span>
        <p className="flex justify-between text-sm">
          <span>
            Reached <span className="font-mono tabular-nums">{display}</span>
          </span>
          <span className="text-secondary-foreground">
            Required <span className="font-mono tabular-nums">{requiredDisplay}</span>
          </span>
        </p>
      </div>
    </Figure>
  );
}

/** Vertical columns for a distribution (count per bin). */
export function Columns({ title, caption, bins, unit }: { title: string; caption?: ReactNode; bins: { label: string; value: number; display: string; tone?: Tone }[]; unit?: string }) {
  const top = Math.max(...bins.map((b) => b.value), 1);
  return (
    <Figure title={title} caption={caption}>
      <ul className="flex h-44 items-end gap-2" aria-label={unit}>
        {bins.map((b) => (
          <li key={b.label} className="flex h-full flex-1 flex-col justify-end gap-1 text-center text-xs">
            <span className="font-mono tabular-nums">{b.display}</span>
            <span className={`block w-full ${FILL[b.tone ?? "earth"]}`} style={{ height: `${(b.value / top) * 78}%`, minHeight: b.value > 0 ? 2 : 0 }} />
            <span className="text-muted-foreground">{b.label}</span>
          </li>
        ))}
      </ul>
    </Figure>
  );
}
