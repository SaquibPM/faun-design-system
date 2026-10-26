import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { binValues, HistogramChart } from "./HistogramChart.js";

const values = [1, 1.5, 2, 2.2, 2.4, 2.6, 3, 3.1, 3.2, 3.3, 5.8, 9];

describe("binValues", () => {
  it("counts every value exactly once, including the maximum", () => {
    const bins = binValues(values, 4);
    expect(bins).toHaveLength(4);
    expect(bins.reduce((n, b) => n + b.count, 0)).toBe(values.length);
    expect(bins[3]!.count).toBeGreaterThan(0);
  });
  it("uses a fixed width starting at a multiple of it", () => {
    const bins = binValues(values, undefined, 2);
    expect(bins[0]!.start).toBe(0);
    expect(bins.map((b) => b.end - b.start)).toEqual(bins.map(() => 2));
    expect(bins.reduce((n, b) => n + b.count, 0)).toBe(values.length);
  });
  it("copes with no data and with one repeated value", () => {
    expect(binValues([])).toEqual([]);
    expect(binValues([2, 2, 2], 4).reduce((n, b) => n + b.count, 0)).toBe(3);
  });
});

describe("HistogramChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<HistogramChart title="Supplier intensity" values={values} binWidth={1} unit="kg" countLabel="Suppliers" />, "Supplier intensity");
  });

  it("draws bars whose heights are in proportion to counts, side by side without gaps", () => {
    const { container } = render(<HistogramChart title="Dist" values={values} binWidth={1} />);
    const bars = [...container.querySelectorAll<SVGRectElement>("rect.faun-chart-bar")];
    const counts = binValues(values, undefined, 1).filter((b) => b.count > 0).map((b) => b.count);
    expect(bars).toHaveLength(counts.length);
    const h = bars.map((b) => Number(b.getAttribute("height")));
    expect(h[counts.indexOf(Math.max(...counts))]).toBe(Math.max(...h));
    expect(h[0]! / h[h.length - 1]!).toBeCloseTo(counts[0]! / counts[counts.length - 1]!, 3);
  });

  it("draws vertical reference lines and lists them in the table", () => {
    const { container } = render(<HistogramChart title="Dist" values={values} binWidth={1} unit="kg" references={[{ label: "Limit", value: 5, kind: "target" }]} />);
    const line = container.querySelector("line.faun-chart-ref")!;
    expect(line.getAttribute("x1")).toBe(line.getAttribute("x2"));
    expect(screen.getByRole("table")).toHaveTextContent("Target: Limit");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<HistogramChart title="Dist" loading values={[]} />, <HistogramChart title="Dist" values={[]} />, "Dist");
  });
});
