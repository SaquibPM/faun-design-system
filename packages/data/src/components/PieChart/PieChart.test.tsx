import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { PieChart } from "./PieChart.js";

const slices = [{ id: "scope-1", label: "Scope 1", value: 25 }, { id: "scope-2", label: "Scope 2", value: 25 }, { id: "scope-3", label: "Scope 3", value: 50 }];
const paths = (c: Element) => [...c.querySelectorAll<SVGPathElement>("path.faun-chart-slice")];

describe("PieChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<PieChart title="Emissions by scope" unit="tCO₂e" slices={slices} />, "Emissions by scope");
  });

  it("draws one slice per part in order, with GHG scope colours for scope ids", () => {
    const { container } = render(<PieChart title="Scopes" slices={slices} />);
    expect(paths(container).map((p) => p.style.fill)).toEqual(["var(--faun-dataviz-scope-1)", "var(--faun-dataviz-scope-2)", "var(--faun-dataviz-scope-3)"]);
    expect(screen.getAllByRole("listitem").map((l) => l.textContent)).toEqual(expect.arrayContaining(["Scope 1", "Scope 2", "Scope 3"]));
  });

  it("lists value and share in the data table, and the total at the foot", () => {
    render(<PieChart title="Scopes" unit="t" slices={slices} />);
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("Scope 3");
    expect(table).toHaveTextContent("50%");
    expect(table).toHaveTextContent("Total");
  });

  it("leaves a hole in a donut and writes the total there, or a custom value", () => {
    const { container, rerender } = render(<PieChart variant="donut" title="Scopes" slices={slices} centerLabel="Footprint" />);
    expect(container.querySelector(".faun-chart-big")).toHaveTextContent("100");
    expect(container.querySelector(".faun-chart-sub")).toHaveTextContent("Footprint");
    rerender(<PieChart variant="donut" title="Scopes" slices={slices} centerValue="72%" />);
    expect(container.querySelector(".faun-chart-big")).toHaveTextContent("72%");
  });

  it("draws a single full slice as a closed disc", () => {
    const { container } = render(<PieChart title="One" slices={[{ id: "a", label: "All", value: 10 }]} />);
    expect(paths(container)).toHaveLength(1);
    expect(paths(container)[0]!.getAttribute("d")).toMatch(/Z$/);
  });

  it("rescales to the visible slices when one is hidden from the legend", () => {
    const { container } = render(<PieChart title="Scopes" slices={slices} toggleSeries defaultHiddenSeries={["scope-3"]} />);
    expect(paths(container)).toHaveLength(2);
    expect(screen.getByRole("table")).toHaveTextContent("50%");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<PieChart title="Scopes" loading slices={[]} />, <PieChart title="Scopes" slices={[]} />, "Scopes");
  });
});
