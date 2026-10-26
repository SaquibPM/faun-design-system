import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { FilterBar, type FilterField, type FilterValue } from "./FilterBar.js";

const fields: FilterField[] = [
  { id: "scope", label: "Scope", options: [{ value: "1", label: "Scope 1" }, { value: "2", label: "Scope 2" }] },
  { id: "quality", label: "Data quality", options: [{ value: "estimated", label: "Estimated" }, { value: "missing", label: "Missing" }] },
];

describe("FilterBar", () => {
  it("renders applied filters as chips with remove buttons, ignoring unknown filters", async () => {
    const { container } = render(<FilterBar fields={fields} defaultValue={[{ field: "scope", value: "1" }, { field: "nope", value: "x" }]} />);
    const group = screen.getByRole("group", { name: "Filters" });
    expect(within(group).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Remove filter Scope: Scope 1" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 filter applied");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("removes a chip and clears all", async () => {
    const onValueChange = vi.fn();
    render(<FilterBar fields={fields} defaultValue={[{ field: "scope", value: "1" }, { field: "quality", value: "missing" }]} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove filter Scope: Scope 1" }));
    expect(onValueChange).toHaveBeenLastCalledWith([{ field: "quality", value: "missing" }]);
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No filters applied");
  });

  it("adds a filter from the menu and shows it checked afterwards", async () => {
    const onValueChange = vi.fn();
    render(<FilterBar fields={fields} onValueChange={onValueChange} />);
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Add filter" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Scope" }));
    const option = await screen.findByRole("menuitemcheckbox", { name: "Scope 2" });
    expect(option).toHaveAttribute("aria-checked", "false");
    await userEvent.click(option);
    expect(onValueChange).toHaveBeenLastCalledWith([{ field: "scope", value: "2" }]);
    // The open menu hides the rest of the page from assistive technology, so query it explicitly.
    expect(screen.getByRole("button", { name: "Remove filter Scope: Scope 2", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("menuitemcheckbox", { name: "Scope 2" })).toHaveAttribute("aria-checked", "true");
  });

  it("works controlled and keeps several values of one field", async () => {
    function Controlled() {
      const [v, setV] = useState<FilterValue[]>([{ field: "scope", value: "1" }]);
      return <><FilterBar fields={fields} value={v} onValueChange={setV} /><output>{v.length}</output></>;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Add filter" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Scope" }));
    await userEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Scope 2" }));
    expect(screen.getByText("2", { selector: "output" })).toBeInTheDocument();
  });

  it("uses custom labels and renders extra controls", () => {
    render(<FilterBar fields={fields} label="Datapoint filters" addLabel="Filter by"><input aria-label="Search" /></FilterBar>);
    expect(screen.getByRole("group", { name: "Datapoint filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument();
  });
});
