import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { Sparkline } from "./Sparkline.js";

const values = [5, 8, 6, 9, 12];
const labels = ["Jan", "Feb", "Mar", "Apr", "May"];

describe("Sparkline", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<Sparkline title="Scope 2 trend" unit="t" values={values} labels={labels} />, "Scope 2 trend");
  });

  it("is a word-sized figure with no visible heading, legend or axes", () => {
    const { container } = render(<Sparkline title="Scope 2 trend" values={values} width={90} />);
    const figure = screen.getByRole("figure", { name: "Scope 2 trend" });
    expect(figure).toHaveStyle({ inlineSize: "90px" });
    expect(figure.querySelector(".faun-chart-title")).toBeNull();
    expect(container.querySelector(".faun-chart-legend")).toBeNull();
    expect(container.querySelector(".faun-chart-axes")).toBeNull();
  });

  it("draws a line with an end dot, an area, or bars", () => {
    const line = render(<Sparkline title="L" values={values} />);
    expect(line.container.querySelector("path.faun-chart-spark-line")).not.toBeNull();
    expect(line.container.querySelector("circle.faun-chart-dot")).not.toBeNull();
    line.unmount();
    const area = render(<Sparkline title="A" variant="area" values={values} />);
    expect(area.container.querySelector("path.faun-chart-area")).not.toBeNull();
    area.unmount();
    const bars = render(<Sparkline title="B" variant="bar" values={values} />);
    expect(bars.container.querySelectorAll("rect.faun-chart-bar")).toHaveLength(5);
  });

  it("breaks the line at missing values and reads each point with its label", async () => {
    const { container } = render(<Sparkline title="Water" unit="kL" values={[1, null, 3]} labels={["A", "B", "C"]} />);
    expect(container.querySelector("path.faun-chart-spark-line")!.getAttribute("d")!.match(/M/g)).toHaveLength(2);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent("B: Value No data");
    expect(screen.getByRole("table")).toHaveTextContent("No data");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<Sparkline title="T" loading values={[]} />, <Sparkline title="T" values={[]} />, "T");
  });
});
