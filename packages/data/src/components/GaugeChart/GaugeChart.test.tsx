import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract } from "../../../test/contract.js";
import { GaugeChart } from "./GaugeChart.js";

describe("GaugeChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<GaugeChart title="Data completeness" value={91} unit="%" target={95} />, "Data completeness", { single: true });
  });

  it("shows the value, range ends and delta with its sign in words as well as position", () => {
    const { container } = render(<GaugeChart title="Completeness" value={91} unit="%" delta={-2.5} deltaLabel="vs last quarter" />);
    expect(container.querySelector(".faun-chart-big")).toHaveTextContent("91");
    expect(container.querySelector(".faun-chart-svg")).toHaveTextContent("-2.5 % vs last quarter");
    expect(screen.getByRole("table")).toHaveTextContent("0");
    expect(screen.getByRole("table")).toHaveTextContent("100");
  });

  it("draws an arc that covers the share of the range, and a target tick", () => {
    const { container } = render(<GaugeChart title="Completeness" value={50} target={80} />);
    expect(container.querySelector("path.faun-chart-value-arc")).not.toBeNull();
    expect(container.querySelector("line.faun-chart-target-mark")).not.toBeNull();
    expect(container.querySelector<SVGPathElement>("path.faun-chart-value-arc")!.style.stroke).toBe("var(--faun-dataviz-cat-7)");
  });

  it("uses a status colour only when a tone is given, and names the status in text", () => {
    const { container } = render(<GaugeChart title="Assurance" value={42} tone="danger" />);
    expect(container.querySelector<SVGPathElement>("path.faun-chart-value-arc")!.style.stroke).toBe("var(--faun-status-danger-solid)");
    expect(screen.getByRole("table")).toHaveTextContent("Off track");
  });

  it("shows a loading state", () => {
    render(<GaugeChart title="Completeness" value={0} loading />);
    expect(screen.getByRole("status", { name: "Loading Completeness" })).toBeInTheDocument();
  });
});
