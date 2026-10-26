import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { LineChart } from "./LineChart.js";

const months = ["Jan", "Feb", "Mar", "Apr"];
const paths = (c: Element) => [...c.querySelectorAll<SVGPathElement>("path.faun-chart-line")];

describe("LineChart", () => {
  it("draws one line per series with series colours, and no axe violations", async () => {
    const { container } = render(<LineChart title="Scope 2 by month" unit="tCO₂e" categories={months} series={[
      { id: "loc", label: "Location-based", values: [10, 12, 11, 9] }, { id: "mkt", label: "Market-based", values: [8, 9, 9, 7] },
    ]} />);
    const p = paths(container);
    expect(p).toHaveLength(2);
    expect(p[0]!.style.stroke).toBe("var(--faun-dataviz-cat-1)");
    expect(p[1]!.style.stroke).toBe("var(--faun-dataviz-cat-2)");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("tells series apart by marker shape as well as colour, in the plot and the legend", () => {
    const { container } = render(<LineChart title="Two series" categories={months} series={[
      { id: "a", label: "A", values: [1, 2, 3, 4] }, { id: "b", label: "B", values: [2, 3, 4, 5] },
    ]} />);
    expect(container.querySelectorAll("svg.faun-chart-svg circle.faun-chart-marker")).toHaveLength(4);
    expect(container.querySelectorAll("svg.faun-chart-svg rect.faun-chart-marker")).toHaveLength(4);
    const legend = container.querySelectorAll(".faun-chart-legend .faun-chart-swatch");
    expect(legend[0]!.querySelector("circle")).not.toBeNull();
    expect(legend[1]!.querySelector("rect")).not.toBeNull();
  });

  it("breaks the line at a null value instead of dropping to zero", () => {
    const { container } = render(<LineChart title="Gap" categories={months} series={[{ id: "a", label: "A", values: [5, 6, null, 7] }]} />);
    const d = paths(container)[0]!.getAttribute("d")!;
    expect(d.match(/M/g)).toHaveLength(2);
    expect(d.match(/L/g)).toHaveLength(1);
    expect(container.querySelectorAll("circle.faun-chart-marker")).toHaveLength(3);
  });

  it("starts the axis at zero by default and fits the data when zeroBaseline is off", () => {
    const series = [{ id: "f", label: "Factor", values: [0.23, 0.21, 0.19] }];
    const ticks = (c: Element) => [...c.querySelectorAll("text.faun-chart-tick")].map((t) => t.textContent).filter((t) => /^[\d.]+$/.test(t ?? ""));
    const zero = render(<LineChart title="Factor" categories={["a", "b", "c"]} series={series} format={(v) => String(v)} />);
    expect(ticks(zero.container)).toContain("0");
    zero.unmount();
    const fitted = render(<LineChart title="Factor" zeroBaseline={false} categories={["a", "b", "c"]} series={series} format={(v) => String(v)} />);
    expect(ticks(fitted.container)).not.toContain("0");
  });

  it("highlights the active point and draws a guide line while reading with the keyboard", async () => {
    const { container } = render(<LineChart title="Guide" categories={months} series={[{ id: "a", label: "A", values: [1, 2, 3, 4] }]} />);
    expect(container.querySelector(".faun-chart-guide")).toBeNull();
    (container.querySelector(".faun-chart-plot") as HTMLElement).focus();
    await Promise.resolve();
    expect(container.querySelector(".faun-chart-guide")).not.toBeNull();
    expect(container.querySelector(".faun-chart-halo")).not.toBeNull();
  });
});
