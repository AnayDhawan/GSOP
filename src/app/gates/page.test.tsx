import { bannedRegex } from "@/lib/banned";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Page from "./page";
import { e32Sentence, v2File } from "@/lib/data";

vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

function row(gate: string): HTMLElement {
  const th = screen.getByRole("rowheader", { name: gate });
  return th.closest("tr") as HTMLElement;
}
const status = (gate: string) => within(row(gate)).getAllByRole("cell")[0].textContent;
const detail = (gate: string) => within(row(gate)).getAllByRole("cell")[1].textContent ?? "";

describe("v2 gates page", () => {
  it("stores gate statuses as the literal strings PASS, FAIL or NOT TESTED", () => {
    const g = v2File().results!.gate_statuses;
    for (const v of Object.values(g)) expect(["PASS", "FAIL", "NOT TESTED"]).toContain(v);
    expect(v2File().run_completed).toBe(true);
  });

  it("prints every status literally", () => {
    render(<Page />);
    expect(status("G1")).toBe("FAIL");
    expect(status("G2")).toBe("FAIL");
    expect(status("G2(a)")).toBe("FAIL");
    expect(status("G2(b)")).toBe("FAIL");
    expect(status("G2(c)")).toBe("PASS");
    expect(status("G3")).toBe("FAIL");
    expect(status("D1")).toBe("NOT TESTED");
    expect(status("D2")).toBe("NOT TESTED");
    expect(status("Moon recall")).toBe("NOT TESTED");
  });

  it("shows the gate evidence from the data", () => {
    render(<Page />);
    expect(detail("G1")).toMatch(/Coverage 0\.7340 vs required 0\.85/);
    expect(detail("G2(a)")).toMatch(/Namib 58\.2, Rub' al Khali 38\.0, against a maximum of 25/);
    expect(detail("G2(b)")).toMatch(/0\/4 scorable analog sites at or above the 95th percentile: Haughton 86\.6, Atacama salars 52\.7, Ladakh \(Puga\) 8\.3, MDRS \(Utah\) 75\.0\. Lonar and McMurdo Dry Valleys gated out\./);
    expect(detail("G2(c)")).toMatch(/90\.19 \/ 75\.56 \/ 61\.29/);
    expect(detail("G3")).toMatch(/2 supported regions, both Shackleton rim\./);
  });

  it("lists the gates in the order the run reports them, with no failure moved down", () => {
    render(<Page />);
    const heads = screen.getAllByRole("rowheader").map((h) => h.textContent);
    const order = ["G1", "G2", "G2(a)", "G2(b)", "G2(c)", "G3", "D1", "D2", "Moon recall"];
    const idx = order.map((o) => heads.indexOf(o));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it("lists all six limitations in plain language", () => {
    const { container } = render(<Page />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/73\.4% of land tiles/);
    expect(text).toMatch(/central Australia, Indonesia, the Amazon and part of Siberia/);
    expect(text).toMatch(/not completed before the freeze/);
    expect(text).toMatch(/illumination/);
    expect(text).toMatch(/similarity was below 0\.0000001/);
    expect(text).toMatch(/best of the 34 to 38 gated tiles within 20 km/);
    expect(text).toMatch(/own-tile statistic/);
    expect(text).toMatch(/Only 4 Mars analog sites/);
    expect(text).toMatch(/0\.037 to 0\.112/);
    expect(text).toMatch(/200 tiles/);
    expect(text).toMatch(/cluster in a few deserts/);
    expect(text).toMatch(/Shackleton window/);
    expect(screen.getAllByRole("listitem").filter((li) => /^\d\. /.test(li.textContent ?? "")).length).toBe(6);
  });

  it("states the one positive result and what it does not show", () => {
    const { container } = render(<Page />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/Own-tile percentile fell from 41\.9 to 5\.1 at the Namib sand sea and from 11\.5 to 3\.4 at the Rub' al Khali/);
    expect(text).toMatch(/fell from 21\.4% \(terrain only\) to 1\.0% \(chance range 11\.4% to 34\.8%/);
    expect(text).toMatch(/It did not improve Mars analog retrieval/);
    expect(text).toMatch(/0\.75 was chosen in 204 of 205 cross-validation folds/);
    expect(text).toMatch(/not a passed test: D1 is NOT TESTED/);
  });

  it("draws the charts from claim strings", () => {
    const { container } = render(<Page />);
    const text = container.textContent ?? "";
    for (const t of ["G1: how much of Earth got a thermal value", "G2(a): Moon negative controls", "G2(b): Mars analog sites that could be scored", "G2(c): terrain-only baseline", "Held-out Moon false positives", "Own-tile percentile, before and after the thermal layer"]) expect(text).toContain(t);
    expect(text).toContain("73.4%");
    expect(text).toContain("85%");
    expect(text).toContain("21.4%");
    expect(container.querySelectorAll("figure").length).toBe(6);
    expect(container.querySelector("svg, img")).toBeNull();
  });

  it("prints the E32 sentence verbatim and says the ranking is unchecked", () => {
    const { container } = render(<Page />);
    expect(screen.getByText(e32Sentence())).toBeInTheDocument();
    expect(container.textContent).toMatch(/has not been checked against independent data/);
  });

  it("has no banned words, no dashes used as punctuation and sentence-case headings", () => {
    const { container } = render(<Page />);
    const text = (container.textContent ?? "").replace(e32Sentence(), "");
    expect(text).not.toMatch(bannedRegex());
    expect(text).not.toMatch(new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)}]`));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("v2 gate results");
    for (const h of screen.getAllByRole("heading", { level: 2 })) {
      for (const w of (h.textContent ?? "").split(" ").slice(1)) expect(w, `heading "${h.textContent}"`).not.toMatch(/^[A-Z][a-z]+$/);
    }
  });
});
