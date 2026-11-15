import fs from "node:fs";
import path from "node:path";
import { bannedRegex } from "@/lib/banned";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home from "./page";
import { claim, e32Sentence } from "@/lib/data";

vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className}>{children}</a> }));
vi.mock("./components/HeroScene", () => ({ default: () => <svg data-testid="hero-scene" /> }));

describe("landing page", () => {
  const decisions = fs.readFileSync(path.join(process.cwd(), "docs/DECISIONS_SITE.md"), "utf-8");
  const locked = (label: string) => decisions.match(new RegExp(`^${label}: \\*\\*(.+?)\\*\\*`, "m"))![1];

  it("uses the headline in docs/DECISIONS_SITE.md and a data-scale subline from claims", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(locked("Headline"));
    expect(document.body.textContent).toContain(claim("landing.n_sites"));
    expect(document.body.textContent).toContain(claim("landing.n_sources"));
    expect(screen.getByTestId("hero-scene")).toBeInTheDocument();
  });

  it("has the five sections in order", () => {
    render(<Home />);
    const names = ["Data at a glance", "How it works", "Gate results, as reported", "Local ground data, starting with India", "Open the dashboard"];
    const els = names.map((n) => (n === "Data at a glance" ? screen.getByLabelText(n) : screen.getByRole("heading", { name: n })));
    for (let i = 1; i < els.length; i++) expect(els[i - 1].compareDocumentPosition(els[i]) & Node.DOCUMENT_POSITION_FOLLOWING, names[i]).toBeTruthy();
  });

  it("prints the gate results literally and the E32 sentence verbatim", () => {
    render(<Home />);
    const section = screen.getByRole("heading", { name: "Gate results, as reported" }).closest("section")!;
    const t = (gate: string) => within(section).getByText(gate, { exact: true }).parentElement!.textContent;
    expect(t("G1")).toMatch(/FAIL/);
    expect(t("G2")).toMatch(/FAIL/);
    expect(t("G2(c)")).toMatch(/PASS/);
    expect(t("G3")).toMatch(/FAIL/);
    for (const g of ["D1", "D2", "Moon recall"]) expect(t(g)).toMatch(/NOT TESTED/);
    expect(within(section).getByText(new RegExp(`${claim("v2.result.coverage_pct")}% vs ${claim("v2.result.g1.required_pct")}%`))).toBeInTheDocument();
    expect(within(section).getByText(e32Sentence())).toBeInTheDocument();
    expect(section.querySelector('a[href="/gates"]')).not.toBeNull();
  });

  it("links to the dashboard and the other results pages", () => {
    render(<Home />);
    for (const href of ["/dashboard", "/ledger", "/map", "/sites", "/gates", "/contribute"]) expect(document.querySelector(`a[href="${href}"]`), href).not.toBeNull();
  });

  it("uses none of the banned words and renders no NaN or undefined", () => {
    const { container } = render(<Home />);
    expect(container.textContent).not.toMatch(bannedRegex());
    expect(container.textContent).not.toMatch(/NaN|undefined/);
  });
});
