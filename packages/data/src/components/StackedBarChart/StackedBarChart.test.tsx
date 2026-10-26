import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { StackedBarChart } from "./StackedBarChart.js";

const categories = ["2025", "2026"];
const scopes = [
  { id: "scope-1", label: "Scope 1", values: [18900, 18240] },
  { id: "scope-2", label: "Scope 2", values: [9540, 9310] },
  { id: "scope-3", label: "Scope 3", values: [143800, 142880] },
];
const rects = (c: Element) => [...c.querySelectorAll<SVGRectElement>("rect.faun-chart-bar")];

describe("StackedBarChart", () => {
  it("uses the GHG scope colours for scope-1, scope-2 and scope-3, in the legend and the bars", async () => {
    const { container } = render(<StackedBarChart title="Emissions by scope" unit="tCO₂e" categories={categories} series={scopes} />);
    const fills = rects(container).slice(0, 3).map((r) => r.style.fill);
    expect(fills).toEqual(["var(--faun-dataviz-scope-1)", "var(--faun-dataviz-scope-2)", "var(--faun-dataviz-scope-3)"]);
    const swatches = [...container.querySelectorAll<SVGRectElement>(".faun-chart-legend .faun-chart-swatch .faun-relief-solid")].map((s) => s.style.fill);
    expect(swatches).toEqual(fills);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("stacks segments upward from the baseline in series order, with heights in proportion", () => {
    const { container } = render(<StackedBarChart title="Emissions by scope" categories={["2025"]} series={[
      { id: "a", label: "A", values: [100] }, { id: "b", label: "B", values: [200] }, { id: "c", label: "C", values: [300] },
    ]} />);
    const [a, b, c] = rects(container).map((r) => ({ y: Number(r.getAttribute("y")), h: Number(r.getAttribute("height")) }));
    expect(a!.y).toBeGreaterThan(b!.y);
    expect(b!.y).toBeGreaterThan(c!.y);
    expect(a!.y).toBeCloseTo(b!.y + b!.h, 3);
    expect(b!.y).toBeCloseTo(c!.y + c!.h, 3);
    expect(c!.h / a!.h).toBeCloseTo(3, 1);
  });

  it("treats missing values as no segment, never as a stacked zero", () => {
    const { container } = render(<StackedBarChart title="Partial" categories={["2026"]} series={[
      { id: "scope-1", label: "Scope 1", values: [18240] }, { id: "scope-3", label: "Scope 3", values: [null] },
    ]} />);
    expect(rects(container)).toHaveLength(1);
    expect(screen.getByRole("table")).toHaveTextContent("No data");
  });

  it("adds a total to the tooltip and the data table, and optionally above the stacks", () => {
    const { container } = render(<StackedBarChart title="Emissions by scope" unit="tCO₂e" showTotals categories={categories} series={scopes} />);
    expect(screen.getByRole("columnheader", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("172,240 tCO₂e");
    expect([...container.querySelectorAll(".faun-chart-value")].map((t) => t.textContent)).toEqual(["172,240", "170,430"]);
    fireEvent.pointerMove(screen.getByRole("group", { name: /Emissions by scope/ }), { clientX: 150 });
    expect(document.querySelector(".faun-chart-tooltip li[data-total]")).toHaveTextContent("Total172,240 tCO₂e");
  });

  it("takes categorical colours for non-scope series", () => {
    const { container } = render(<StackedBarChart title="Scope 3 categories" categories={["2026"]} series={[
      { id: "c1", label: "Goods", values: [5] }, { id: "c4", label: "Transport", values: [3] },
    ]} />);
    expect(rects(container).map((r) => r.style.fill)).toEqual(["var(--faun-dataviz-cat-1)", "var(--faun-dataviz-cat-2)"]);
  });
});
