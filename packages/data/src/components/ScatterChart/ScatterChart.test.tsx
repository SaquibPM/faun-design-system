import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { ScatterChart } from "./ScatterChart.js";

const series = [
  { id: "a", label: "Manufacturing", points: [{ x: 120, y: 8.2, size: 900, label: "Pune plant" }, { x: 80, y: 5.4, size: 600, label: "Chennai plant" }, { x: 30, y: 2.1, size: 200, label: "Rotterdam DC" }] },
  { id: "b", label: "Logistics", points: [{ x: 60, y: 3.9, size: 400, label: "Leeds hub" }, { x: 20, y: 1.2, size: 90, label: "Austin hub" }] },
];
const common = { title: "Energy use against emissions", xTitle: "Energy", xUnit: "GWh", yTitle: "Emissions", unit: "ktCO₂e", series };

describe("ScatterChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<ScatterChart {...common} />, "Energy use against emissions");
  });

  it("draws one mark per point with a different shape per series, in categorical colours", () => {
    const { container } = render(<ScatterChart {...common} />);
    const marks = [...container.querySelectorAll<SVGElement>(".faun-chart-marker")];
    expect(marks).toHaveLength(5);
    expect(marks[0]!.tagName).toBe("circle");
    expect(marks[3]!.tagName).toBe("rect");
    expect(marks[0]!.style.fill).toBe("var(--faun-dataviz-cat-1)");
    expect(marks[3]!.style.fill).toBe("var(--faun-dataviz-cat-2)");
  });

  it("sizes bubbles by area from the size measure", () => {
    const { container } = render(<ScatterChart {...common} variant="bubble" sizeTitle="Output" sizeUnit="t" />);
    const r = [...container.querySelectorAll<SVGCircleElement>("circle.faun-chart-bubble")].map((c) => Number(c.getAttribute("r")));
    expect(r).toHaveLength(5);
    expect(r[0]).toBeGreaterThan(r[1]!);
    expect(r[1]).toBeGreaterThan(r[2]!);
    expect(screen.getByRole("table")).toHaveTextContent("Output (t)");
  });

  it("lists every point, with its name and values, in the data table, and target lines at the foot", () => {
    render(<ScatterChart {...common} references={[{ label: "Site limit", value: 6, kind: "target" }]} />);
    const t = screen.getByRole("table");
    expect(t).toHaveTextContent("Pune plant");
    expect(t).toHaveTextContent("Energy (GWh)");
    expect(t).toHaveTextContent("Target: Site limit");
  });

  it("removes a hidden series from the drawing and the table", async () => {
    const { container } = render(<ScatterChart {...common} toggleSeries defaultHiddenSeries={["b"]} />);
    expect(container.querySelectorAll(".faun-chart-marker")).toHaveLength(3);
    expect(screen.getByRole("table")).not.toHaveTextContent("Leeds hub");
    expect(screen.getByRole("button", { name: "Logistics" })).toHaveAttribute("aria-pressed", "false");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<ScatterChart {...common} loading />, <ScatterChart {...common} series={[]} />, "Energy use against emissions");
  });
});
