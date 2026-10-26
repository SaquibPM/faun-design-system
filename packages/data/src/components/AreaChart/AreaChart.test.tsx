import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { AreaChart } from "./AreaChart.js";

const categories = ["Q1", "Q2", "Q3"];
const series = [{ id: "a", label: "Grid", values: [10, 20, 30] }, { id: "b", label: "Solar", values: [5, 5, 10] }];
const areas = (c: Element) => [...c.querySelectorAll<SVGPathElement>("path.faun-chart-area")];

describe("AreaChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<AreaChart title="Supply by source" unit="MWh" categories={categories} series={series} />, "Supply by source");
  });

  it("fills under each line in categorical colours and draws a line on top", () => {
    const { container } = render(<AreaChart title="Supply" categories={categories} series={series} />);
    expect(areas(container).map((a) => a.style.fill)).toEqual(["var(--faun-dataviz-cat-1)", "var(--faun-dataviz-cat-2)"]);
    expect(container.querySelectorAll("path.faun-chart-line")).toHaveLength(2);
  });

  it("stacks series so the top edge is the total, with a total in the table and tooltip", () => {
    const { container } = render(<AreaChart variant="stacked" title="Supply" unit="MWh" categories={categories} series={series} />);
    expect(areas(container).every((a) => a.dataset.stacked !== undefined)).toBe(true);
    expect(screen.getByRole("columnheader", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("40 MWh");
    // The second band sits above the first: its top edge is higher on the page (smaller y) than the first band's.
    const tops = [...container.querySelectorAll<SVGPathElement>("path.faun-chart-line")].map((p) => Number(/M[\d.]+ ([\d.]+)/.exec(p.getAttribute("d")!)![1]));
    expect(tops[1]!).toBeLessThan(tops[0]!);
  });

  it("breaks the area at missing values instead of dropping to zero", () => {
    const { container } = render(<AreaChart title="Water" categories={["A", "B", "C", "D"]} series={[{ id: "w", label: "Water", values: [1, null, 3, 4] }]} legend />);
    expect(areas(container)).toHaveLength(2);
    expect(screen.getByRole("table")).toHaveTextContent("No data");
  });

  it("steps the line when asked", () => {
    const { container } = render(<AreaChart step title="Budget" categories={categories} series={[series[0]!]} />);
    expect(container.querySelector("path.faun-chart-line")!.getAttribute("d")).toMatch(/H[\d.]+V[\d.]+/);
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<AreaChart title="Supply" loading categories={categories} series={[]} />, <AreaChart title="Supply" categories={[]} series={[]} />, "Supply");
  });
});
