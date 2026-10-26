import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract } from "../../../test/contract.js";
import { BarChart } from "./BarChart.js";
import { LineChart } from "../LineChart/LineChart.js";

const categories = ["Pune", "Leeds", "Austin"];
const bars = (c: Element) => [...c.querySelectorAll<SVGRectElement>("rect.faun-chart-bar")];
const n = (el: Element, a: string) => Number(el.getAttribute(a));

describe("BarChart variants", () => {
  it("grouped puts one bar per series side by side, in series order", () => {
    const { container } = render(<BarChart variant="grouped" title="G" categories={categories} series={[{ id: "a", label: "A", values: [3, 2, 1] }, { id: "b", label: "B", values: [4, 3, 2] }]} />);
    const r = bars(container);
    expect(r).toHaveLength(6);
    expect(n(r[1]!, "x")).toBeGreaterThan(n(r[0]!, "x"));
    expect(r[0]!.style.fill).toBe("var(--faun-dataviz-cat-1)");
  });

  it("stacked piles series from the baseline, positives up and negatives down, with a total", async () => {
    const { container } = render(<BarChart variant="stacked" title="S" categories={["A"]} series={[{ id: "a", label: "A", values: [10] }, { id: "b", label: "B", values: [5] }, { id: "c", label: "C", values: [-4] }]} />);
    const [a, b, c] = bars(container);
    expect(n(b!, "y") + n(b!, "height")).toBeCloseTo(n(a!, "y"), 3);
    expect(n(c!, "y")).toBeCloseTo(n(a!, "y") + n(a!, "height"), 3);
    expect(screen.getByRole("columnheader", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("11");
    await expectChartContract(<BarChart variant="stacked" orientation="horizontal" title="Stack" categories={categories} series={[{ id: "a", label: "A", values: [3, 2, 1] }, { id: "b", label: "B", values: [4, 3, 2] }]} />, "Stack", { keys: ["{ArrowDown}"] });
  });

  it("stacked horizontal grows to the right from a shared left edge", () => {
    const { container } = render(<BarChart variant="stacked" orientation="horizontal" title="S" categories={["A"]} series={[{ id: "a", label: "A", values: [10] }, { id: "b", label: "B", values: [10] }]} />);
    const [a, b] = bars(container);
    expect(n(b!, "x")).toBeCloseTo(n(a!, "x") + n(a!, "width"), 3);
    expect(n(a!, "width")).toBeCloseTo(n(b!, "width"), 3);
  });

  it("floating spans from base to value and says so in text", () => {
    const { container } = render(<BarChart variant="floating" title="F" unit="t" categories={["A", "B"]} series={[{ id: "r", label: "Range", base: [10, 40], values: [30, 60] }]} />);
    const [a, b] = bars(container);
    expect(n(a!, "height")).toBeCloseTo(n(b!, "height"), 3);
    expect(n(b!, "y")).toBeLessThan(n(a!, "y"));
    expect(screen.getByRole("table")).toHaveTextContent("10 to 30 t");
  });

  it("diverging colours by sign with the diverging ramp, shades by size, and keys the two sides", () => {
    const { container } = render(<BarChart variant="diverging" positiveIs="worse" divergingLabels={{ negative: "Under", positive: "Over" }} title="D" categories={categories} series={[{ id: "v", label: "Variance", values: [100, -20, -100] }]} />);
    const fills = bars(container).map((r) => r.style.fill);
    expect(fills[0]).toBe("var(--faun-dataviz-div-neg-3)");
    expect(fills[2]).toBe("var(--faun-dataviz-div-pos-3)");
    expect(fills[1]).toBe("var(--faun-dataviz-div-pos-1)");
    expect(screen.getByRole("list", { name: "Colour key" })).toHaveTextContent("UnderOver");
    expect(screen.queryByRole("list", { name: "Legend" })).toBeNull();
  });

  it("lollipop draws a stem and a dot at the value instead of a bar", () => {
    const { container } = render(<BarChart variant="lollipop" title="L" categories={categories} series={[{ id: "v", label: "V", values: [3, 2, 1] }]} />);
    expect(bars(container)).toHaveLength(0);
    expect(container.querySelectorAll("line.faun-chart-stem")).toHaveLength(3);
    const dots = [...container.querySelectorAll("circle.faun-chart-dot")];
    expect(dots).toHaveLength(3);
    expect(n(dots[0]!, "cy")).toBeLessThan(n(dots[2]!, "cy"));
  });

  it("every variant keeps the accessibility contract vertically", async () => {
    for (const variant of ["simple", "stacked", "floating", "diverging", "lollipop"] as const) {
      const series = variant === "floating" ? [{ id: "r", label: "R", base: [1, 2, 3], values: [4, 5, 6] }] : [{ id: "a", label: "A", values: [3, -2, 1] }];
      const { unmount } = render(<BarChart variant={variant} title={`Bars ${variant}`} categories={categories} series={series} />);
      unmount();
      await expectChartContract(<BarChart variant={variant} title={`Bars ${variant}`} categories={categories} series={series} />, `Bars ${variant}`);
      document.body.innerHTML = "";
    }
  });
});

describe("LineChart step variant", () => {
  it("holds each value until the next point, then steps", () => {
    const { container } = render(<LineChart variant="step" title="Step" categories={["A", "B", "C"]} series={[{ id: "s", label: "S", values: [1, 3, 2] }]} />);
    expect(container.querySelector("path.faun-chart-line")!.getAttribute("d")).toMatch(/^M[\d.]+ [\d.]+H[\d.]+V[\d.]+H[\d.]+V[\d.]+$/);
  });
  it("still breaks the step line at a gap", () => {
    const { container } = render(<LineChart variant="step" title="Step" categories={["A", "B", "C", "D"]} series={[{ id: "s", label: "S", values: [1, null, 2, 3] }]} />);
    expect(container.querySelector("path.faun-chart-line")!.getAttribute("d")!.match(/M/g)).toHaveLength(2);
  });
});
