import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Slider } from "./Slider.js";

describe("Slider", () => {
  it("is a slider labelled by its Field with a formatted value", () => {
    render(<Field label="Materiality threshold"><Slider defaultValue={[40]} formatValue={(v) => `${v}%`} /></Field>);
    const s = screen.getByRole("slider", { name: "Materiality threshold" });
    expect(s).toHaveAttribute("aria-valuenow", "40");
    expect(s).toHaveAttribute("aria-valuetext", "40%");
    expect(screen.getByText("40%")).toBeInTheDocument();
  });
  it("moves with arrow keys, Home and End", async () => {
    const fn = vi.fn();
    render(<Slider aria-label="Confidence" defaultValue={[50]} step={5} onValueChange={fn} />);
    const s = screen.getByRole("slider");
    await userEvent.click(s);
    await userEvent.keyboard("{ArrowRight}");
    expect(fn).toHaveBeenLastCalledWith([55]);
    await userEvent.keyboard("{End}");
    expect(fn).toHaveBeenLastCalledWith([100]);
  });
  it("supports a range with two named thumbs and marks", () => {
    const { container } = render(<Slider aria-label="Years" min={2019} max={2026} defaultValue={[2020, 2024]} marks={[{ value: 2019, label: "2019" }, { value: 2026, label: "2026" }]} thumbLabels={["Base year", "Target year"]} />);
    expect(screen.getByRole("slider", { name: "Base year" })).toHaveAttribute("aria-valuenow", "2020");
    expect(screen.getByRole("slider", { name: "Target year" })).toHaveAttribute("aria-valuenow", "2024");
    expect(container.querySelectorAll(".faun-slider-mark")).toHaveLength(2);
    expect(screen.getByText("2020 – 2024")).toBeInTheDocument();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Field label="Threshold" description="Topics above this are material"><Slider defaultValue={[30]} marks /></Field>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
