import fs from "node:fs";
import { bannedRegex } from "@/lib/banned";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import LicensePage from "./license/page";
import DataSourcesPage from "./data-sources/page";
import DisclaimersPage from "./disclaimers/page";
import ContactPage from "./contact/page";
import MissionPage from "./mission/page";
import ContributePage from "./contribute/page";
import PrivacyPage from "./privacy/page";
import NotFoundPage from "./not-found";
import { e32Sentence } from "@/lib/data";
import { sourcesUsed } from "@/lib/pages-data";

vi.mock("next/link", () => ({ default: ({ href, children, ...r }: { href: string; children: React.ReactNode }) => <a href={href} {...r}>{children}</a> }));

const BANNED = bannedRegex();
const DASHES = new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)}]`);
const PAGES: [string, ComponentType, string][] = [
  ["license", LicensePage, "Licence"],
  ["data-sources", DataSourcesPage, "Data sources"],
  ["disclaimers", DisclaimersPage, "Disclaimers"],
  ["contact", ContactPage, "Contact"],
  ["mission", MissionPage, "Mission"],
  ["contribute", ContributePage, "Contribute"],
  ["privacy", PrivacyPage, "Privacy"],
  ["not found", NotFoundPage, "Page not found"],
];

describe.each(PAGES)("%s page", (_name, Page, heading) => {
  it("renders its heading, no banned words, no em dash, no NaN or undefined", () => {
    const { container } = render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeTruthy();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(BANNED);
    expect(text).not.toMatch(DASHES);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector(".page-hero h1")).not.toBeNull();
    expect(text).not.toMatch(/\bNaN\b|\bundefined\b/);
  });
});

describe("license page", () => {
  it("renders the LICENSE file verbatim", () => {
    render(<LicensePage />);
    const raw = fs.readFileSync("LICENSE", "utf-8").replace(/\r\n/g, "\n");
    expect(screen.getByTestId("license-text").textContent).toBe(raw);
  });
});

describe("data sources page", () => {
  it("lists every row of data/sources_used.csv with a link, and the coverage caveat", () => {
    const { container } = render(<DataSourcesPage />);
    for (const s of sourcesUsed()) {
      const a = Array.from(container.querySelectorAll("a")).find((x) => x.textContent === s.name);
      expect(a, s.name).toBeTruthy();
      expect(a!.getAttribute("href")).toBe(s.url);
    }
    expect(container.textContent).toContain("73.4%");
    expect(container.textContent).toContain("0.7340 against a required 0.85");
    expect(container.textContent).toMatch(/G1 is\s*FAIL/);
  });
});

describe("disclaimers page", () => {
  it("carries the non-affiliation line, the E32 sentence and the gate statuses", () => {
    const { container } = render(<DisclaimersPage />);
    const t = container.textContent ?? "";
    expect(t).toContain("not affiliated with or endorsed by NASA or any government body");
    expect(t).toContain("built independently for the NASA Space Apps Challenge 2026");
    expect(t).toContain("The ranking has not been checked against independent data.");
    expect(t).toContain("Mars is a low-confidence secondary result");
    expect(t).toContain(e32Sentence());
    expect(t).toContain("D1 NOT TESTED");
    expect(t).toContain("G2(c) PASS");
  });
});

describe("contact page", () => {
  it("has the right email and links, and names without links for the others", () => {
    const { container } = render(<ContactPage />);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("mailto:dhawansanay@gmail.com");
    expect(hrefs).toContain("https://github.com/AnayDhawan");
    expect(hrefs).toContain("https://github.com/yakew7");
    expect(hrefs).toContain("https://github.com/AnayDhawan/GSOP");
    for (const name of ["Yash Kewlani", "Anay Dhawan", "Vihaan Bhagwat", "Shiven Sood", "Shaurya Jani", "Shaurya Gangrade"]) expect(container.textContent).toContain(name);
    for (const h of hrefs) expect(h).not.toMatch(/vihaan|shiven|shaurya/i);
    expect(container.textContent).not.toMatch(/simulator/i);
  });
});
