import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { ComboChart } from "./ComboChart.js";

const categories = ["Jan", "Feb", "Mar"];
const series = [
  { id: "e", label: "Emissions", values: [800, 700, 600] },
  { id: "i", label: "Intensity", type: "line" as const, axis: "secondary" as const, values: [12, 11, 10] },
];

describe("ComboChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<ComboChart title="Emissions and intensity" unit="t" secondaryUnit="t/£m" categories={categories} series={series} />, "Emissions and intensity");
  });

  it("draws bars and a line, on two axes with their own units", () => {
    const { container } = render(<ComboChart title="Combo" unit="t" secondaryUnit="t/£m" categories={categories} series={series} />);
    expect(container.querySelectorAll("rect.faun-chart-bar")).toHaveLength(3);
    expect(container.querySelectorAll("path.faun-chart-line")).toHaveLength(1);
    expect(container.querySelectorAll(".faun-chart-marker")).toHaveLength(3);
    expect(container.querySelector(".faun-chart-svg")).toHaveTextContent("t/£m");
  });

  it("keeps the colour order across types and names the right axis in the table", () => {
    const { container } = render(<ComboChart title="Combo" unit="t" secondaryUnit="%" categories={categories} series={series} />);
    expect(container.querySelector<SVGRectElement>("rect.faun-chart-bar")!.style.fill).toBe("var(--faun-dataviz-cat-1)");
    expect(container.querySelector<SVGPathElement>("path.faun-chart-line")!.style.stroke).toBe("var(--faun-dataviz-cat-2)");
    expect(screen.getByRole("columnheader", { name: "Intensity (right axis)" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("12 %");
  });

  it("rescales when a series is hidden and supports reference lines", () => {
    const { container } = render(<ComboChart title="Combo" toggleSeries defaultHiddenSeries={["i"]} categories={categories} series={series} references={[{ label: "Cap", value: 900, kind: "target" }]} />);
    expect(container.querySelectorAll("path.faun-chart-line")).toHaveLength(0);
    expect(screen.getByRole("table")).toHaveTextContent("Target: Cap");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<ComboChart title="Combo" loading categories={categories} series={[]} />, <ComboChart title="Combo" categories={[]} series={[]} />, "Combo");
  });
});
