import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import Page from "./page";
import { profilesFile, sitesFile } from "@/lib/data";
import { bannedRegex } from "@/lib/banned";

vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className}>{children}</a> }));

const LICENSE = /^(CC0(?: \d\.\d)?|CC BY(?:-SA)?(?: \d\.\d)?(?: [A-Za-z]{2,3})?|PD(?:-[\w-]+)?|Public domain.*)$/i;
const file = profilesFile();
const slugs = Object.keys(file?.profiles ?? {});

describe("site profile data", () => {
  it("only names sites that exist, with no digits in prose, no dashes, no banned words and a free licence for every photo", () => {
    const known = new Set(sitesFile().sites.map((s) => s.slug));
    for (const [slug, p] of Object.entries(file?.profiles ?? {})) {
      expect(known.has(slug), slug).toBe(true);
      for (const k of ["place", "summary", "terrain_geology", "climate", "access_and_facilities", "hazards"] as const) {
        const v = p[k];
        if (v === null) continue;
        expect(v, `${slug}.${k}`).not.toMatch(/\d/);
        expect(v, `${slug}.${k}`).not.toMatch(/[\u2014\u2013]/);
        expect(v, `${slug}.${k}`).not.toMatch(bannedRegex());
      }
      if (p.image) {
        expect(p.image.license, slug).toMatch(LICENSE);
        expect(fs.existsSync(path.join(process.cwd(), "public/img/places", p.image.file)), `${slug} photo`).toBe(true);
        expect(p.image.credit.length, slug).toBeGreaterThan(5);
      }
    }
  });
});

describe("site detail page", () => {
  it.skipIf(slugs.length === 0)("shows the name in the hero, the photo with its credit, the facts and the charts, with no icons", async () => {
    const withPhoto = slugs.find((s) => file!.profiles[s].image) ?? slugs[0];
    const p = file!.profiles[withPhoto];
    const site = sitesFile().sites.find((s) => s.slug === withPhoto)!;
    const ui = await Page({ params: Promise.resolve({ slug: withPhoto }) });
    const { container } = render(ui);
    expect(container.querySelector("h1")?.textContent).toBe(site.name);
    expect(container.textContent).toContain("Researched from public sources, unreviewed");
    expect(container.textContent).toContain("Key facts");
    if (p.facts[0]) expect(container.textContent).toContain(p.facts[0].value);
    if (p.image) expect(container.textContent).toContain(p.image.credit);
    for (const img of container.querySelectorAll("img")) expect(img.hasAttribute("alt")).toBe(true);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.textContent).not.toMatch(/[\u2014\u2013]/);
    expect(container.textContent).not.toMatch(bannedRegex());
    expect(container.textContent).not.toMatch(/NaN|undefined/);
  });

  it("builds a page for a site with no profile, using the list text and a fallback in place of the photo", async () => {
    const bare = sitesFile().sites.find((s) => !file?.profiles[s.slug]);
    if (!bare) return;
    const { container } = render(await Page({ params: Promise.resolve({ slug: bare.slug }) }));
    expect(container.querySelector("h1")?.textContent).toBe(bare.name);
    expect(container.textContent).toContain("We have not found a freely licensed photo");
    expect(container.textContent).toContain("Teammate-written, unreviewed");
  });
});
