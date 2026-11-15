import { bannedRegex } from "@/lib/banned";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home from "./page";
import { claim, e32Sentence } from "@/lib/data";

vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className}>{children}</a> }));
vi.mock("./components/HeroScene", () => ({ default: () => <svg data-testid="hero-scene" /> }));

describe("landing page", () => {

  it("opens with GSOP, the full name and a short description over the scene, and no competition line", () => {
    render(<Home />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toBe("GSOP");
    const hero = h1.closest("section")!;
    expect(hero.textContent).toContain("Geospatial Similarity Observation Platform");
    expect(hero.textContent).not.toMatch(/Space Apps|NASA/);
    // The scene is the hero's background, behind the text.
    expect(within(hero).getByTestId("hero-scene").closest(".-z-10")).not.toBeNull();
    const description = [...hero.querySelectorAll("p")].find((p) => /open screening tool/i.test(p.textContent ?? ""));
    expect(description).toBeTruthy();
    expect(hero.querySelector('a[href="/dashboard"]')).not.toBeNull();
    expect(hero.querySelector("svg:not([data-testid])")).toBeNull();
  });

  it("has no icon svgs and the numbers section reads from claims", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll("svg").length).toBe(1); // only the mocked hero scene
    expect(document.body.textContent).toContain(claim("landing.n_sites"));
    expect(document.body.textContent).toContain(claim("landing.n_sources"));
  });

  it("has the sections in order", () => {
    render(<Home />);
    const names = ["Data at a glance", "Four things to know before you read a score", "Gate results, as reported", "The same results, drawn", "Local ground data, starting with India", "Built in the open"];
    const els = names.map((n) => (n === "Data at a glance" ? screen.getByLabelText(n) : screen.getByRole("heading", { name: n })));
    for (let i = 1; i < els.length; i++) expect(els[i - 1].compareDocumentPosition(els[i]) & Node.DOCUMENT_POSITION_FOLLOWING, names[i]).toBeTruthy();
  });

  it("prints the gate results literally, a tally, and the E32 sentence verbatim", () => {
    render(<Home />);
    const section = screen.getByRole("heading", { name: "Gate results, as reported" }).closest("section")!;
    const t = (gate: string) => within(section).getByText(gate, { exact: true }).parentElement!.textContent;
    expect(t("G1")).toMatch(/FAIL/);
    expect(t("G2")).toMatch(/FAIL/);
    expect(t("G2(c)")).toMatch(/PASS/);
    expect(t("G3")).toMatch(/FAIL/);
    for (const g of ["D1", "D2", "Moon recall"]) expect(t(g)).toMatch(/NOT TESTED/);
    expect(within(section).getByLabelText("Gate tally").textContent).toMatch(/3\s*fail\s*1\s*pass\s*3\s*not tested/i);
    expect(within(section).getByText(new RegExp(`${claim("v2.result.coverage_pct")}% vs ${claim("v2.result.g1.required_pct")}%`))).toBeInTheDocument();
    expect(within(section).getByText(e32Sentence())).toBeInTheDocument();
    expect(section.querySelector('a[href="/gates"]')).not.toBeNull();
  });

  it("links to the dashboard and the other results pages", () => {
    render(<Home />);
    for (const href of ["/dashboard", "/ledger", "/gates", "/contribute", "/mission", "/method", "/data-sources", "/docs/data-access", "/roadmap"]) expect(document.querySelector(`a[href="${href}"]`), href).not.toBeNull();
  });

  it("uses none of the banned words and renders no NaN or undefined", () => {
    const { container } = render(<Home />);
    expect(container.textContent).not.toMatch(bannedRegex());
    expect(container.textContent).not.toMatch(/NaN|undefined/);
  });
});
