import { describe, expect, it } from "vitest";
import { CHART_DEFAULT_RAMP, CHART_DEFAULT_SLOT, resolveColors } from "../src/components/ChartKit/scale.js";

/** ADR 0008: each chart type has its own default hue when it draws one series; moss stays series 1 whenever there are several. */
describe("chart default colours", () => {
  it("gives the chart types at least five different single-series hues, all categorical token slots", () => {
    const slots = Object.values(CHART_DEFAULT_SLOT);
    for (const s of slots) expect(s).toMatch(/^cat-[1-8]$/);
    expect(new Set(slots).size).toBeGreaterThanOrEqual(5);
    expect(CHART_DEFAULT_SLOT.bar).toBe("cat-1");
  });
  it("gives heatmap, treemap and circle pack three different sequential hues", () => {
    expect(new Set(Object.values(CHART_DEFAULT_RAMP)).size).toBe(3);
  });
  it("applies the type default to a lone series only: explicit colour and scopes win, and several series start at moss", () => {
    expect(resolveColors([{ id: "a" }], CHART_DEFAULT_SLOT.line)).toEqual(["cat-2"]);
    expect(resolveColors([{ id: "a", color: "cat-5" }], CHART_DEFAULT_SLOT.line)).toEqual(["cat-5"]);
    expect(resolveColors([{ id: "scope-2" }], CHART_DEFAULT_SLOT.line)).toEqual(["scope-2"]);
    expect(resolveColors([{ id: "a" }, { id: "b" }], CHART_DEFAULT_SLOT.line)).toEqual(["cat-1", "cat-2"]);
    expect(resolveColors([{ id: "a" }])).toEqual(["cat-1"]);
  });
});
