// Build-time loader for data/sources_used.csv, the single list of sources the site credits.
import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./data";

export type SourceRow = {
  id: string;
  body: string;
  name: string;
  provider: string;
  url: string;
  contributes: string;
  resolution_or_window: string;
  used_in: string;
};

export function sourcesUsed(): SourceRow[] {
  const text = fs.readFileSync(path.join(/* turbopackIgnore: true */ process.cwd(), "data/sources_used.csv"), "utf-8");
  const [head, ...rows] = parseCsv(text).filter((r) => r.length > 1);
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])) as SourceRow);
}

/** First line of LICENSE, for the footer ("MIT License"). */
export function licenseName(): string {
  const text = fs.readFileSync(path.join(/* turbopackIgnore: true */ process.cwd(), "LICENSE"), "utf-8");
  return text.split("\n", 1)[0].trim();
}
