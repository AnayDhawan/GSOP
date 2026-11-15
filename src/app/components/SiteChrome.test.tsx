import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import { CONTACT_EMAIL, NAV } from "@/lib/nav";
import { sourcesUsed } from "@/lib/sources";

vi.mock("next/link", () => ({ default: ({ href, children, className, ...r }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className} {...r}>{children}</a> }));
vi.mock("next/navigation", () => ({ usePathname: () => "/method" }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "dark", setTheme: () => {} }) }));

describe("header", () => {
  it("has the five links and a logo with no wordmark text beside it", () => {
    const { container } = render(<SiteHeader />);
    expect(NAV.map((n) => n.label)).toEqual(["Dashboard", "Methodology", "Mission", "Contribute", "Contact"]);
    for (const n of NAV) expect(container.querySelector(`nav[aria-label="Main"] a[href="${n.href}"]`)).not.toBeNull();
    expect(container.querySelector('a[aria-label="GSOP home"]')?.textContent).toBe("");
    expect(container.querySelector('nav[aria-label="Main"] a[aria-current="page"]')?.textContent).toBe("Methodology");
  });
});

describe("footer", () => {
  it("has four columns, the NASA non-affiliation line, credits, licence line and the strip", () => {
    const { container } = render(<SiteFooter />);
    for (const k of ["Quick links", "Legal", "Connect"]) expect(screen.getByRole("navigation", { name: k })).toBeInTheDocument();
    expect(container.textContent).toContain("It is not affiliated with or endorsed by NASA or any government body.");
    expect(container.textContent).toMatch(/MOD11A2/);
    expect(container.textContent).toMatch(/Diviner/);
    expect(container.textContent).toMatch(/OpenStreetMap contributors/);
    expect(container.textContent).toMatch(/Basemap: Esri/);
    expect(container.textContent).toMatch(/Code released under the MIT License/);
    expect(container.querySelector(`a[href="mailto:${CONTACT_EMAIL}"]`)).not.toBeNull();
    const strip = screen.getByTestId("bodies-strip");
    expect(strip.textContent).toBe("");
    expect([...strip.querySelectorAll("img")].map((i) => i.alt)).toEqual(["Moon", "Earth", "Mars"]);
    // The strip is after the footer element, not inside it.
    expect(container.querySelector("footer")!.contains(strip)).toBe(false);
  });

  it("credits only sources that are in data/sources_used.csv", () => {
    const names = sourcesUsed().map((s) => s.name + s.provider).join(" ");
    for (const term of ["MOD11A2", "Diviner", "TES", "LOLA", "MOLA", "SRTM", "Copernicus", "Natural Earth", "OpenStreetMap", "Esri"]) expect(names).toContain(term);
  });
});
