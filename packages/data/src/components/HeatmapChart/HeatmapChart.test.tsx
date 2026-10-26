import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { HeatmapChart } from "./HeatmapChart.js";

const rows = ["Pune", "Leeds"]; const columns = ["Jan", "Feb", "Mar"];
const values = [[10, 20, 70], [5, null, 40]];
const cells = (c: Element) => [...c.querySelectorAll<SVGRectElement>("rect.faun-chart-cell")];

describe("HeatmapChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<HeatmapChart title="Emissions by site and month" unit="t" rows={rows} columns={columns} values={values} />, "Emissions by site and month");
  });

  it("shades cells with the sequential ramp, low to high, and leaves missing data as a dashed empty cell", () => {
    const { container } = render(<HeatmapChart title="Heat" rows={rows} columns={columns} values={values} />);
    const c = cells(container);
    expect(c).toHaveLength(6);
    expect(c[0]!.style.fill).toBe("var(--faun-dataviz-seq-lagoon-1)");
    expect(c[2]!.style.fill).toBe("var(--faun-dataviz-seq-lagoon-7)");
    expect(c[4]!.style.fill).toBe("none");
    expect(screen.getByRole("table")).toHaveTextContent("No data");
  });

  it("uses the diverging ramp around the midpoint, with the worse end on the positive side when asked", () => {
    const { container } = render(<HeatmapChart scale="diverging" positiveIs="worse" title="Var" rows={["A"]} columns={["x", "y", "z"]} values={[[-10, 0, 10]]} />);
    expect(cells(container).map((c) => c.style.fill)).toEqual(["var(--faun-dataviz-div-pos-3)", "var(--faun-dataviz-div-mid)", "var(--faun-dataviz-div-neg-3)"]);
  });

  it("writes values in cells on request and shows a colour key with the range ends", () => {
    const { container } = render(<HeatmapChart title="Heat" showValues unit="t" rows={rows} columns={columns} values={values} />);
    expect(container.querySelectorAll("text.faun-chart-cell-text").length).toBe(5);
    expect(screen.getByRole("group", { name: /Colour key/ })).toHaveTextContent("5 t");
  });

  it("moves between cells with all four arrows (Up and Down jump a row)", async () => {
    const { container } = render(<HeatmapChart title="Heat" rows={rows} columns={columns} values={values} />);
    const user = userEvent.setup();
    await user.tab();
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live).toHaveTextContent("Pune, Jan");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(live).toHaveTextContent("Pune, Mar");
    await user.keyboard("{ArrowDown}");
    expect(live).toHaveTextContent("Leeds, Mar");
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowUp}");
    expect(live).toHaveTextContent("Pune, Jan");
  });

  it("finds the cell under the pointer", () => {
    const { container } = render(<HeatmapChart title="Heat" rows={rows} columns={columns} values={values} />);
    fireEvent.pointerMove(screen.getByRole("group", { name: /Heat/ }), { clientX: 600, clientY: 30 });
    expect(container.querySelector(".faun-chart-tooltip-title")).toHaveTextContent(/^(Pune|Leeds), (Jan|Feb|Mar)$/);
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<HeatmapChart title="Heat" loading rows={[]} columns={[]} values={[]} />, <HeatmapChart title="Heat" rows={[]} columns={[]} values={[]} />, "Heat");
  });
});
