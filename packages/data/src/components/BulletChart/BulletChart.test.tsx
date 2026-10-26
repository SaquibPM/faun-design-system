import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { BulletChart } from "./BulletChart.js";

const items = [
  { id: "a", label: "Renewable electricity", value: 62, target: 70, ranges: [40, 60, 100] },
  { id: "b", label: "Data completeness", value: 91, target: 95, ranges: [70, 90, 100] },
];

describe("BulletChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<BulletChart title="KPIs" unit="%" rangeLabels={["Behind", "On track", "Ahead"]} items={items} />, "KPIs");
  });

  it("draws a value bar, a target tick and graded bands per measure on one shared scale", () => {
    const { container } = render(<BulletChart title="KPIs" items={items} />);
    expect(container.querySelectorAll("rect.faun-chart-bar")).toHaveLength(2);
    expect(container.querySelectorAll(".faun-chart-svg line.faun-chart-target-mark")).toHaveLength(2);
    expect(container.querySelectorAll(".faun-chart-svg rect.faun-chart-range")).toHaveLength(6);
    const [a, b] = [...container.querySelectorAll<SVGRectElement>("rect.faun-chart-bar")];
    expect(Number(b!.getAttribute("width")) / Number(a!.getAttribute("width"))).toBeCloseTo(91 / 62, 2);
  });

  it("names the bands in the legend and the data table", () => {
    render(<BulletChart title="KPIs" rangeLabels={["Behind", "On track", "Ahead"]} items={items} />);
    expect(screen.getByRole("list", { name: "Legend" })).toHaveTextContent("On track");
    expect(screen.getByRole("table")).toHaveTextContent("Behind up to 40");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<BulletChart title="KPIs" loading items={[]} />, <BulletChart title="KPIs" items={[]} />, "KPIs");
  });
});
