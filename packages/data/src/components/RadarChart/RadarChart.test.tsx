import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { RadarChart } from "./RadarChart.js";

const categories = ["Emissions", "Water", "Labour", "Governance"];
const series = [{ id: "a", label: "Supplier A", values: [80, 60, 40, 90] }, { id: "b", label: "Supplier B", values: [50, 70, 65, 55] }];

describe("RadarChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<RadarChart title="Supplier scores" max={100} categories={categories} series={series} />, "Supplier scores");
  });

  it("draws one polygon per series with its own marker shape, in categorical colours", () => {
    const { container } = render(<RadarChart title="Scores" max={100} categories={categories} series={series} />);
    const polys = [...container.querySelectorAll<SVGPathElement>("path.faun-chart-poly")];
    expect(polys.map((p) => p.style.stroke)).toEqual(["var(--faun-dataviz-cat-1)", "var(--faun-dataviz-cat-2)"]);
    const markers = [...container.querySelectorAll(".faun-chart-marker")];
    expect(markers).toHaveLength(8);
    expect(markers[0]!.tagName).toBe("circle");
    expect(markers[4]!.tagName).toBe("rect");
  });

  it("places points on spokes in proportion to value", () => {
    const { container } = render(<RadarChart title="Scores" max={100} categories={categories} series={[series[0]!]} />);
    const top = container.querySelectorAll<SVGCircleElement>("circle.faun-chart-marker")[0]!;
    // Category 0 points straight up: its x equals the centre and a higher value would sit higher.
    const spokes = [...container.querySelectorAll<SVGLineElement>("line.faun-chart-spoke")];
    expect(Number(top.getAttribute("cx"))).toBeCloseTo(Number(spokes[0]!.getAttribute("x1")), 3);
    expect(Number(top.getAttribute("cy"))).toBeGreaterThan(Number(spokes[0]!.getAttribute("y2")));
  });

  it("draws a dashed target ring and lists it in the table", () => {
    const { container } = render(<RadarChart title="Maturity" max={5} categories={categories} series={[series[0]!]} references={[{ label: "Expected", value: 3, kind: "target" }]} />);
    expect(container.querySelector("polygon.faun-chart-ref")).toHaveAttribute("data-kind", "target");
    expect(screen.getByRole("table")).toHaveTextContent("Target: Expected");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<RadarChart title="Scores" loading categories={categories} series={[]} />, <RadarChart title="Scores" categories={[]} series={[]} />, "Scores");
  });
});
