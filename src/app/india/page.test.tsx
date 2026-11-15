import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Page from "./page";
import { indiaFile } from "@/lib/data";
import { bannedRegex } from "@/lib/banned";

vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className}>{children}</a> }));

describe("india page", () => {
  it("has one h1 and a card for every place in the data file", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("India highlights");
    const names = indiaFile().places.map((p) => p.name);
    const cards = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(cards.sort()).toEqual([...names].sort());
  });

  it("splits the places by whether they are in the reference list", () => {
    render(<Page />);
    const listed = screen.getByRole("heading", { name: "Already in our reference list" }).closest("section")!;
    const others = screen.getByRole("heading", { name: "Not in our reference list" }).closest("section")!;
    const want = indiaFile().places.filter((p) => p.in_reference_list).length;
    expect(within(listed).getAllByRole("heading", { level: 3 })).toHaveLength(want);
    expect(within(others).getAllByRole("heading", { level: 3 }).length).toBe(indiaFile().places.length - want);
  });

  it("opens every source link in a new tab and links listed places to their profile", () => {
    const { container } = render(<Page />);
    const external = [...container.querySelectorAll("a[href^='http']")];
    expect(external.length).toBeGreaterThan(10);
    for (const a of external) expect(a.getAttribute("rel")).toContain("noopener");
    expect(container.querySelector("a[href='/sites/lonar-crater']")).not.toBeNull();
  });

  it("says the places are not scored and tells the reader to check the source", () => {
    const { container } = render(<Page />);
    expect(container.textContent).toMatch(/Check each source before you rely on it/);
    expect(container.textContent).toMatch(/Not scored/);
    expect(container.textContent).toMatch(/no ground measurements/);
  });

  it("uses none of the banned words, no em dashes and no NaN", () => {
    const { container } = render(<Page />);
    expect(container.textContent).not.toMatch(bannedRegex());
    expect(container.textContent).not.toMatch(/[—]|NaN|undefined/);
  });
});
