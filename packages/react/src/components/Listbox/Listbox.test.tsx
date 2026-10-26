import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { groupOptions, OptionContent, type ListOption } from "./listbox.js";

const options: ListOption[] = [
  { value: "gas", label: "Natural gas", group: "Fuels" },
  { value: "grid", label: "Grid electricity", group: "Electricity" },
  { value: "diesel", label: "Diesel", group: "Fuels" },
  { value: "other", label: "Other" },
];

describe("Listbox helpers (internal, shared by Select, Combobox and MultiSelect)", () => {
  it("groups options by key, keeping first-seen order and ungrouped options", () => {
    const groups = groupOptions(options);
    expect(groups.map(([g]) => g)).toEqual(["Fuels", "Electricity", undefined]);
    expect(groups[0]![1].map((o) => o.value)).toEqual(["gas", "diesel"]);
  });
  it("renders label, description, icon and selection check", () => {
    const { container } = render(<OptionContent option={{ label: "UK grid", description: "0.21 kgCO₂e/kWh", icon: <svg data-testid="icon" /> }} selected />);
    expect(screen.getByText("UK grid")).toBeInTheDocument();
    expect(screen.getByText("0.21 kgCO₂e/kWh")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(container.querySelector(".faun-listbox-option-check")).toBeInTheDocument();
  });
  it("replaces the icon and omits the check when an indicator is given", () => {
    const { container } = render(<OptionContent option={{ label: "Scope 3" }} selected indicator={<span data-testid="box" />} />);
    expect(screen.getByTestId("box")).toBeInTheDocument();
    expect(container.querySelector(".faun-listbox-option-check")).toBeNull();
  });
});
