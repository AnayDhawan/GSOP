import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import DashboardClient from "./DashboardClient";
import type { DashboardData, DashSite } from "@/lib/dashboard";

// The Leaflet map is loaded with next/dynamic and needs a real browser. Stand it in with a stub that lists what it was
// given and exposes one button per marker, so the site card can be opened the way a map click would open it.
vi.mock("next/dynamic", () => ({
  default: () => (props: { sites: DashSite[]; bodyKey: string; extent: string; radiusKm: number; onSelect: (s: DashSite) => void }) => (
    <div data-testid="map" data-body={props.bodyKey} data-count={props.sites.length} data-extent={props.extent} data-radius={props.radiusKm}>
      {props.sites.map((s) => (
        <button key={s.id} type="button" onClick={() => props.onSelect(s)}>
          marker {s.name}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

const mk = (over: Partial<DashSite>): DashSite => ({
  id: "x", slug: "x", name: "X", body: "Moon", list: "known", country: "", photo: null, lat: 1, lon: 2,
  scoreText: null, scoreValue: null, viewLabel: null, tagKind: "gated", tag: "No score: vegetated", tagTitle: "", ...over,
});
const data: DashboardData = {
  sites: [
    mk({ id: "a-moon", slug: "askja", name: "Askja caldera", country: "Iceland", photo: "/img/sites/askja.jpg", scoreText: "30.2", scoreValue: 30.2, viewLabel: "Shackleton rim, Base", tagKind: "own-tile", tag: "Own-tile percentile 65.4", elevationText: "1,100 m", whyAnalog: "Basaltic caldera.", experiments: "Rover traverses." }),
    mk({ id: "b-moon", slug: "etna", name: "Etna", country: "Italy", scoreText: "20.0", scoreValue: 20, viewLabel: "Shackleton rim, Base", tagKind: "best-of-radius", tag: "Best nearby tile, percentile 81.0" }),
    mk({ id: "c-moon", slug: "lonar", name: "Lonar crater", country: "India" }),
    mk({ id: "d-mars", slug: "dallol", name: "Dallol", body: "Mars", country: "Ethiopia", scoreText: "40.1", scoreValue: 40.1, viewLabel: "Jezero, Base", tagKind: "best-of-radius", tag: "Best nearby tile, percentile 50.0" }),
  ],
  viewsByBody: { Moon: ["Shackleton rim, Base"], Mars: ["Jezero, Base"] },
  refreshed: "15 Nov 2026",
  window: "MODIS land surface temperature 2019 to 2023, v1 6 km tiles",
  e32: "E32 sentence.",
  matchRadiusKm: 20,
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
    expect(within(link).getByText("Own-tile percentile 65.4")).toBeInTheDocument();
    expect(within(link).getByText("30.2")).toBeInTheDocument();
    expect(within(link).getByLabelText("Rank 1")).toBeInTheDocument();
    const gated = screen.getByRole("link", { name: /Lonar crater/ });
    expect(within(gated).getByText("No score: vegetated")).toBeInTheDocument();
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

  it("shows a thumbnail only for sites that have a photo", () => {
    const { container } = render(<DashboardClient data={data} />);
    const imgs = [...container.querySelectorAll("li img")];
    expect(imgs.map((i) => i.getAttribute("src"))).toEqual(["/img/sites/askja.jpg"]);
  });

  it("has no icons, no star buttons and no em or en dashes", () => {
    const { container } = render(<DashboardClient data={data} />);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.queryByRole("button", { name: /star/i })).toBeNull();
    expect(container.textContent).not.toMatch(/[\u2013\u2014]/);
    expect(screen.getByRole("button", { name: "My location" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fullscreen" }));
    expect(screen.getByRole("button", { name: "Exit fullscreen" })).toBeInTheDocument();
  });

  it("has a World and an India extent toggle that the map receives", () => {
    render(<DashboardClient data={data} />);
    const group = screen.getByRole("group", { name: "Map extent" });
    expect(within(group).getAllByRole("button").map((b) => b.textContent)).toEqual(["World", "India"]);
    expect(screen.getByTestId("map")).toHaveAttribute("data-extent", "World");
    fireEvent.click(within(group).getByRole("button", { name: "India" }));
    expect(screen.getByTestId("map")).toHaveAttribute("data-extent", "India");
    expect(screen.getByTestId("map")).toHaveAttribute("data-radius", "20");
  });

  it("hands the India highlights to the map and names them in a legend only on the India extent", () => {
    const place = { id: "p", name: "Sambhar Lake", state: "Rajasthan", lat: 26.9, lon: 75.1, kind: "point" as const, bodies: ["Mars"], in_reference_list: false, tagline: "Inland salt lake", why: "A saline lake.", source_urls: ["https://example.org/a"] };
    render(<DashboardClient data={{ ...data, india: [place] }} />);
    expect(screen.queryByText(/India highlight: public sources, not scored/)).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("group", { name: "Map extent" })).getByRole("button", { name: "India" }));
    expect(screen.getByText(/India highlight: public sources, not scored/)).toBeInTheDocument();
  });

  it("opens a site card from a map marker with the stored facts, the honest tag and a profile link", () => {
    const { container } = render(<DashboardClient data={data} />);
    expect(screen.queryByTestId("site-card")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "marker Askja caldera" }));
    const card = screen.getByTestId("site-card");
    expect(within(card).getByRole("heading", { name: "Askja caldera" })).toBeInTheDocument();
    expect(within(card).getByText("Score 30.2")).toBeInTheDocument();
    expect(within(card).getByText("Own-tile percentile 65.4")).toBeInTheDocument();
    expect(within(card).getByText("1,100 m")).toBeInTheDocument();
    expect(within(card).getByText("Basaltic caldera.")).toBeInTheDocument();
    expect(within(card).getByText(/20 km v1 match radius/)).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /Open the full profile/ })).toHaveAttribute("href", "/sites/askja");
    expect(container.querySelector("svg")).toBeNull();
    fireEvent.click(within(card).getByRole("button", { name: "Close site card" }));
    expect(screen.queryByTestId("site-card")).not.toBeInTheDocument();
  });

  it("shows No score on the card for a gated site and closes it when the body changes", () => {
    render(<DashboardClient data={data} />);
    fireEvent.click(screen.getByRole("button", { name: "marker Lonar crater" }));
    expect(within(screen.getByTestId("site-card")).getByText("No score")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mars" }));
    expect(screen.queryByTestId("site-card")).not.toBeInTheDocument();
  });
});
