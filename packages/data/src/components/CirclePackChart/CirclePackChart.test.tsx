import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { CirclePackChart } from "./CirclePackChart.js";

const data = {
  label: "Suppliers",
  children: [
    { label: "Materials", children: [{ label: "Steel Co", value: 40 }, { label: "Chem Co", value: 10 }] },
    { label: "Logistics", children: [{ label: "Freight Co", value: 20 }] },
  ],
};
const circles = (c: Element) => [...c.querySelectorAll<SVGCircleElement>("circle.faun-chart-pack")];
const r = (c: SVGCircleElement) => Number(c.getAttribute("r"));

describe("CirclePackChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<CirclePackChart title="Supplier emissions" unit="t" data={data} />, "Supplier emissions");
  });

  it("draws a circle per leaf with area in proportion to value, inside a circle per group", () => {
    const { container } = render(<CirclePackChart title="P" data={data} />);
    const all = circles(container);
    expect(all).toHaveLength(5);
    const leaves = all.filter((c) => c.dataset.branch === undefined);
    expect(leaves).toHaveLength(3);
    const byValue = leaves.sort((a, b) => r(b) - r(a));
    expect((r(byValue[0]!) / r(byValue[2]!)) ** 2).toBeCloseTo(4, 1);
    expect(leaves.map((l) => l.style.fill)).toEqual(expect.arrayContaining(["var(--faun-dataviz-cat-1)", "var(--faun-dataviz-cat-2)"]));
  });

  it("lists items with group, value and share", () => {
    render(<CirclePackChart title="P" unit="t" data={data} />);
    expect(screen.getByRole("table")).toHaveTextContent("Materials / Steel Co");
    expect(screen.getByRole("table")).toHaveTextContent("Total");
  });

  it("shades by size when asked", () => {
    const { container } = render(<CirclePackChart colorBy="value" title="P" data={data} />);
    const fills = circles(container).filter((c) => c.dataset.branch === undefined).map((c) => c.style.fill);
    expect(fills).toContain("var(--faun-dataviz-seq-ochre-7)");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<CirclePackChart title="P" loading data={{ label: "x" }} />, <CirclePackChart title="P" data={{ label: "x" }} />, "P");
  });
});
