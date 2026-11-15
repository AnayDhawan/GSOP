import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Explorer from "./Explorer";
import type { ExplorerRow } from "@/lib/explorer";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

const V = "shackleton_rim__base";
const J = "jezero__base";
const rows: ExplorerRow[] = [
  {
    id: "askja-moon",
    slug: "askja",
    name: "Askja caldera",
    body: "Moon",
    list: "known",
    country: "Iceland",
    v1_used: true,
    cells: { [V]: { status: "scored", score: "20.0", percentile: "92.0", flagged: false } },
    pct: { [V]: 92 },
    photo: { src: "/img/places/askja.jpg", credit: "Photo: Test Author, CC BY 2.0, via Wikimedia Commons" },
    place: "Askja caldera, Iceland",
  },
  { id: "lonar-moon", slug: "lonar", name: "Lonar crater", body: "Moon", list: "known", country: "India", v1_used: null, cells: { [V]: { status: "gated_out", reason: "vegetated" } }, pct: {} },
  { id: "dallol-mars", slug: "dallol", name: "Dallol", body: "Mars", list: "candidate", country: "Ethiopia", v1_used: false, cells: { [J]: { status: "scored", score: "30.0", percentile: "50.0", flagged: true } }, pct: { [J]: 50 } },
];
const views = { Moon: [V], Mars: [J] };

describe("Explorer gallery", () => {
  it("lists Moon sites first, links each to its page and shows the photo credit", () => {
    render(<Explorer rows={rows} views={views} />);
    expect(screen.getByRole("link", { name: "Askja caldera" })).toHaveAttribute("href", "/sites/askja");
    expect(screen.getByText(/Photo: Test Author/)).toBeInTheDocument();
    expect(screen.queryByText("Dallol")).not.toBeInTheDocument();
  });

  it("gives a site without a photo a fallback and says so, with no broken image", () => {
    render(<Explorer rows={rows} views={views} />);
    const card = screen.getByRole("link", { name: "Lonar crater" }).closest("li")!;
    expect(within(card).getByText("No photo for this place yet.")).toBeInTheDocument();
    for (const img of card.querySelectorAll("img")) expect(img.getAttribute("src")).toMatch(/^\/img\/bodies\//);
  });

  it("every image has an alt attribute", () => {
    const { container } = render(<Explorer rows={rows} views={views} />);
    for (const img of container.querySelectorAll("img")) expect(img.hasAttribute("alt")).toBe(true);
  });

  it("switches body and shows the stored numbers", () => {
    render(<Explorer rows={rows} views={views} />);
    fireEvent.click(screen.getByLabelText("Mars"));
    const card = screen.getByRole("link", { name: "Dallol" }).closest("li")!;
    expect(within(card).getByText("50.0")).toBeInTheDocument();
    expect(within(card).getByText(/in a flagged tile/)).toBeInTheDocument();
    expect(within(card).getByText(/Candidate, not in our reference list/)).toBeInTheDocument();
  });

  it("shows why a site has no score and filters it", () => {
    render(<Explorer rows={rows} views={views} />);
    expect(screen.getByText(/vegetated/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("More filters"));
    fireEvent.change(screen.getByLabelText("Result"), { target: { value: "scored" } });
    expect(screen.queryByText("Lonar crater")).not.toBeInTheDocument();
  });

  it("filters by country", () => {
    render(<Explorer rows={rows} views={views} />);
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "India" } });
    expect(screen.getByRole("link", { name: "Lonar crater" })).toBeInTheDocument();
    expect(screen.queryByText("Askja caldera")).not.toBeInTheDocument();
  });

  it("says so when nothing matches", () => {
    render(<Explorer rows={rows} views={views} />);
    fireEvent.change(screen.getByLabelText("Search name or country"), { target: { value: "zzz" } });
    expect(screen.getByText("No sites match these filters.")).toBeInTheDocument();
  });
});
