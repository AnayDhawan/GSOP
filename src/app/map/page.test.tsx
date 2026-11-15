import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";
import { bannedRegex } from "@/lib/banned";

vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));

describe("honest map page", () => {
  it("has a hero title, the failure notice first and charts of the failed tests", () => {
    const { container } = render(<Page />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Honest Map");
    expect(container.textContent).toMatch(/Two negative controls scored high/);
    expect(container.textContent).toMatch(/has not been checked against independent data/);
    expect(container.textContent).toMatch(/candidates not in our reference list/);
    expect(screen.getByText("Moon negative controls, v1")).toBeInTheDocument();
    expect(container.querySelectorAll("figure").length).toBeGreaterThanOrEqual(2);
  });

  it("has no banned words or dashes used as punctuation", () => {
    const { container } = render(<Page />);
    expect(container.textContent).not.toMatch(bannedRegex());
    expect(container.textContent).not.toMatch(new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)}]`));
  });
});
