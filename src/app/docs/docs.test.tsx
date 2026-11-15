import { bannedRegex } from "@/lib/banned";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import DocsIndex from "./page";
import Researchers from "./researchers/page";
import Organizations from "./organizations/page";
import DataAccess from "./data-access/page";
import { publicDataFiles } from "@/lib/pages-data";

vi.mock("next/link", () => ({ default: ({ href, children, ...r }: { href: string; children: React.ReactNode }) => <a href={href} {...r}>{children}</a> }));

const BANNED = bannedRegex();
const DASHES = new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)}]`);
const PAGES: [string, ComponentType, string][] = [
  ["docs index", DocsIndex, "Docs"],
  ["researchers", Researchers, "For independent researchers"],
  ["organizations", Organizations, "For research organizations"],
  ["data access", DataAccess, "Data file access"],
];

function proseWords(container: HTMLElement): number {
  const clone = container.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("table, pre").forEach((n) => n.remove());
  return (clone.textContent ?? "").split(/\s+/).filter(Boolean).length;
}

describe.each(PAGES)("%s", (_n, Page, heading) => {
  it("renders its heading with clean text", () => {
    const { container } = render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeTruthy();
    const t = container.textContent ?? "";
    expect(t).not.toMatch(BANNED);
    expect(t).not.toMatch(DASHES);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector(".page-hero h1")).not.toBeNull();
    expect(t).not.toMatch(/\bNaN\b|\bundefined\b|REST API/);
  });
});

describe("word counts", () => {
  it.each([
    ["researchers", Researchers],
    ["organizations", Organizations],
    ["data access", DataAccess],
  ] as [string, ComponentType][])("%s has 300 to 600 words of prose", (_n, Page) => {
    const { container } = render(<Page />);
    const n = proseWords(container);
    expect(n).toBeGreaterThanOrEqual(300);
    expect(n).toBeLessThanOrEqual(600);
  });
});

describe("researchers", () => {
  it("states the literal gate statuses and the missing track C files", () => {
    const { container } = render(<Researchers />);
    const t = container.textContent ?? "";
    expect(t).toContain("G1 coverage: FAIL");
    expect(t).toContain("G2(c) engine reproduction: PASS");
    expect(t).toContain("D1 fitted model, Moon: NOT TESTED");
    expect(t).toContain("Moon recall: NOT TESTED");
    expect(t).toContain("41.9");
    expect(t).toContain("5.1");
    expect(t).toMatch(/claims_c\.csv and site_measurements\.csv\) are not part of this build/);
  });
});

describe("organizations", () => {
  it("gives the collaboration email", () => {
    const { container } = render(<Organizations />);
    expect(Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toContain("mailto:dhawansanay@gmail.com");
  });
});

describe("data access", () => {
  it("lists every file under public/data with an example URL, including claims.csv and overlays", () => {
    const { container } = render(<DataAccess />);
    const t = container.textContent ?? "";
    const files = publicDataFiles();
    expect(files.length).toBeGreaterThan(10);
    for (const f of files) expect(t).toContain(`https://gsoplatform.vercel.app/data/${f.path}`);
    expect(files.some((f) => f.path === "claims.csv")).toBe(true);
    expect(files.some((f) => f.path.startsWith("overlays/"))).toBe(true);
    expect(t).toContain("rebuilt at deploy time");
    expect(t).toContain("No authentication");
  });
});
