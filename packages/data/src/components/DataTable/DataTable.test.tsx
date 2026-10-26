import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { DataTable, type DataTableColumn } from "./DataTable.js";

type Row = { id: string; code: string; value: number | null; owner: string };
const data: Row[] = [
  { id: "a", code: "E1-6.44", value: 18240, owner: "Priya" },
  { id: "b", code: "E1-6.49", value: 9310, owner: "Marcus" },
  { id: "c", code: "E1-5.38", value: null, owner: "Aiko" },
  { id: "d", code: "E1-6.52", value: 96400, owner: "Aiko" },
];
const columns: DataTableColumn<Row>[] = [
  { id: "code", header: "Datapoint", accessor: "code", sortable: true, rowHeader: true },
  { id: "value", header: "Value (tCO₂e)", label: "Value", accessor: "value", numeric: true, sortable: true, cell: (r) => (r.value === null ? null : r.value.toLocaleString("en-US")) },
  { id: "owner", header: "Owner", accessor: "owner" },
];
const codes = () => screen.getAllByRole("rowheader").map((c) => c.textContent);

function renderTable(props: Partial<Parameters<typeof DataTable<Row>>[0]> = {}) {
  return render(<DataTable<Row> label="Datapoints" columns={columns} data={data} getRowId={(r) => r.id} {...props} />);
}

describe("DataTable", () => {
  it("renders a named table with headers and rows, and has no axe violations", async () => {
    const { container } = renderTable({ selectable: true });
    expect(screen.getByRole("table", { name: "Datapoints" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(screen.getAllByRole("row")).toHaveLength(5);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("right-aligns numeric columns and shows a dash with a spoken label for empty values", () => {
    renderTable();
    const valueCells = screen.getAllByRole("cell").filter((c) => c.hasAttribute("data-numeric"));
    expect(valueCells).toHaveLength(4);
    expect(screen.getByRole("columnheader", { name: /Value/ })).toHaveAttribute("data-numeric");
    expect(screen.getByText("No value")).toBeInTheDocument();
  });

  it("sorts ascending, descending, then clears, with empty values last", async () => {
    renderTable();
    const header = screen.getByRole("columnheader", { name: /Value/ });
    expect(header).toHaveAttribute("aria-sort", "none");
    await userEvent.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(codes()).toEqual(["E1-6.49", "E1-6.44", "E1-6.52", "E1-5.38"]);
    await userEvent.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(codes()).toEqual(["E1-6.52", "E1-6.44", "E1-6.49", "E1-5.38"]);
    await userEvent.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(codes()).toEqual(["E1-6.44", "E1-6.49", "E1-5.38", "E1-6.52"]);
  });

  it("sorts text naturally (numeric-aware)", async () => {
    renderTable({ defaultSort: { columnId: "code", direction: "ascending" } });
    expect(codes()).toEqual(["E1-5.38", "E1-6.44", "E1-6.49", "E1-6.52"]);
  });

  it("supports controlled and manual sorting", async () => {
    const onSortChange = vi.fn();
    renderTable({ sort: { columnId: "value", direction: "descending" }, manualSort: true, onSortChange });
    expect(codes()).toEqual(["E1-6.44", "E1-6.49", "E1-5.38", "E1-6.52"]);
    expect(screen.getByRole("columnheader", { name: /Value/ })).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(within(screen.getByRole("columnheader", { name: /Value/ })).getByRole("button"));
    expect(onSortChange).toHaveBeenCalledWith(null);
  });

  it("selects rows, all rows and shows the selection bar with actions", async () => {
    const onSelectedIdsChange = vi.fn();
    renderTable({ selectable: true, onSelectedIdsChange, getRowLabel: (r) => r.code, selectionActions: <button type="button">Request evidence</button> });
    const all = screen.getByRole("checkbox", { name: "Select all rows" });
    await userEvent.click(screen.getByRole("checkbox", { name: "Select E1-6.49" }));
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(["b"]);
    expect(all).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request evidence" })).toBeInTheDocument();
    await userEvent.click(all);
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(["b", "a", "c", "d"]);
    expect(all).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByText(/selected$/)).not.toBeInTheDocument();
  });

  it("marks selected rows", () => {
    renderTable({ selectable: true, defaultSelectedIds: ["a"] });
    expect(screen.getByRole("checkbox", { name: "Select a" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByRole("row")[1]).toHaveAttribute("data-selected");
  });

  it("moves between rows with the arrow keys using a roving tab stop", async () => {
    renderTable({ selectable: true, getRowLabel: (r) => r.code });
    const boxes = screen.getAllByRole("checkbox").slice(1);
    expect(boxes.map((b) => b.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1"]);
    boxes[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(boxes[1]).toHaveFocus();
    expect(boxes[1]).toHaveAttribute("tabindex", "0");
    await userEvent.keyboard("{End}");
    expect(boxes[3]).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{Home}");
    expect(boxes[0]).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
  });

  it("activates a row with Enter or click when onRowActivate is set", async () => {
    const onRowActivate = vi.fn();
    renderTable({ onRowActivate });
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveAttribute("tabindex", "0");
    expect(rows[1]).toHaveAttribute("tabindex", "-1");
    rows[0]!.focus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onRowActivate).toHaveBeenLastCalledWith(data[1], 1);
    await userEvent.click(rows[3]!);
    expect(onRowActivate).toHaveBeenLastCalledWith(data[3], 3);
  });

  it("keeps the header sticky, applies a density and a max height", () => {
    const { container } = renderTable({ stickyHeader: true, maxHeight: "12rem", density: "compact" });
    expect(container.firstElementChild).toHaveAttribute("data-sticky");
    expect(container.firstElementChild).toHaveAttribute("data-faun-density", "compact");
    expect(screen.getByRole("region", { name: "Datapoints, scrollable" }).style.maxBlockSize).toBe("12rem");
  });

  it("resizes columns with the keyboard", async () => {
    renderTable({ resizableColumns: true });
    const handle = screen.getByRole("separator", { name: "Resize Value column" });
    expect(handle).toHaveAttribute("aria-valuenow", "160");
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(handle).toHaveAttribute("aria-valuenow", "176");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "144");
  });

  it("shows a loading state with skeleton rows and an announcement", async () => {
    const { container } = renderTable({ loading: true, loadingRows: 3, selectable: true });
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll("tr[data-loading]")).toHaveLength(3);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Datapoints");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("shows an empty state, custom or default", () => {
    const { rerender } = renderTable({ data: [] });
    expect(screen.getByRole("heading", { name: "Nothing to show" })).toBeInTheDocument();
    rerender(<DataTable<Row> label="Datapoints" columns={columns} data={[]} emptyState={<p>No datapoints yet</p>} />);
    expect(screen.getByText("No datapoints yet")).toBeInTheDocument();
  });

  it("shows an error state with retry", async () => {
    const onRetry = vi.fn();
    const { container } = renderTable({ error: { title: "Could not load", onRetry } });
    expect(screen.getByRole("heading", { name: "Could not load" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
    expect(await axeViolations(container)).toEqual([]);
  });
});
