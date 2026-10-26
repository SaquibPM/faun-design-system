import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Combobox } from "./Combobox.js";

const factors = [
  { value: "defra-gas", label: "Natural gas (DEFRA 2025)", description: "0.18 kgCO₂e/kWh", keywords: ["methane"], group: "Fuels" },
  { value: "defra-diesel", label: "Diesel (DEFRA 2025)", description: "2.51 kgCO₂e/litre", group: "Fuels" },
  { value: "iea-uk", label: "UK grid electricity (IEA 2025)", description: "0.21 kgCO₂e/kWh", group: "Electricity" },
];

describe("Combobox as a typed field", () => {
  it("is a text input with the combobox role, named by its Field", () => {
    render(<Field label="Emission factor"><Combobox options={factors} placeholder="Choose a factor" /></Field>);
    const input = screen.getByRole("combobox", { name: "Emission factor" });
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
  });

  it("filters as you type, shows the highlight through aria-activedescendant, and Enter selects", async () => {
    const fn = vi.fn();
    render(<Field label="Emission factor"><Combobox options={factors} onValueChange={fn} /></Field>);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await userEvent.keyboard("diesel");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    const opt = screen.getByRole("option");
    expect(input).toHaveAttribute("aria-activedescendant", opt.id);
    expect(input).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
    await userEvent.keyboard("{Enter}");
    expect(fn).toHaveBeenCalledWith("defra-diesel");
    expect(input).toHaveValue("Diesel (DEFRA 2025)");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveFocus();
  });

  it("moves the highlight with the arrow keys while focus stays in the field", async () => {
    render(<Combobox aria-label="Factor" options={factors} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    const options = screen.getAllByRole("option");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id);
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", options[1]!.id);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id); // wraps
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute("aria-activedescendant", options[2]!.id);
    expect(input).toHaveFocus();
  });

  it("opens with ArrowDown from closed, and Escape closes and restores the selection", async () => {
    render(<Combobox aria-label="Factor" options={factors} defaultValue="iea-uk" />);
    const input = screen.getByRole("combobox");
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("zz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    await userEvent.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("UK grid electricity (IEA 2025)");
  });

  it("matches keywords and descriptions, and shows the empty message", async () => {
    render(<Combobox aria-label="Factor" options={factors} emptyMessage="No factors match. Try the unit." />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.keyboard("methane");
    expect(screen.getByRole("option", { name: /Natural gas/ })).toBeInTheDocument();
    await userEvent.clear(screen.getByRole("combobox"));
    await userEvent.keyboard("zzz");
    expect(screen.getByText("No factors match. Try the unit.")).toBeInTheDocument();
  });

  it("selects with the mouse and does not blur the field", async () => {
    const fn = vi.fn();
    render(<Combobox aria-label="Factor" options={factors} onValueChange={fn} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.click(screen.getByRole("option", { name: /UK grid/ }));
    expect(fn).toHaveBeenCalledWith("iea-uk");
    expect(input).toHaveFocus();
  });

  it("toggles with the chevron button", async () => {
    render(<Combobox aria-label="Factor" options={factors} />);
    await userEvent.click(screen.getByRole("button", { name: "Show options" }));
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("button", { name: "Hide options" }));
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false");
  });

  it("clears with the clear button and returns focus to the field", async () => {
    const fn = vi.fn();
    render(<Combobox aria-label="Factor" options={factors} defaultValue="iea-uk" clearable onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Clear UK grid/ }));
    expect(fn).toHaveBeenCalledWith(null);
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("emptying the text and leaving clears the value", async () => {
    const fn = vi.fn();
    render(<Combobox aria-label="Factor" options={factors} defaultValue="iea-uk" onValueChange={fn} />);
    await userEvent.clear(screen.getByRole("combobox"));
    await userEvent.tab();
    expect(fn).toHaveBeenCalledWith(null);
  });

  it("works as a controlled field", async () => {
    function C() {
      const [v, setV] = useState<string | null>("defra-gas");
      return <><Combobox aria-label="Factor" options={factors} value={v} onValueChange={setV} /><button onClick={() => setV("iea-uk")}>Set UK</button></>;
    }
    render(<C />);
    expect(screen.getByRole("combobox")).toHaveValue("Natural gas (DEFRA 2025)");
    await userEvent.click(screen.getByRole("button", { name: "Set UK" }));
    expect(screen.getByRole("combobox")).toHaveValue("UK grid electricity (IEA 2025)");
  });

  it("shows loading and announces counts politely", async () => {
    const { rerender } = render(<Combobox aria-label="Factor" options={[]} loading />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-busy", "true");
    rerender(<Combobox aria-label="Factor" options={factors} />);
    expect(screen.getByRole("status")).toHaveTextContent("3 options available");
  });

  it("calls onSearchChange while typing (server-side search)", async () => {
    const fn = vi.fn();
    render(<Combobox aria-label="Factor" options={factors} filter={false} onSearchChange={fn} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.keyboard("ga");
    expect(fn).toHaveBeenLastCalledWith("ga");
    expect(screen.getAllByRole("option")).toHaveLength(3); // not filtered locally
  });
});

describe("Combobox free-typed values", () => {
  it("discards unmatched text on blur by default", async () => {
    const fn = vi.fn();
    render(<Combobox aria-label="Factor" options={factors} defaultValue="iea-uk" onValueChange={fn} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{Control>}a{/Control}Biogas mix");
    await userEvent.tab();
    expect(fn).not.toHaveBeenCalled();
    expect(input).toHaveValue("UK grid electricity (IEA 2025)");
  });

  it("with allowCustomValue, commits typed text on Enter, on blur, and via the Use row", async () => {
    const fn = vi.fn();
    render(<Combobox aria-label="Factor" options={factors} allowCustomValue onValueChange={fn} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("Supplier EF 2026");
    expect(screen.getByRole("option", { name: "Use “Supplier EF 2026”" })).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    expect(fn).toHaveBeenLastCalledWith("Supplier EF 2026");
    expect(input).toHaveValue("Supplier EF 2026");

    await userEvent.clear(input);
    await userEvent.keyboard("Other EF");
    await userEvent.tab();
    expect(fn).toHaveBeenLastCalledWith("Other EF");

    await userEvent.clear(input);
    await userEvent.keyboard("Third EF");
    await userEvent.click(screen.getByRole("option", { name: /Use “Third EF”/ }));
    expect(fn).toHaveBeenLastCalledWith("Third EF");
  });

  it("with allowCustomValue, an exact label match selects the option and arrowing into a row still picks it", async () => {
    const fn = vi.fn();
    render(<Combobox aria-label="Factor" options={factors} allowCustomValue onValueChange={fn} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("diesel (defra 2025){Enter}");
    expect(fn).toHaveBeenLastCalledWith("defra-diesel");
    await userEvent.clear(input);
    await userEvent.keyboard("gas{ArrowDown}{Enter}");
    // gas matches "Natural gas", the Use row is second: ArrowDown from first row lands on it
    expect(fn).toHaveBeenLastCalledWith("gas");
  });
});

describe("Combobox state contract", () => {
  it("read-only keeps the value, never opens, and hides the clear button", async () => {
    render(<Field label="Factor" readOnly><Combobox options={factors} defaultValue="iea-uk" clearable /></Field>);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("readonly");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: /Clear/ })).toBeNull();
    expect(input).toHaveValue("UK grid electricity (IEA 2025)");
  });

  it("disabled and invalid reach the input", () => {
    render(<Field label="Factor" error="Choose a factor."><Combobox options={factors} disabled /></Field>);
    const input = screen.getByRole("combobox");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Choose a factor.");
  });

  it("has no axe violations closed or open", async () => {
    const { container } = render(<Field label="Emission factor"><Combobox options={factors} defaultValue="defra-gas" clearable /></Field>);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("combobox"));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
