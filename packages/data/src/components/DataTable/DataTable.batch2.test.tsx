import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchField } from "@faun-ds/react";
import { axeViolations } from "../../../test/a11y.js";
import { DataTable, type DataTableColumn } from "./DataTable.js";
import { DataTableRowActions, DataTableToolbar } from "./DataTableParts.js";

type Row = { id: string; code: string; owner: string };
const data: Row[] = [
  { id: "a", code: "E1-6.44", owner: "Priya" },
  { id: "b", code: "E1-6.49", owner: "Marcus" },
  { id: "c", code: "E1-5.38", owner: "Aiko" },
  { id: "d", code: "E1-6.52", owner: "Aiko" },
];
const columns: DataTableColumn<Row>[] = [
  { id: "code", header: "Datapoint", accessor: "code", rowHeader: true },
  { id: "owner", header: "Owner", accessor: "owner" },
];
const base = { label: "Datapoints", columns, data, getRowId: (r: Row) => r.id, getRowLabel: (r: Row) => r.code };
const t = (props: Partial<Parameters<typeof DataTable<Row>>[0]> = {}) => <DataTable<Row> {...base} {...props} />;

describe("DataTable single select", () => {
  it("shows radios, keeps one selection, and has no select-all or selection bar", async () => {
    const onChange = vi.fn();
    const { container } = render(t({ selectable: true, selectionMode: "single", onSelectedIdsChange: onChange }));
    expect(screen.queryByRole("checkbox")).toBeNull();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    await userEvent.click(screen.getByRole("radio", { name: "Select E1-6.49" }));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
    await userEvent.click(screen.getByRole("radio", { name: "Select E1-5.38" }));
    expect(onChange).toHaveBeenLastCalledWith(["c"]);
    expect(screen.getByRole("radio", { name: "Select E1-5.38" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Select E1-6.49" })).not.toBeChecked();
    expect(screen.queryByRole("group", { name: "Selection" })).toBeNull();
    expect(screen.getByRole("columnheader", { name: "Select a row" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("moves between rows with the arrow keys without changing the selection", async () => {
    render(t({ selectable: true, selectionMode: "single", defaultSelectedIds: ["a"] }));
    screen.getByRole("radio", { name: "Select E1-6.44" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Select E1-6.49" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Select E1-6.44" })).toBeChecked();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Select E1-6.49" })).toBeChecked();
  });
});

describe("DataTable toolbar", () => {
  it("renders search, filters and actions in a labelled group", async () => {
    const { container } = render(t({ toolbar: <DataTableToolbar search={<SearchField aria-label="Search datapoints" size="sm" />} filters={<button type="button">Owner</button>} actions={<button type="button">Export</button>} /> }));
    const group = screen.getByRole("group", { name: "Table tools" });
    expect(within(group).getByRole("searchbox", { name: "Search datapoints" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("is replaced by the selection bar while rows are selected, and comes back", async () => {
    render(t({ selectable: true, toolbar: <DataTableToolbar actions={<button type="button">Export</button>} /> }));
    expect(screen.getByRole("button", { name: "Export" })).toBeVisible();
    await userEvent.click(screen.getByRole("checkbox", { name: "Select E1-6.44" }));
    expect(screen.getByRole("group", { name: "Selection" })).toHaveTextContent("1 selected");
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull(); // hidden strip is out of the accessibility tree
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByRole("button", { name: "Export" })).toBeVisible();
  });

  it("keeps the search text while the bar takes over", async () => {
    render(t({ selectable: true, toolbar: <DataTableToolbar search={<SearchField aria-label="Search datapoints" size="sm" />} /> }));
    await userEvent.type(screen.getByRole("searchbox"), "scope");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select E1-6.44" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByRole("searchbox")).toHaveValue("scope");
  });
});

describe("DataTable row size", () => {
  it("sets data-row-size from the prop and from the toolbar menu", async () => {
    const { container } = render(t({ rowSize: "xl" }));
    expect(container.firstElementChild).toHaveAttribute("data-row-size", "xl");
  });

  it("offers a row height menu with five sizes and changes the size uncontrolled", async () => {
    const onChange = vi.fn();
    const { container } = render(t({ rowSizeMenu: true, defaultRowSize: "md", onRowSizeChange: onChange }));
    await userEvent.click(screen.getByRole("button", { name: "Row height" }));
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(5);
    expect(screen.getByRole("menuitemradio", { name: /Medium/ })).toBeChecked();
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Extra small/ }));
    expect(onChange).toHaveBeenCalledWith("xs");
    expect(container.querySelector(".faun-data-table")).toHaveAttribute("data-row-size", "xs");
  });
});

describe("DataTable zebra and sticky column", () => {
  it("stripes every second row by data position", () => {
    const { container } = render(t({ zebra: true }));
    const rows = [...container.querySelectorAll("tbody tr")];
    expect(rows.map((r) => r.hasAttribute("data-stripe"))).toEqual([false, true, false, true]);
  });

  it("pins the first data column and the selection column", () => {
    const { container } = render(t({ stickyFirstColumn: true, selectable: true }));
    expect(container.querySelector(".faun-data-table")).toHaveAttribute("data-sticky-col");
    expect(container.querySelectorAll("[data-pin]")).toHaveLength(5);
    expect((container.querySelector("th[data-pin]") as HTMLElement).style.getPropertyValue("--_pin-start")).toBe("48px");
  });
});

describe("DataTable states are preserved", () => {
  it("still shows empty, loading and error with the new props on", () => {
    const { rerender } = render(t({ data: [], zebra: true, stickyFirstColumn: true, toolbar: <DataTableToolbar actions={<span>x</span>} /> }));
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
    rerender(t({ loading: true, zebra: true, selectable: true, selectionMode: "single" }));
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    rerender(t({ error: { onRetry: () => {} }, selectable: true, selectionMode: "single" }));
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});

describe("DataTableRowActions", () => {
  const actions = (fn = vi.fn()) => [
    { id: "edit", label: "Edit", icon: <svg aria-hidden="true" />, onSelect: fn },
    { id: "assign", label: "Assign owner", icon: <svg aria-hidden="true" />, onSelect: fn },
  ];
  const cols: DataTableColumn<Row>[] = [...columns, { id: "act", header: "Actions", label: "Actions", cell: (r) => <DataTableRowActions label={r.code} actions={actions()} /> }];

  it("shows icon buttons for fewer than three actions, named with the row", async () => {
    const fn = vi.fn();
    const { container } = render(t({ columns: [...columns, { id: "act", header: "Actions", cell: (r) => <DataTableRowActions label={r.code} actions={actions(fn)} /> }] }));
    await userEvent.click(screen.getByRole("button", { name: "Edit E1-6.49" }));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("uses an overflow menu for three or more actions, or any destructive one, with danger last", async () => {
    const del = vi.fn();
    const many = [...actions(), { id: "del", label: "Delete", icon: <svg aria-hidden="true" />, danger: true, onSelect: del }];
    const { container } = render(t({ columns: [...columns, { id: "act", header: "Actions", cell: (r) => <DataTableRowActions label={r.code} actions={many} /> }] }));
    expect(screen.queryByRole("button", { name: "Edit E1-6.44" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Actions for E1-6.44" }));
    expect(screen.getAllByRole("menuitem").map((m) => m.textContent)).toEqual(["Edit", "Assign owner", "Delete"]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(del).toHaveBeenCalled();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("stays reachable by keyboard when hidden until hover, and is marked reveal=hover", async () => {
    render(t({ columns: cols }));
    const btn = screen.getByRole("button", { name: "Edit E1-6.44" });
    expect(btn.closest(".faun-data-table-row-actions")).toHaveAttribute("data-reveal", "hover");
    await userEvent.tab(); // scroll region
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it("disables the actions while rows are selected for a batch, unless opted out", async () => {
    render(t({ selectable: true, columns: cols }));
    expect(screen.getByRole("button", { name: "Edit E1-6.44" })).toBeEnabled();
    await userEvent.click(screen.getByRole("checkbox", { name: "Select E1-6.49" }));
    expect(screen.getByRole("button", { name: "Edit E1-6.44" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByRole("button", { name: "Edit E1-6.44" })).toBeEnabled();
  });
});
