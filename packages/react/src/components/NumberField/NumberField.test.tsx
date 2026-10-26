import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { NumberField } from "./NumberField.js";

describe("NumberField", () => {
  it("is a spinbutton with min, max and value", () => {
    render(<Field label="Threshold"><NumberField defaultValue={5} min={0} max={100} unit="%" /></Field>);
    const n = screen.getByRole("spinbutton", { name: "Threshold" });
    expect(n).toHaveAttribute("aria-valuenow", "5");
    expect(n).toHaveAttribute("aria-valuemin", "0");
    expect(n).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("%")).toBeInTheDocument();
  });
  it("steps with arrow keys (Shift for ×10) and clamps", async () => {
    const fn = vi.fn();
    render(<NumberField aria-label="Sites" defaultValue={8} min={0} max={20} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("spinbutton"));
    await userEvent.keyboard("{ArrowUp}");
    expect(fn).toHaveBeenLastCalledWith(9);
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(fn).toHaveBeenLastCalledWith(19);
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(fn).toHaveBeenLastCalledWith(20);
    await userEvent.keyboard("{Home}");
    expect(fn).toHaveBeenLastCalledWith(0);
  });
  it("parses typed input and formats on blur", async () => {
    function C() {
      const [v, setV] = useState<number | null>(null);
      return <><NumberField aria-label="Emissions" value={v} onValueChange={setV} unit="tCO₂e" locale="en-US" /><output>{String(v)}</output></>;
    }
    render(<C />);
    const n = screen.getByRole("spinbutton");
    await userEvent.type(n, "12500.5");
    await userEvent.tab();
    expect(n).toHaveValue("12,500.5");
    expect(screen.getByText("12500.5")).toBeInTheDocument();
  });
  it("stepper buttons change the value and are labelled", async () => {
    const fn = vi.fn();
    render(<NumberField aria-label="Years" defaultValue={3} stepper onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /increase/i }));
    expect(fn).toHaveBeenLastCalledWith(4);
    await userEvent.click(screen.getByRole("button", { name: /decrease/i }));
    expect(fn).toHaveBeenLastCalledWith(3);
  });
  it("has no axe violations", async () => {
    const { container } = render(<Field label="Allocation" error="Must be between 0 and 100"><NumberField defaultValue={120} min={0} max={100} unit="%" stepper /></Field>);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-invalid", "true");
    expect(await axeViolations(container)).toEqual([]);
  });
});
