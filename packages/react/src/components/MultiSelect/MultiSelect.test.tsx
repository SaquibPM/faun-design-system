import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { MultiSelect } from "./MultiSelect.js";

const sites = [
  { value: "rot", label: "Rotterdam" },
  { value: "lyon", label: "Lyon" },
  { value: "gdansk", label: "Gdańsk" },
  { value: "porto", label: "Porto" },
  { value: "turin", label: "Turin", disabled: true },
];

describe("MultiSelect", () => {
  it("shows chips with +N overflow and a combobox labelled by the Field", () => {
    render(<Field label="Sites"><MultiSelect options={sites} defaultValue={["rot", "lyon", "gdansk", "porto"]} maxVisible={2} /></Field>);
    expect(screen.getByRole("combobox", { name: "Sites" })).toHaveTextContent(/4 selected/);
    const chips = screen.getByRole("list", { name: "Selected" });
    expect(within(chips).getByText("Rotterdam")).toBeInTheDocument();
    expect(within(chips).getByText("+2")).toBeInTheDocument();
  });
  it("toggles options and keeps the list open", async () => {
    const fn = vi.fn();
    render(<MultiSelect aria-label="Sites" options={sites} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Lyon" }));
    expect(fn).toHaveBeenLastCalledWith(["lyon"]);
    expect(screen.getByRole("option", { name: "Lyon" })).toHaveAttribute("aria-checked", "true");
    await userEvent.type(screen.getByPlaceholderText("Search"), "port{Enter}");
    expect(fn).toHaveBeenLastCalledWith(["lyon", "porto"]);
  });
  it("removes a chip, selects all enabled and clears", async () => {
    const fn = vi.fn();
    render(<MultiSelect aria-label="Sites" options={sites} defaultValue={["rot"]} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Rotterdam" }));
    expect(fn).toHaveBeenLastCalledWith([]);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("button", { name: "Select all" }));
    expect(fn).toHaveBeenLastCalledWith(["rot", "lyon", "gdansk", "porto"]);
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(fn).toHaveBeenLastCalledWith([]);
  });
  it("has no axe violations", async () => {
    const { container } = render(<Field label="Sites"><MultiSelect options={sites} defaultValue={["rot", "lyon"]} /></Field>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
