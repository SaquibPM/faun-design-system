import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { MeterChart } from "./MeterChart.js";

const zones = [{ from: 0, tone: "success" as const, label: "Within budget" }, { from: 70, tone: "warning" as const, label: "Approaching limit" }, { from: 90, tone: "danger" as const, label: "Over limit" }];
const segments = [{ id: "a", label: "Goods", value: 60 }, { id: "b", label: "Transport", value: 30 }, { id: "c", label: "Travel", value: 10 }];

describe("MeterChart", () => {
  it("keeps the chart accessibility contract (standard)", async () => {
    await expectChartContract(<MeterChart title="Carbon budget used" value={78} unit="%" zones={zones} />, "Carbon budget used", { single: true });
  });

  it("keeps the chart accessibility contract (proportional)", async () => {
    await expectChartContract(<MeterChart variant="proportional" title="Scope 3 split" unit="t" segments={segments} />, "Scope 3 split", { keys: ["{ArrowRight}"] });
  });

  it("fills in proportion to the value and takes the tone of its zone, naming the status in text", () => {
    const { container } = render(<MeterChart title="Budget" value={78} zones={zones} />);
    const bar = container.querySelector<SVGRectElement>("rect.faun-chart-bar")!;
    const track = container.querySelector<SVGRectElement>("rect.faun-chart-track-bar")!;
    expect(Number(bar.getAttribute("width")) / Number(track.getAttribute("width"))).toBeCloseTo(0.78, 2);
    expect(bar.style.fill).toBe("var(--faun-status-warning-solid)");
    expect(container.querySelector(".faun-chart-svg")).toHaveTextContent("Approaching limit");
    expect(screen.getByRole("table")).toHaveTextContent("Approaching limit");
  });

  it("splits a proportional meter into segments sized by value, in categorical colours", () => {
    const { container } = render(<MeterChart variant="proportional" title="Split" segments={segments} />);
    const segs = [...container.querySelectorAll<SVGRectElement>("rect.faun-chart-meter-seg")];
    expect(segs.map((s) => s.style.fill)).toEqual(["var(--faun-dataviz-cat-1)", "var(--faun-dataviz-cat-2)", "var(--faun-dataviz-cat-3)"]);
    expect(Number(segs[0]!.getAttribute("width")) / Number(segs[1]!.getAttribute("width"))).toBeCloseTo(2, 2);
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<MeterChart title="Split" variant="proportional" loading segments={[]} />, <MeterChart title="Split" variant="proportional" segments={[]} />, "Split");
  });
});
