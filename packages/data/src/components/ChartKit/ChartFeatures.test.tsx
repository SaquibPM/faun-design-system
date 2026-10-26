import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { BarChart } from "../BarChart/BarChart.js";
import { LineChart } from "../LineChart/LineChart.js";
import { StackedBarChart } from "../StackedBarChart/StackedBarChart.js";
import type { ChartSeries } from "./types.js";

const categories = ["Pune", "Chennai", "Leeds"];
const series: ChartSeries[] = [
  { id: "a", label: "Location-based", values: [100, 120, 40] },
  { id: "b", label: "Market-based", values: [80, 90, 70] },
  { id: "c", label: "Offsets", values: [10, 20, 30] },
];
const bars = (c: Element) => [...c.querySelectorAll<SVGRectElement>("rect.faun-chart-bar")];

describe("horizontal BarChart", () => {
  it("draws bars left to right from a zero baseline with categories down the side", async () => {
    const { container } = render(<BarChart title="Scope 1 by site" orientation="horizontal" unit="tCO₂e" categories={categories} series={[{ id: "s", label: "Scope 1", values: [8000, 4000, 2000] }]} />);
    const r = bars(container);
    expect(r).toHaveLength(3);
    const w = (e: SVGRectElement) => Number(e.getAttribute("width"));
    expect(w(r[0]!) / w(r[1]!)).toBeCloseTo(2, 1);
    expect(new Set(r.map((e) => Number(e.getAttribute("x")).toFixed(1))).size).toBe(1);
    expect(Number(r[1]!.getAttribute("y"))).toBeGreaterThan(Number(r[0]!.getAttribute("y")));
    const labels = [...container.querySelectorAll("text.faun-chart-tick")].map((t) => t.textContent);
    expect(labels).toEqual(expect.arrayContaining(["Pune", "Chennai", "Leeds"]));
    expect(await axeViolations(container)).toEqual([]);
  });

  it("reads categories with Up and Down and follows the pointer vertically", async () => {
    render(<BarChart title="Scope 1 by site" orientation="horizontal" categories={categories} series={series} />);
    const plot = screen.getByRole("group", { name: /up and down arrow keys/ });
    await userEvent.tab();
    expect(plot).toHaveFocus();
    const tip = () => document.querySelector(".faun-chart-tooltip")!;
    expect(tip()).toHaveTextContent("Pune");
    expect(tip()).toHaveAttribute("data-orient", "horizontal");
    await userEvent.keyboard("{ArrowDown}");
    expect(tip()).toHaveTextContent("Chennai");
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(tip()).toHaveTextContent("Pune");
    await userEvent.keyboard("{End}");
    expect(tip()).toHaveTextContent("Leeds");
  });

  it("writes values at the bar ends and grows with the number of categories", () => {
    const many = Array.from({ length: 20 }, (_, i) => `Site ${i + 1}`);
    const { container } = render(<BarChart title="Many" orientation="horizontal" showValues categories={many} series={[{ id: "s", label: "S", values: many.map((_, i) => i + 1) }]} />);
    expect(container.querySelectorAll(".faun-chart-value")).toHaveLength(20);
    expect(Number(container.querySelector(".faun-chart-plot")!.getAttribute("style")?.match(/(\d+)px/)?.[1])).toBeGreaterThan(280);
  });
});

