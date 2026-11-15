import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BarChart, Columns, DumbbellChart, Meter } from "./Charts";

describe("charts", () => {
  it("BarChart prints each label and value as text and scales the bar to the value", () => {
    const { container } = render(<BarChart title="Controls" rows={[{ label: "Namib", value: 58.2, display: "58.2", tone: "control" }]} reference={{ value: 25, label: "the maximum, 25" }} />);
    expect(screen.getByText("Controls")).toBeInTheDocument();
    expect(screen.getByText("Namib")).toBeInTheDocument();
    expect(screen.getByText("58.2")).toBeInTheDocument();
    expect(screen.getByText(/the maximum, 25/)).toBeInTheDocument();
    const bar = container.querySelector("span.bg-control") as HTMLElement;
    expect(parseFloat(bar.style.width)).toBeCloseTo(58.2, 5);
  });

  it("BarChart clamps values outside the scale", () => {
    const { container } = render(<BarChart title="T" max={10} rows={[{ label: "a", value: 50, display: "50" }]} />);
    expect((container.querySelector("span.bg-earth") as HTMLElement).style.width).toBe("100%");
  });

  it("DumbbellChart prints both ends of each pair", () => {
    render(<DumbbellChart title="Before and after" fromLabel="before" toLabel="after" rows={[{ label: "Namib", from: 41.9, to: 5.1, fromDisplay: "41.9", toDisplay: "5.1" }]} />);
    expect(screen.getByText("41.9 to 5.1")).toBeInTheDocument();
    expect(screen.getByText(/Open dot: before\. Filled dot: after\./)).toBeInTheDocument();
  });

  it("Meter shows the value against the required level", () => {
    render(<Meter title="Coverage" value={73.4} display="73.4%" required={85} requiredDisplay="85%" />);
    expect(screen.getByText("73.4%")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("Columns draws one column per bin with its count", () => {
    render(<Columns title="Spread" bins={[{ label: "0 to 25", value: 4, display: "4" }, { label: "25 to 50", value: 2, display: "2" }]} />);
    expect(screen.getByText("0 to 25")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("uses no icons or images", () => {
    const { container } = render(<Meter title="x" value={1} display="1" required={2} requiredDisplay="2" max={3} />);
    expect(container.querySelector("svg, img")).toBeNull();
  });
});
