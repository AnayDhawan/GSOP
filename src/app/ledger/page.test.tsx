import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";
import { bannedRegex } from "@/lib/banned";
import { claim, e32Sentence } from "@/lib/data";

vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

describe("failure-first ledger page", () => {
  it("opens with a hero title and prints the E32 sentence verbatim", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Failure-First Ledger");
    expect(screen.getByText(e32Sentence())).toBeInTheDocument();
  });

  it("puts what failed before where the analogy breaks down", () => {
    render(<Page />);
    const failed = screen.getByRole("heading", { name: "What failed" });
    const breaks = screen.getByRole("heading", { name: "Where the analogy breaks down" });
    expect(failed.compareDocumentPosition(breaks) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("charts the failed controls with the numbers from claims", () => {
    const { container } = render(<Page />);
    const text = container.textContent ?? "";
    expect(text).toContain(claim("metrics.moon.control.namib_sand_sea.rank_pct"));
    expect(text).toContain("Top group with and without the illumination term");
    expect(container.querySelectorAll("figure").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("has no banned words, dashes used as punctuation or title-case headings", () => {
    const { container } = render(<Page />);
    const text = (container.textContent ?? "").replace(e32Sentence(), "");
    expect(text).not.toMatch(bannedRegex());
    expect(text).not.toMatch(new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)}]`));
    for (const h of screen.getAllByRole("heading", { level: 2 })) {
      for (const w of (h.textContent ?? "").split(" ").slice(1)) {
        if (["Moon", "Mars", "Earth"].includes(w)) continue;
        expect(w, `heading "${h.textContent}"`).not.toMatch(/^[A-Z][a-z]+$/);
      }
    }
  });
});
