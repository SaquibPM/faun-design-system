import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { RadioGroup } from "./RadioGroup.js";

const methods = [
  { value: "location", label: "Location-based", description: "Grid-average emission factors" },
  { value: "market", label: "Market-based", description: "Contractual instruments and residual mix" },
  { value: "dual", label: "Dual reporting", disabled: true },
];

describe("RadioGroup", () => {
  it("is a labelled radiogroup with described options", () => {
    render(<RadioGroup label="Scope 2 method" options={methods} defaultValue="market" />);
    expect(screen.getByRole("radiogroup", { name: "Scope 2 method" })).toBeInTheDocument();
    const market = screen.getByRole("radio", { name: "Market-based" });
    expect(market).toBeChecked();
    expect(market).toHaveAccessibleDescription("Contractual instruments and residual mix");
    expect(screen.getByRole("radio", { name: "Dual reporting" })).toBeDisabled();
  });
  it("selects by click and moves with arrow keys, skipping disabled options", async () => {
    const fn = vi.fn();
    render(<RadioGroup label="Scope 2 method" options={methods} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("radio", { name: "Location-based" }));
    expect(fn).toHaveBeenLastCalledWith("location");
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Market-based" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Location-based" })).toHaveFocus();
  });
  it("renders the card variant and an error", async () => {
    const { container } = render(<RadioGroup label="Boundary" variant="card" columns={2} options={methods} error="Choose a method" />);
    expect(container.querySelector(".faun-radio-group")).toHaveAttribute("data-variant", "card");
    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription(/Choose a method/);
  });
  it("has no axe violations", async () => {
    const { container } = render(<RadioGroup label="Scope 2 method" description="Used for every site" options={methods} defaultValue="location" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
