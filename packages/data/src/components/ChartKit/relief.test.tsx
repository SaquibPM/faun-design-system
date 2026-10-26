import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { AreaChart } from "../AreaChart/AreaChart.js";
import { BarChart } from "../BarChart/BarChart.js";
import { MeterChart } from "../MeterChart/MeterChart.js";
import { PieChart } from "../PieChart/PieChart.js";
import { slotOf, waveOf } from "./relief.js";

const categories = ["Pune", "Chennai", "Leeds"];
const two = [{ id: "x", label: "Electricity", values: [3, 4, 2] }, { id: "y", label: "Gas", values: [2, 5, 1] }];

afterEach(() => vi.restoreAllMocks());

describe("relief appearance", () => {
  it("is the default, and flat is a prop", () => {
    const a = render(<BarChart title="Relief" categories={categories} series={two} />);
    expect(a.container.querySelector("figure")).toHaveAttribute("data-appearance", "relief");
    const b = render(<BarChart title="Flat" appearance="flat" categories={categories} series={two} />);
    expect(b.container.querySelector("figure")).toHaveAttribute("data-appearance", "flat");
  });

  it("draws each bar as a block: side face, tinted face, wave texture and outline", () => {
    const { container } = render(<BarChart title="Relief" categories={categories} series={two} />);
    const blocks = container.querySelectorAll(".faun-chart-svg .faun-relief");
    expect(blocks).toHaveLength(6);
    for (const g of blocks) {
      expect(g.querySelector("polygon.faun-relief-side")).not.toBeNull();
      expect(g.querySelector("rect.faun-chart-bar")).not.toBeNull();
      expect(g.querySelector("rect.faun-relief-wash")).not.toBeNull();
      expect(g.querySelector("rect.faun-relief-tex")).not.toBeNull();
      expect(g.querySelector("rect.faun-relief-line")).not.toBeNull();
    }
  });

  it("keeps the footprint of a bar the same: the face plus the side face fill the slot", () => {
    const relief = render(<BarChart title="Relief" categories={["A"]} series={[{ id: "s", label: "S", values: [5] }]} />);
    const flat = render(<BarChart title="Flat" appearance="flat" categories={["A"]} series={[{ id: "s", label: "S", values: [5] }]} />);
    const face = relief.container.querySelector<SVGRectElement>("rect.faun-chart-bar")!;
    const side = relief.container.querySelector<SVGPolygonElement>("polygon.faun-relief-side")!;
    const flatBar = flat.container.querySelector<SVGRectElement>("rect.faun-chart-bar")!;
    const maxX = Math.max(...side.getAttribute("points")!.split(" ").map((p) => Number(p.split(",")[0])));
    expect(maxX).toBeCloseTo(Number(flatBar.getAttribute("x")) + Number(flatBar.getAttribute("width")), 5);
    expect(Number(face.getAttribute("height"))).toBe(Number(flatBar.getAttribute("height")));
  });

  it("draws no side face when flat, or when the tokens set the depth to 0 (high contrast, print, forced colours)", () => {
    const flat = render(<BarChart title="Flat" appearance="flat" categories={categories} series={two} />);
    expect(flat.container.querySelectorAll(".faun-chart-svg polygon.faun-relief-side")).toHaveLength(0);
    flat.unmount();
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ getPropertyValue: () => "0px" } as unknown as CSSStyleDeclaration);
    const hatch = render(<BarChart title="Hatch" categories={categories} series={two} />);
    expect(hatch.container.querySelectorAll(".faun-chart-svg polygon.faun-relief-side")).toHaveLength(0);
    expect(hatch.container.querySelectorAll(".faun-relief-tex").length).toBeGreaterThan(0);
  });

  it("gives each series its own wave, so series differ without colour, and the legend swatch wears the same one", () => {
    const { container } = render(<BarChart title="Waves" categories={categories} series={two} />);
    const waveOfBar = (i: number) => (container.querySelectorAll<SVGGElement>(".faun-chart-svg .faun-relief")[i]!).style.getPropertyValue("--_wave");
    expect(waveOfBar(0)).toBe("var(--faun-dataviz-relief-wave-1)");
    expect(waveOfBar(1)).toBe("var(--faun-dataviz-relief-wave-2)");
    const swatches = [...container.querySelectorAll<SVGGElement>(".faun-chart-legend .faun-relief")].map((g) => g.style.getPropertyValue("--_wave"));
    expect(swatches).toEqual(["var(--faun-dataviz-relief-wave-1)", "var(--faun-dataviz-relief-wave-2)"]);
    expect(slotOf("var(--faun-dataviz-seq-3)")).toBe("seq-3");
    expect(slotOf("var(--faun-status-warning-solid)")).toBe("status-warning");
    expect(waveOf("scope-1")).toBe(7);
    expect(new Set(Array.from({ length: 8 }, (_, i) => waveOf(`cat-${i + 1}`))).size).toBe(8);
  });

  it("derives colours from tokens only: marks carry var() references, never a literal colour", () => {
    const { container } = render(<BarChart title="Tokens" variant="stacked" categories={categories} series={two} showTotals />);
    const styles = [...container.querySelectorAll<SVGElement>("[style]")].map((e) => e.getAttribute("style")!).join(";");
    expect(styles).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|color-mix\(/i);
    expect(styles).toContain("--faun-dataviz-cat-1-line");
    expect(styles).toContain("--faun-dataviz-cat-1-shade");
  });

  it("fades gridlines at the ends in relief, and keeps them plain in flat", () => {
    const relief = render(<BarChart title="Relief" categories={categories} series={two} />);
    expect(relief.container.querySelector("linearGradient")).not.toBeNull();
    expect(relief.container.querySelector<SVGLineElement>("line.faun-chart-grid")!.style.stroke).toMatch(/^url\(["']?#faun-fade-/);
    const flat = render(<BarChart title="Flat" appearance="flat" categories={categories} series={two} />);
    expect(flat.container.querySelector("linearGradient")).toBeNull();
  });

  it("writes category labels as axis labels and breaks long ones over two lines instead of dropping them", () => {
    const { container } = render(<BarChart title="Labels" categories={["Pune plant", "Chennai plant", "Rotterdam DC", "Leeds office", "Austin lab"]} series={[{ id: "s", label: "S", values: [1, 2, 3, 4, 5] }]} />);
    const labels = [...container.querySelectorAll(".faun-chart-axis-cat")];
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.map((l) => l.textContent).join(" ")).toContain("Pune plant");
  });

  it("applies to pie slices (extruded), meters and area fills", () => {
    const pie = render(<PieChart title="Pie" slices={[{ id: "a", label: "A", value: 3 }, { id: "b", label: "B", value: 2 }]} />);
    expect(pie.container.querySelectorAll("path.faun-relief-side")).toHaveLength(2);
    expect(pie.container.querySelectorAll("path.faun-chart-slice")).toHaveLength(2);
    const meter = render(<MeterChart title="Meter" value={40} />);
    expect(meter.container.querySelector(".faun-chart-svg .faun-relief")).not.toBeNull();
    const area = render(<AreaChart title="Area" categories={categories} series={[two[0]!]} />);
    expect(area.container.querySelector("path.faun-chart-area")).not.toBeNull();
    expect(area.container.querySelector("path.faun-relief-tex")).not.toBeNull();
  });

  it("keeps the data table, keyboard reading and axe results in relief and flat", async () => {
    for (const appearance of ["relief", "flat"] as const) {
      const { container, unmount } = render(<BarChart title={`Chart ${appearance}`} appearance={appearance} unit="tCO₂e" categories={categories} series={two} />);
      expect(container.querySelector("table")).not.toBeNull();
      expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
      expect(container.querySelector('[role="group"][aria-roledescription="chart"]')).toHaveAttribute("tabindex", "0");
      expect(await axeViolations(container)).toEqual([]);
      unmount();
    }
  });

  it("takes a pastel palette as a prop: data-viz-palette on the chart; unset when no prop, and `default` opts out of an ancestor's palette (ADR 0007)", () => {
    const def = render(<BarChart title="Default" categories={categories} series={two} />);
    expect(def.container.querySelector("figure")).not.toHaveAttribute("data-viz-palette");
    def.unmount();
    const explicit = render(<BarChart title="Explicit" palette="default" categories={categories} series={two} />);
    expect(explicit.container.querySelector("figure")).toHaveAttribute("data-viz-palette", "default");
    explicit.unmount();
    for (const palette of ["meadow", "dawn", "harbour"] as const) {
      const { container, unmount } = render(<BarChart title={palette} palette={palette} categories={categories} series={two} />);
      expect(container.querySelector("figure")).toHaveAttribute("data-viz-palette", palette);
      unmount();
    }
    const pie = render(<PieChart title="Pie" palette="dawn" slices={[{ id: "a", label: "A", value: 3 }, { id: "b", label: "B", value: 2 }]} />);
    expect(pie.container.querySelector("figure")).toHaveAttribute("data-viz-palette", "dawn");
  });

  it("gives every relief mark a pastel face and face opacity that fall back to the surface wash when no palette is in scope", () => {
    const { container } = render(<BarChart title="Face" categories={categories} series={two} />);
    const g = container.querySelector<SVGGElement>(".faun-chart-svg .faun-relief")!;
    expect(g.style.getPropertyValue("--_face")).toBe("var(--faun-dataviz-cat-1-face, var(--faun-dataviz-surface))");
    expect(g.style.getPropertyValue("--_face-op")).toContain("var(--faun-dataviz-cat-1-face-op, calc(100% - var(--faun-dataviz-relief-face-mix)))");
    // slots without a palette (scopes, ramps, status) keep the surface wash
    const scope = render(<BarChart title="Scope" categories={categories} series={[{ id: "scope-1", label: "S1", values: [1, 2, 3] }]} />);
    expect(scope.container.querySelector<SVGGElement>(".faun-chart-svg .faun-relief")!.style.getPropertyValue("--_face")).toBe("var(--faun-dataviz-scope-1-face, var(--faun-dataviz-surface))");
  });
});
