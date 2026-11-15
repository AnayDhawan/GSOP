import { v2File } from "@/lib/data";

const ROWS: { key: string; label: string }[] = [
  { key: "G1", label: "G1 coverage" },
  { key: "G2", label: "G2 scoring" },
  { key: "G2c", label: "G2(c) engine reproduction" },
  { key: "G3", label: "G3 supported regions" },
  { key: "D1", label: "D1 fitted model, Moon" },
  { key: "D2", label: "D2 fitted model, Mars" },
  { key: "moon_recall", label: "Moon recall" },
];

/** The gate statuses exactly as stored in v2.json: PASS, FAIL or NOT TESTED. */
export default function GateStatuses() {
  const g = (v2File().results?.gate_statuses ?? {}) as Record<string, string>;
  return (
    <ul className="space-y-1" data-testid="gate-statuses">
      {ROWS.map((r) => (
        <li key={r.key}>
          {r.label}: <strong className={g[r.key] === "FAIL" ? "text-control" : ""}>{g[r.key] ?? "not available"}</strong>
        </li>
      ))}
    </ul>
  );
}
