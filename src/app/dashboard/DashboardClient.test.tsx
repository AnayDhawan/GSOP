import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import DashboardClient from "./DashboardClient";
import type { DashboardData, DashSite } from "@/lib/dashboard";

// The Leaflet map is loaded with next/dynamic and needs a real browser. Stand it in with a stub that lists what it was given.
vi.mock("next/dynamic", () => ({
  default: () => (props: { sites: DashSite[]; bodyKey: string }) => <div data-testid="map" data-body={props.bodyKey} data-count={props.sites.length} />,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "dark" }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

const mk = (over: Partial<DashSite>): DashSite => ({
  id: "x", slug: "x", name: "X", body: "Moon", list: "known", country: "", lat: 1, lon: 2,
  scoreText: null, scoreValue: null, viewLabel: null, tagKind: "gated", tag: "gated: vegetated", tagTitle: "", ...over,
});
const data: DashboardData = {
  sites: [
    mk({ id: "a-moon", slug: "askja", name: "Askja caldera", country: "Iceland", scoreText: "30.2", scoreValue: 30.2, viewLabel: "Shackleton rim, Base", tagKind: "own-tile", tag: "own-tile 65.4" }),
    mk({ id: "b-moon", slug: "etna", name: "Etna", country: "Italy", scoreText: "20.0", scoreValue: 20, viewLabel: "Shackleton rim, Base", tagKind: "best-of-radius", tag: "v1 best-of-radius 81.0" }),
    mk({ id: "c-moon", slug: "lonar", name: "Lonar crater", country: "India" }),
    mk({ id: "d-mars", slug: "dallol", name: "Dallol", body: "Mars", country: "Ethiopia", scoreText: "40.1", scoreValue: 40.1, viewLabel: "Jezero, Base", tagKind: "best-of-radius", tag: "v1 best-of-radius 50.0" }),
  ],
  viewsByBody: { Moon: ["Shackleton rim, Base"], Mars: ["Jezero, Base"] },
  refreshed: "15 Nov 2026",
  window: "MODIS land surface temperature 2019 to 2023, v1 6 km tiles",
  e32: "E32 sentence.",
};

describe("DashboardClient", () => {
  it("shows exactly two body pills and the Moon list first", () => {
    render(<DashboardClient data={data} />);
    const group = screen.getByRole("group", { name: "Reference body" });
    expect(within(group).getAllByRole("button").map((b) => b.textContent)).toEqual(["Moon", "Mars"]);
    expect(screen.getByText("3 sites, ranked by similarity")).toBeInTheDocument();
    expect(screen.getByTestId("map")).toHaveAttribute("data-body", "Moon");
    expect(screen.getByTestId("map")).toHaveAttribute("data-count", "3");
  });

  it("ranks scored rows, shows the honest tag and links each row to its profile", () => {
    render(<DashboardClient data={data} />);
    const link = screen.getByRole("link", { name: /Askja caldera/ });
    expect(link).toHaveAttribute("href", "/sites/askja");
    expect(within(link).getByText("own-tile 65.4")).toBeInTheDocument();
    expect(within(link).getByText("30.2")).toBeInTheDocument();
    expect(within(link).getByLabelText("Rank 1")).toBeInTheDocument();
    const gated = screen.getByRole("link", { name: /Lonar crater/ });
    expect(within(gated).getByText("gated: vegetated")).toBeInTheDocument();
    expect(within(gated).getByLabelText("Not ranked")).toBeInTheDocument();
  });

  it("swaps the site set when Mars is chosen", () => {
    render(<DashboardClient data={data} />);
    fireEvent.click(screen.getByRole("button", { name: "Mars" }));
    expect(screen.getByText("1 sites, ranked by similarity")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dallol/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Askja caldera/ })).not.toBeInTheDocument();
    expect(screen.getByText(/low-confidence secondary result/)).toBeInTheDocument();
  });

  it("filters rows as the search text changes and says so when nothing matches", () => {
    render(<DashboardClient data={data} />);
    const box = screen.getByPlaceholderText("Find a site or region...");
    fireEvent.change(box, { target: { value: "india" } });
    expect(screen.getByRole("link", { name: /Lonar crater/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Etna/ })).not.toBeInTheDocument();
    fireEvent.change(box, { target: { value: "zzz" } });
    expect(screen.getByText("No site matches that search.")).toBeInTheDocument();
  });

  it("has the legend, the E32 sentence and the refreshed line", () => {
    render(<DashboardClient data={data} />);
    expect(screen.getByText("Similarity Score (0-100)")).toBeInTheDocument();
    expect(screen.getByText("Less similar")).toBeInTheDocument();
    expect(screen.getByText("Most similar")).toBeInTheDocument();
    expect(screen.getByText("E32 sentence.")).toBeInTheDocument();
    expect(screen.getByText(/Data refreshed 15 Nov 2026 - computed from MODIS land surface temperature 2019 to 2023, v1 6 km tiles/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/NaN|undefined/);
  });

  it("stars a site and keeps its real rank", () => {
    render(<DashboardClient data={data} />);
    fireEvent.click(screen.getByRole("button", { name: "Star Etna" }));
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByRole("link", { name: /Etna/ })).toBeInTheDocument();
    expect(within(items[0]).getByLabelText("Rank 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Unstar Etna" }));
    localStorage.clear();
  });
});
