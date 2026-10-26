import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { TreemapChart } from "./TreemapChart.js";

const data = {
  label: "Scope 3",
  children: [
    { label: "Goods", children: [{ label: "Steel", value: 60, change: 5 }, { label: "Packaging", value: 20, change: -10 }] },
    { label: "Transport", children: [{ label: "Road", value: 20, change: 0 }] },
  ],
};
const tiles = (c: Element) => [...c.querySelectorAll<SVGRectElement>("rect.faun-chart-tile")];
const area = (r: SVGRectElement) => Number(r.getAttribute("width")) * Number(r.getAttribute("height"));

describe("TreemapChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<TreemapChart title="Scope 3 by category" unit="t" data={data} />, "Scope 3 by category");
  });

  it("sizes each tile by value and colours it by top-level group", () => {
    const { container } = render(<TreemapChart title="T" data={data} />);
    const t = tiles(container);
    expect(t).toHaveLength(3);
    const byLabel = Object.fromEntries(["Steel", "Packaging", "Road"].map((l, i) => [l, t[i]!]));
    expect(area(byLabel.Steel!) / area(byLabel.Packaging!)).toBeCloseTo(3, 1);
    expect(byLabel.Steel!.style.fill).toBe("var(--faun-dataviz-cat-1)");
    expect(byLabel.Road!.style.fill).toBe("var(--faun-dataviz-cat-2)");
  });

  it("lists items with path, group, value and share, and the total", () => {
    render(<TreemapChart title="T" unit="t" data={data} />);
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("Goods / Steel");
    expect(table).toHaveTextContent("60.0%");
    expect(table).toHaveTextContent("Total");
  });

  it("shades by size with the sequential ramp, or by change with the diverging ramp", () => {
    const a = render(<TreemapChart colorBy="value" title="T" data={data} />);
    expect(tiles(a.container)[0]!.style.fill).toBe("var(--faun-dataviz-seq-mauve-7)");
    a.unmount();
    const b = render(<TreemapChart colorBy="change" title="T" data={data} />);
    const fills = tiles(b.container).map((t) => t.style.fill);
    expect(fills[2]).toBe("var(--faun-dataviz-div-mid)");
    expect(fills[0]).toMatch(/div-neg/);
    expect(fills[1]).toMatch(/div-pos/);
    expect(screen.getByRole("table")).toHaveTextContent("Change");
  });

  it("removes a hidden group and gives its space to the rest", () => {
    const { container } = render(<TreemapChart toggleSeries defaultHiddenSeries={["Transport"]} title="T" data={data} />);
    expect(tiles(container)).toHaveLength(2);
    expect(screen.getByRole("table")).not.toHaveTextContent("Road");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<TreemapChart title="T" loading data={{ label: "x" }} />, <TreemapChart title="T" data={{ label: "x" }} />, "T");
  });
});