describe("reference and target lines", () => {
  const refs = [{ label: "2030 target", value: 90, kind: "target" as const }, { label: "Sector average", value: 60 }];
  it.each([
    ["BarChart", (p: any) => <BarChart {...p} />],
    ["BarChart horizontal", (p: any) => <BarChart orientation="horizontal" {...p} />],
    ["LineChart", (p: any) => <LineChart {...p} />],
    ["StackedBarChart", (p: any) => <StackedBarChart {...p} />],
  ])("%s draws the lines and lists them in the data table", async (_n, make) => {
    const { container } = render(make({ title: "Emissions", unit: "tCO₂e", categories, series, references: refs }));
    const lines = container.querySelectorAll("line.faun-chart-ref");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveAttribute("data-kind", "target");
    expect(lines[1]).toHaveAttribute("data-kind", "reference");
    expect(container.querySelector(".faun-chart-svg")).toHaveTextContent("2030 target: 90");
    const table = screen.getByRole("table");
    expect(within(table).getByRole("rowheader", { name: "Target: 2030 target" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "Reference: Sector average" })).toBeInTheDocument();
    expect(table).toHaveTextContent("90 tCO₂e");
    expect(table).toHaveTextContent("60 tCO₂e");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("extends the value axis to include a line above the data", () => {
    const { container } = render(<BarChart title="T" categories={["A"]} series={[{ id: "s", label: "S", values: [10] }]} references={[{ label: "Limit", value: 500 }]} />);
    const ticks = [...container.querySelectorAll("text.faun-chart-tick")].map((t) => t.textContent);
    expect(ticks).toContain("600");
  });
});

describe("legend toggling", () => {
  const legendButtons = () => within(screen.getByRole("list", { name: "Legend" })).getAllByRole("button");

  it("is off by default: legend entries are not buttons", () => {
    render(<BarChart title="T" categories={categories} series={series} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("hides and shows series with aria-pressed, and updates the drawing, tooltip and data table", async () => {
    const { container } = render(<BarChart title="T" toggleSeries categories={categories} series={series} />);
    const [a, b, c] = legendButtons();
    expect([a, b, c].map((x) => x!.getAttribute("aria-pressed"))).toEqual(["true", "true", "true"]);
    expect(bars(container)).toHaveLength(9);
    await userEvent.click(b!);
    expect(b).toHaveAttribute("aria-pressed", "false");
    expect(bars(container)).toHaveLength(6);
    expect(within(screen.getByRole("table")).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Category", "Location-based", "Offsets"]);
    expect(screen.getByRole("status")).toHaveTextContent("Market-based hidden");
    await userEvent.click(b!);
    expect(b).toHaveAttribute("aria-pressed", "true");
    expect(bars(container)).toHaveLength(9);
    expect(screen.getByRole("status")).toHaveTextContent("Market-based shown");
  });

  it("works from the keyboard with Space and Enter", async () => {
    render(<BarChart title="T" toggleSeries categories={categories} series={series} />);
    await userEvent.tab();
    expect(legendButtons()[0]).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(legendButtons()[0]).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard("{Enter}");
    expect(legendButtons()[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("always keeps one series visible", async () => {
    const onChange = vi.fn();
    const { container } = render(<LineChart title="T" toggleSeries onHiddenSeriesChange={onChange} categories={categories} series={series.slice(0, 2)} />);
    const [a, b] = legendButtons();
    await userEvent.click(a!);
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    expect(b).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(b!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(b).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll("path.faun-chart-line")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("stays visible");
  });

  it("starts from defaultHiddenSeries and never hides everything", () => {
    const { container, rerender } = render(<BarChart title="T" toggleSeries defaultHiddenSeries={["a"]} categories={categories} series={series} />);
    expect(legendButtons()[0]).toHaveAttribute("aria-pressed", "false");
    expect(bars(container)).toHaveLength(6);
    rerender(<BarChart title="T" toggleSeries hiddenSeries={["a", "b", "c"]} categories={categories} series={series} />);
    expect(legendButtons().map((x) => x.getAttribute("aria-pressed"))).toEqual(["true", "false", "false"]);
  });

  it("can be controlled", async () => {
    function Controlled() {
      const [hidden, setHidden] = useState<string[]>(["c"]);
      return <><output data-testid="h">{hidden.join(",")}</output><StackedBarChart title="T" toggleSeries hiddenSeries={hidden} onHiddenSeriesChange={setHidden} categories={categories} series={series} /></>;
    }
    const { container } = render(<Controlled />);
    expect(bars(container)).toHaveLength(6);
    await userEvent.click(legendButtons()[0]!);
    expect(screen.getByTestId("h")).toHaveTextContent("c,a");
    expect(bars(container)).toHaveLength(3);
    await userEvent.click(legendButtons()[2]!);
    expect(screen.getByTestId("h")).toHaveTextContent("a");
  });

  it("rescales stacked totals to the visible series and has no axe violations", async () => {
    const { container } = render(<StackedBarChart title="T" toggleSeries defaultHiddenSeries={["a"]} categories={categories} series={series} />);
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("90");
    expect(await axeViolations(container)).toEqual([]);
  });
});
