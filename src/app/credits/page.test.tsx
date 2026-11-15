import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";
import { bannedRegex } from "@/lib/banned";

vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

describe("data credits page", () => {
  it("has a hero title, one section per body and an image with alt text for each", () => {
    const { container } = render(<Page />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Data credits");
    for (const b of ["Earth", "Moon", "Mars"]) expect(screen.getByRole("heading", { level: 2, name: b })).toBeInTheDocument();
    const imgs = [...container.querySelectorAll("img")];
    expect(imgs).toHaveLength(3);
    for (const i of imgs) expect(i.getAttribute("alt")).toBeTruthy();
  });

  it("links to the data sources table and has no banned words, dashes or icons", () => {
    const { container } = render(<Page />);
    expect(container.querySelector('a[href="/data-sources"]')).not.toBeNull();
    expect(container.textContent).not.toMatch(bannedRegex());
    expect(container.textContent).not.toMatch(new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)}]`));
    expect(container.querySelector("svg")).toBeNull();
  });
});
