import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import { CONTACT_EMAIL, DOCS, NAV } from "@/lib/nav";
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

  it("has no theme toggle and no icons, and a Docs menu with the three guides", () => {
    const { container } = render(<SiteHeader />);
    expect(container.querySelector('[aria-label="Colour theme"]')).toBeNull();
    expect(container.querySelector("header svg")).toBeNull();
    const docsBtn = screen.getAllByRole("button", { name: "Docs" })[0];
    expect(docsBtn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(docsBtn);
    expect(docsBtn.getAttribute("aria-expanded")).toBe("true");
    for (const d of DOCS) expect(container.querySelector(`#docs-menu a[href="${d.href}"]`), d.href).not.toBeNull();
  });

  it("opens the phone menu from a hamburger with no visible text, and lists every page and guide", () => {
    const { container } = render(<SiteHeader />);
    const burger = screen.getByRole("button", { name: "Open menu" });
    expect(burger.textContent).toBe("");
    expect(burger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector("#mobile-menu")?.hasAttribute("hidden")).toBe(true);
    fireEvent.click(burger);
    const close = screen.getByRole("button", { name: "Close menu" });
    expect(close.getAttribute("aria-expanded")).toBe("true");
    const menu = container.querySelector("#mobile-menu")!;
    expect(menu.hasAttribute("hidden")).toBe(false);
    for (const n of NAV) expect(menu.querySelector(`a[href="${n.href}"]`), n.href).not.toBeNull();
    for (const d of DOCS) expect(menu.querySelector(`a[href="${d.href}"]`), d.href).not.toBeNull();
    expect(menu.querySelector('a[aria-current="page"]')?.textContent).toBe("Methodology");
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
    expect(container.querySelector("footer")!.getAttribute("data-theme")).toBe("dark");
    expect(container.querySelector('footer [aria-label="Colour theme"]')).not.toBeNull();
    expect(container.querySelector('footer a[aria-label="GSOP home"]')!.textContent).toBe("GSOP");
    expect(container.querySelector("footer svg")).toBeNull();
    expect(container.querySelector(`a[href="mailto:${CONTACT_EMAIL}"]`)).not.toBeNull();
    const strip = screen.getByTestId("bodies-strip");
    expect(strip.textContent).toBe("");
    expect([...strip.querySelectorAll("img")].map((i) => i.alt)).toEqual(["Moon", "Earth", "Mars"]);
    // The strip is after the footer element, not inside it.
    expect(container.querySelector("footer")!.contains(strip)).toBe(false);
  });

  it("credits only sources that are in data/sources_used.csv", () => {
    const names = sourcesUsed().map((s) => s.name + s.provider).join(" ");
    for (const term of ["MOD11A2", "Diviner", "TES", "LOLA", "MOLA", "SRTM", "Copernicus", "Natural Earth", "OpenStreetMap", "Esri", "Blue Marble"]) expect(names).toContain(term);
  });
});
