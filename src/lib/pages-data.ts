// Build-time readers for the legal and docs pages. Server components only (they read the disk).
// Nothing here computes a score. Sizes and file names come from the files themselves.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function abs(rel: string): string {
  return path.join(/* turbopackIgnore: true */ ROOT, rel);
}

export function readRepoText(rel: string): string {
  return fs.readFileSync(abs(rel), "utf-8");
}

export function repoFileExists(rel: string): boolean {
  return fs.existsSync(abs(rel));
}

/** The licence text exactly as committed, line endings normalised for display only. */
export function licenseText(): string {
  return readRepoText("LICENSE").replace(/\r\n/g, "\n");
}

export type PublicDataFile = { path: string; bytes: number; label: string | null };

/** Every file under public/data, sorted by path, with the meta.label of each JSON file. */
export function publicDataFiles(): PublicDataFile[] {
  const base = abs("public/data");
  const out: PublicDataFile[] = [];
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      const rel = path.relative(base, full).split(path.sep).join("/");
      let label: string | null = null;
      if (rel.endsWith(".json")) {
        try {
          const doc = JSON.parse(fs.readFileSync(full, "utf-8")) as { meta?: { label?: string } };
          label = doc.meta?.label ?? null;
        } catch {
          label = null;
        }
      }
      out.push({ path: rel, bytes: fs.statSync(full).size, label });
    }
  };
  walk(base);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

/** Column names of a CSV file in the repo (first line). */
export function csvColumns(rel: string): string[] {
  return readRepoText(rel).split("\n", 1)[0].replace(/\r$/, "").split(",");
}

type V2Entry = { id: string; label?: string; display?: string };

/** One entry of the v2 track A metrics file, by id. Null when the file or the entry is absent. */
export function v2MetricEntry(id: string): V2Entry | null {
  const rel = "data/v2/runs/v2/metrics.json";
  if (!repoFileExists(rel)) return null;
  const doc = JSON.parse(readRepoText(rel)) as { entries: V2Entry[] };
  return doc.entries.find((e) => e.id === id) ?? null;
}

/** The limits listed in the track A metrics header (text, as stored). */
export function v2MetricLimits(): string[] {
  const rel = "data/v2/runs/v2/metrics.json";
  if (!repoFileExists(rel)) return [];
  const doc = JSON.parse(readRepoText(rel)) as { meta: { limits?: string[] } };
  return doc.meta.limits ?? [];
}

export type SourceRow = { id: string; body: string; name: string; provider: string; url: string; contributes: string; resolution_or_window: string; used_in: string };

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cell);
      cell = "";
    } else cell += c;
  }
  out.push(cell);
  return out;
}

/** data/sources_used.csv: the one list of sources actually used. The footer credits read the same file. */
export function sourcesUsed(): SourceRow[] {
  const lines = readRepoText("data/sources_used.csv").replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "");
  const head = parseCsvLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cells = parseCsvLine(l);
    return Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""])) as SourceRow;
  });
}

export const GITHUB_BLOB = "https://github.com/AnayDhawan/GSOP/blob/main";
export const SITE_ORIGIN = "https://gsoplatform.vercel.app";
