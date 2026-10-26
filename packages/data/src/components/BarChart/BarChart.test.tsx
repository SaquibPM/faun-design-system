import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { BarChart } from "./BarChart.js";

const categories = ["Pune", "Chennai", "Leeds"];
const bars = (c: Element) => [...c.querySelectorAll<SVGRectElement>("rect.faun-chart-bar")];
const h = (r: SVGRectElement) => Number(r.getAttribute("height"));

describe("BarChart", () => {
  it("draws one bar per value with heights in proportion, from a zero baseline", async () => {
    const { container } = render(<BarChart title="Scope 1 by site" unit="tCO₂e" categories={categories} series={[{ id: "s", label: "Scope 1", values: [8000, 4000, 2000] }]} />);
    const r = bars(container);
    expect(r).toHaveLength(3);
    expect(h(r[0]!) / h(r[1]!)).toBeCloseTo(2, 1);
    expect(h(r[1]!) / h(r[2]!)).toBeCloseTo(2, 1);
    const bottoms = new Set(r.map((x) => (Number(x.getAttribute("y")) + h(x)).toFixed(1)));
    expect(bottoms.size).toBe(1);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("takes categorical colours in order and clusters multiple series", () => {
    const { container } = render(<BarChart title="Scope 2" categories={["A", "B"]} series={[{ id: "x", label: "X", values: [3, 4] }, { id: "y", label: "Y", values: [2, 5] }]} />);
    const r = bars(container);
    expect(r).toHaveLength(4);
    expect(r[0]!.style.fill).toBe("var(--faun-dataviz-cat-1)");
    expect(r[1]!.style.fill).toBe("var(--faun-dataviz-cat-2)");
    expect(Number(r[1]!.getAttribute("x"))).toBeGreaterThan(Number(r[0]!.getAttribute("x")));
  });

  it("skips null values (a gap, not a zero-height bar) and draws negatives below the baseline", () => {
    const { container } = render(<BarChart title="Net" categories={["A", "B", "C"]} series={[{ id: "n", label: "Net", values: [10, null, -5] }]} />);
    const r = bars(container);
    expect(r).toHaveLength(2);
    const [pos, neg] = r;
    expect(Number(neg!.getAttribute("y"))).toBeCloseTo(Number(pos!.getAttribute("y")) + h(pos!), 0);
  });

  it("writes values above bars when asked, for a single series", () => {
    const { container } = render(<BarChart title="Values" showValues categories={categories} series={[{ id: "s", label: "S", values: [8000, 4000, 2000] }]} />);
    expect([...container.querySelectorAll(".faun-chart-value")].map((t) => t.textContent)).toEqual(["8,000", "4,000", "2,000"]);
  });

  it("labels the axis with the unit and thins crowded category labels", () => {
    const many = Array.from({ length: 40 }, (_, i) => `Site number ${i + 1}`);
    const { container } = render(<BarChart title="Many" unit="tCO₂e" categories={many} series={[{ id: "s", label: "S", values: many.map((_, i) => i + 1) }]} />);
    expect(container.querySelector("svg")).toHaveTextContent("tCO₂e");
    const labels = [...container.querySelectorAll("text.faun-chart-axis-cat")];
    expect(labels.length).toBeLessThan(40);
    expect(labels.length).toBeGreaterThan(0);
  });
});
