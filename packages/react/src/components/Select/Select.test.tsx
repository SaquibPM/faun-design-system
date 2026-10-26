import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Select } from "./Select.js";

const standards = [
  { value: "e1", label: "ESRS E1", description: "Climate change", group: "Environment" },
  { value: "e3", label: "ESRS E3", description: "Water and marine resources", group: "Environment" },
  { value: "s1", label: "ESRS S1", description: "Own workforce", group: "Social" },
  { value: "g1", label: "ESRS G1", description: "Business conduct", group: "Governance", disabled: true },
];

describe("Select", () => {
  it("is a combobox labelled by its Field, showing the placeholder", () => {
    render(<Field label="Standard" description="Topical standard for this datapoint"><Select options={standards} placeholder="Choose a standard" /></Field>);
    const c = screen.getByRole("combobox", { name: "Standard" });
    expect(c).toHaveTextContent("Choose a standard");
    expect(c).toHaveAccessibleDescription("Topical standard for this datapoint");
  });
  it("opens, lists grouped options and selects one", async () => {
    const fn = vi.fn();
    render(<Select aria-label="Standard" options={standards} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("combobox"));
    const list = await screen.findByRole("listbox");
    expect(list).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Social" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /ESRS G1/ })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("option", { name: /ESRS S1/ }));
    expect(fn).toHaveBeenCalledWith("s1");
    expect(screen.getByRole("combobox")).toHaveTextContent("ESRS S1");
  });
  it("is controlled and reflects invalid from Field", () => {
    render(<Field label="Standard" error="Choose a standard"><Select options={standards} value="e3" /></Field>);
    const c = screen.getByRole("combobox");
    expect(c).toHaveTextContent("ESRS E3");
    expect(c).toHaveAttribute("aria-invalid", "true");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Field label="Standard"><Select options={standards} defaultValue="e1" size="sm" /></Field>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
