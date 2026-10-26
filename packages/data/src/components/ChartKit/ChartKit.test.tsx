import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { BarChart } from "../BarChart/BarChart.js";
import { chartColorVar, labelStride, niceTicks, resolveColors } from "./scale.js";
import type { ChartSeries } from "./types.js";

const categories = ["2024", "2025", "2026"];
const series: ChartSeries[] = [
  { id: "a", label: "Location-based", values: [100, 120, null] },
  { id: "b", label: "Market-based", values: [80, 90, 70] },
];

describe("chart scale helpers", () => {
  it("makes round ticks that cover the data", () => {
    const t = niceTicks(0, 18240);
    expect(t.min).toBe(0);
    expect(t.max).toBeGreaterThanOrEqual(18240);
    expect(t.ticks[0]).toBe(0);
    expect(new Set(t.ticks.map((v, i) => (i ? v - t.ticks[i - 1]! : 0)).slice(1)).size).toBe(1);
  });
  it("handles negative and flat ranges", () => {
    const n = niceTicks(-40, 100);
    expect(n.min).toBeLessThanOrEqual(-40);
    expect(n.ticks).toContain(0);
    expect(niceTicks(5, 5).max).toBeGreaterThan(5);
  });
  it("assigns categorical slots in order and scope slots by id, never cycling", () => {
    const s = (id: string, color?: ChartSeries["color"]): ChartSeries => ({ id, label: id, values: [], color });
    expect(resolveColors([s("x"), s("scope-2"), s("y"), s("z", "cat-7")])).toEqual(["cat-1", "scope-2", "cat-2", "cat-7"]);
    expect(chartColorVar("scope-1")).toBe("var(--faun-dataviz-scope-1)");
  });
  it("thins labels that would collide", () => {
    expect(labelStride(12, 600, 40)).toBe(1);
    expect(labelStride(12, 120, 40)).toBe(4);
  });
});

describe("chart frame (shared by every chart)", () => {
  it("names the figure, shows title, description, legend and has no axe violations", async () => {
    const { container } = render(<BarChart title="Scope 2 by year" description="Two methods." unit="tCO₂e" categories={categories} series={series} />);
    expect(screen.getByRole("figure", { name: "Scope 2 by year" })).toBeInTheDocument();
    expect(screen.getByText("Two methods.")).toBeInTheDocument();
    const legend = screen.getByRole("list", { name: "Legend" });
    expect(within(legend).getAllByRole("listitem").map((l) => l.textContent)).toEqual(["Location-based", "Market-based"]);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("hides the legend for one series unless asked, and the visible title when hideTitle is set", () => {
    const { rerender } = render(<BarChart title="One" categories={categories} series={[series[1]!]} />);
    expect(screen.queryByRole("list", { name: "Legend" })).not.toBeInTheDocument();
    rerender(<BarChart title="One" legend categories={categories} series={[series[1]!]} />);
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
    rerender(<BarChart title="One" hideTitle description="Hidden" categories={categories} series={[series[1]!]} />);
    expect(screen.getByRole("figure", { name: "One" })).toBeInTheDocument();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("provides a visually hidden data table with units, formatted values and 'No data' for gaps", () => {
    render(<BarChart title="Scope 2 by year" unit="tCO₂e" categories={categories} series={series} />);
    const table = screen.getByRole("table", { name: "Scope 2 by year (tCO₂e)" });
    expect(table).toHaveClass("faun-visually-hidden");
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Category", "Location-based", "Market-based"]);
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(4);
    expect(within(rows[1]!).getAllByRole("cell").map((c) => c.textContent)).toEqual(["100 tCO₂e", "80 tCO₂e"]);
    expect(within(rows[3]!).getAllByRole("cell").map((c) => c.textContent)).toEqual(["No data", "70 tCO₂e"]);
  });

  it("is one tab stop; arrow keys read category by category, show the tooltip and announce", async () => {
    render(<BarChart title="Scope 2 by year" unit="tCO₂e" categories={categories} series={series} />);
    const plot = screen.getByRole("group", { name: /Scope 2 by year\. 3 categories/ });
    expect(plot).toHaveAttribute("aria-roledescription", "chart");
    expect(document.querySelector(".faun-chart-tooltip")).toBeNull();
    await userEvent.tab();
    expect(plot).toHaveFocus();
    const tip = () => document.querySelector(".faun-chart-tooltip")!;
    expect(tip()).toHaveTextContent("2024");
    expect(tip()).toHaveTextContent("Location-based");
    expect(tip()).toHaveTextContent("100 tCO₂e");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(tip()).toHaveTextContent("2026");
    expect(tip()).toHaveTextContent("No data");
    expect(screen.getByRole("status")).toHaveTextContent("2026: Location-based No data, Market-based 70 tCO₂e");
    await userEvent.keyboard("{ArrowRight}");
    expect(tip()).toHaveTextContent("2026");
    await userEvent.keyboard("{Home}");
    expect(tip()).toHaveTextContent("2024");
    await userEvent.keyboard("{End}");
    expect(tip()).toHaveTextContent("2026");
    await userEvent.keyboard("{Escape}");
    expect(document.querySelector(".faun-chart-tooltip")).toBeNull();
    await userEvent.tab();
    expect(plot).not.toHaveFocus();
  });

  it("shows the tooltip for the category under the pointer and hides it on leave", () => {
    render(<BarChart title="Scope 2 by year" unit="tCO₂e" categories={categories} series={series} />);
    const plot = screen.getByRole("group", { name: /Scope 2 by year/ });
    fireEvent.pointerMove(plot, { clientX: 600 });
    expect(document.querySelector(".faun-chart-tooltip")).toHaveTextContent("2026");
    expect(document.querySelector(".faun-chart-tooltip")).toHaveAttribute("data-side", "left");
    fireEvent.pointerMove(plot, { clientX: 100 });
    expect(document.querySelector(".faun-chart-tooltip")).toHaveTextContent("2024");
    expect(document.querySelector(".faun-chart-tooltip")).toHaveAttribute("data-side", "right");
    fireEvent.pointerLeave(plot);
    expect(document.querySelector(".faun-chart-tooltip")).toBeNull();
  });

  it("uses a custom number format everywhere", () => {
    render(<BarChart title="Share" unit="%" format={(v) => `${v.toFixed(1)}`} categories={["A"]} series={[{ id: "s", label: "Share", values: [62] }]} />);
    expect(screen.getByRole("table")).toHaveTextContent("62.0 %");
  });

  it("shows loading and empty states instead of a plot", async () => {
    const { container, rerender } = render(<BarChart title="Loading chart" loading categories={categories} series={series} />);
    expect(screen.getByRole("status", { name: "Loading Loading chart" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /Loading chart/ })).not.toBeInTheDocument();
    rerender(<BarChart title="Empty chart" categories={[]} series={[]} />);
    expect(screen.getByRole("heading", { name: "No data to chart" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("draws at most eight series and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const many: ChartSeries[] = Array.from({ length: 10 }, (_, i) => ({ id: `s${i}`, label: `Series ${i + 1}`, values: [i + 1] }));
    render(<BarChart title="Too many" categories={["A"]} series={many} />);
    expect(within(screen.getByRole("list", { name: "Legend" })).getAllByRole("listitem")).toHaveLength(8);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
