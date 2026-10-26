import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { BoxplotChart, boxStats } from "./BoxplotChart.js";

const groups = [{ label: "Europe", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 30] }, { label: "Asia", values: [2, 3, 4, 5, 6, 7, 8] }];

describe("boxStats", () => {
  it("computes quartiles, Tukey whiskers and outliers", () => {
    const s = boxStats(groups[0]!)!;
    expect(s.median).toBe(5.5);
    expect(s.q1).toBeCloseTo(3.25, 5);
    expect(s.q3).toBeCloseTo(7.75, 5);
    expect(s.max).toBe(9);
    expect(s.outliers).toEqual([30]);
    expect(s.min).toBe(1);
  });
  it("accepts a precomputed summary and rejects an incomplete one", () => {
    expect(boxStats({ label: "x", min: 1, q1: 2, median: 3, q3: 4, max: 5 })).toMatchObject({ median: 3, outliers: [] });
    expect(boxStats({ label: "x", min: 1, median: 3 })).toBeNull();
  });
});

describe("BoxplotChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<BoxplotChart title="Intensity by region" unit="kg" groups={groups} />, "Intensity by region");
  });

  it("draws a box, a median line, whiskers and outlier dots per group", () => {
    const { container } = render(<BoxplotChart title="Intensity" groups={groups} />);
    expect(container.querySelectorAll("rect.faun-chart-box")).toHaveLength(2);
    expect(container.querySelectorAll("line.faun-chart-median")).toHaveLength(2);
    expect(container.querySelectorAll("circle.faun-chart-outlier")).toHaveLength(1);
    const box = container.querySelector<SVGRectElement>("rect.faun-chart-box")!;
    const med = container.querySelector<SVGLineElement>("line.faun-chart-median")!;
    const y = Number(med.getAttribute("y1"));
    expect(y).toBeGreaterThan(Number(box.getAttribute("y")));
    expect(y).toBeLessThan(Number(box.getAttribute("y")) + Number(box.getAttribute("height")));
  });

  it("turns horizontal with groups down the side", () => {
    const { container } = render(<BoxplotChart orientation="horizontal" title="Intensity" groups={groups} />);
    const med = container.querySelector<SVGLineElement>("line.faun-chart-median")!;
    expect(med.getAttribute("y1")).not.toBe(med.getAttribute("y2"));
    expect(med.getAttribute("x1")).toBe(med.getAttribute("x2"));
  });

  it("lists the five-number summary, outliers and target lines in the data table", () => {
    render(<BoxplotChart title="Intensity" groups={groups} references={[{ label: "Limit", value: 6, kind: "target" }]} />);
    const t = screen.getByRole("table");
    expect(t).toHaveTextContent("Median");
    expect(t).toHaveTextContent("30");
    expect(t).toHaveTextContent("Target: Limit");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<BoxplotChart title="Intensity" loading groups={[]} />, <BoxplotChart title="Intensity" groups={[]} />, "Intensity");
  });
});
