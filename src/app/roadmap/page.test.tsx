import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Page from "./page";
import { bannedRegex } from "@/lib/banned";

vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className}>{children}</a> }));

describe("roadmap page", () => {
  it("has one h1 and the plan in order: stand, fixes, plan, results, rules", () => {
    render(<Page />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("After the hackathon");
    const names = ["Where we stand", "What the new build fixes", "The plan", "Where the results lead", "Ground rules for the next build"];
    const els = names.map((n) => screen.getByRole("heading", { name: n }));
    for (let i = 1; i < els.length; i++) expect(els[i - 1].compareDocumentPosition(els[i]) & Node.DOCUMENT_POSITION_FOLLOWING, names[i]).toBeTruthy();
  });

  it("has the three phases, with the month of simulation in the middle", () => {
    render(<Page />);
    const plan = screen.getByRole("heading", { name: "The plan" }).closest("section")!;
    const phases = within(plan).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(phases).toEqual(["Build it properly", "One month of simulation", "Check it against the ground"]);
  });

  it("prints the gate statuses literally and says the dates are targets", () => {
    const { container } = render(<Page />);
    const list = screen.getByLabelText("Gate results");
    expect(list.textContent).toMatch(/G1.*FAIL/);
    expect(list.textContent).toMatch(/G2\(c\).*PASS/);
    expect(list.textContent).toMatch(/D1.*NOT TESTED/);
    expect(container.textContent).toMatch(/targets, not promises/);
    expect(container.textContent).toMatch(/Three gates failed, one passed and three could not be tested/);
  });

  it("uses none of the banned words, no em dashes and no NaN", () => {
    const { container } = render(<Page />);
    expect(container.textContent).not.toMatch(bannedRegex());
    expect(container.textContent).not.toMatch(/[—]|NaN|undefined/);
  });
});
