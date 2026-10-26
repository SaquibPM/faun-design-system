import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { DataTable, type DataTableColumn } from "./DataTable.js";

type Row = { id: string; code: string; value: number; owner: string };
const make = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `r${i + 1}`, code: `E1-${String(i + 1).padStart(4, "0")}`, value: (i * 37) % 1000, owner: ["Priya", "Marcus", "Aiko"][i % 3]! }));
const columns: DataTableColumn<Row>[] = [
  { id: "code", header: "Datapoint", accessor: "code", sortable: true, rowHeader: true, hideable: false },
  { id: "value", header: "Value (tCO₂e)", label: "Value", accessor: "value", numeric: true, sortable: true },
  { id: "owner", header: "Owner", accessor: "owner" },
];
const codes = () => screen.getAllByRole("rowheader").map((c) => c.textContent);
const base = { label: "Datapoints", columns, getRowId: (r: Row) => r.id, getRowLabel: (r: Row) => r.code };
const table = (props: Partial<Parameters<typeof DataTable<Row>>[0]> & { data: Row[] }) => <DataTable<Row> {...base} {...props} />;

describe("DataTable pagination", () => {
  it("pages client-side with the Pagination component, after sorting", async () => {
    const { container } = render(table({ data: make(60), paginated: true, defaultSort: { columnId: "value", direction: "descending" } }));
    expect(screen.getAllByRole("row")).toHaveLength(26);
    expect(screen.getByRole("navigation", { name: "Datapoints pagination" })).toHaveTextContent("Showing 1–25 of 60");
    const firstPage = codes();
    await userEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByRole("navigation", { name: "Datapoints pagination" })).toHaveTextContent("Showing 26–50 of 60");
    expect(codes()).not.toEqual(firstPage);
    expect(screen.getByRole("status")).toHaveTextContent("Page 2 of 3, rows 26 to 50 of 60");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("supports page size options and goes back to page 1", async () => {
    render(table({ data: make(60), paginated: true, pageSizeOptions: [10, 25], defaultPage: 2 }));
    expect(screen.getAllByRole("row")).toHaveLength(11);
    expect(screen.getByRole("navigation")).toHaveTextContent("Showing 11–20 of 60");
  });

  it("is controlled for the server: shows rows as given, reports page changes, sets aria-rowcount and absolute aria-rowindex", async () => {
    const onPageChange = vi.fn();
    render(table({ data: make(10).map((r, i) => ({ ...r, id: `p${i}` })), totalRows: 1034, pageSize: 10, page: 4, onPageChange }));
    expect(screen.getAllByRole("row")).toHaveLength(11);
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "1035");
    const rows = screen.getAllByRole("row");
    expect(rows[0]).toHaveAttribute("aria-rowindex", "1");
    expect(rows[1]).toHaveAttribute("aria-rowindex", "32");
    expect(screen.getByRole("navigation")).toHaveTextContent("Showing 31–40 of 1,034");
    await userEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(5);
    expect(screen.getAllByRole("row")[1]).toHaveAttribute("aria-rowindex", "32");
  });

  it("keeps selection across pages and says how many are selected", async () => {
    render(table({ data: make(40), paginated: true, selectable: true }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(screen.getByText("25 selected")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByRole("checkbox", { name: "Select all rows on this page" })).toHaveAttribute("aria-checked", "false");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select E1-0026" }));
    expect(screen.getByText("26 selected")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("does not render pagination unless asked or when empty", () => {
    const { rerender } = render(table({ data: make(60) }));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    rerender(table({ data: [], paginated: true }));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("DataTable expandable rows", () => {
  const props = { data: make(3), renderExpanded: (r: Row) => <p>Evidence for {r.code}</p> };

  it("toggles details with a button that has aria-expanded and aria-controls", async () => {
    const { container } = render(table(props));
    const btn = screen.getByRole("button", { name: "Expand details for E1-0001" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Evidence for E1-0001")).not.toBeInTheDocument();
    await userEvent.click(btn);
    expect(screen.getByRole("button", { name: "Collapse details for E1-0001" })).toHaveAttribute("aria-expanded", "true");
    const group = screen.getByRole("group", { name: "Details for E1-0001" });
    expect(group).toHaveTextContent("Evidence for E1-0001");
    expect(screen.getByRole("button", { name: "Collapse details for E1-0001" })).toHaveAttribute("aria-controls", group.id);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Collapse details for E1-0001" }));
    expect(screen.queryByText("Evidence for E1-0001")).not.toBeInTheDocument();
  });

  it("works from the keyboard: Enter, Space, and Arrow Right / Left on the roving stop", async () => {
    render(table(props));
    const first = screen.getByRole("button", { name: /details for E1-0001/ });
    expect(first).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: /details for E1-0002/ })).toHaveAttribute("tabindex", "-1");
    act(() => first.focus());
    expect(first).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(first).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    expect(first).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowRight}");
    expect(first).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowLeft}");
    expect(first).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /details for E1-0002/ })).toHaveFocus();
  });

  it("can be controlled, limited per row, and the detail spans every column", async () => {
    const onChange = vi.fn();
    render(table({ ...props, isRowExpandable: (r) => r.id !== "r2", expandedIds: ["r3"], onExpandedIdsChange: onChange }));
    expect(screen.getAllByRole("button", { name: /details for/ })).toHaveLength(2);
    expect(screen.getByText("Evidence for E1-0003").closest("td")).toHaveAttribute("colspan", "4");
    await userEvent.click(screen.getByRole("button", { name: "Expand details for E1-0001" }));
    expect(onChange).toHaveBeenCalledWith(["r3", "r1"]);
  });
});

describe("DataTable column menu", () => {
  it("hides and shows columns, keeps one visible and never offers non-hideable columns", async () => {
    render(table({ data: make(3), columnMenu: true }));
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getAllByRole("menuitemcheckbox").map((i) => i.textContent)).toEqual(["Value", "Owner"]);
    await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "Owner" }));
    expect(screen.queryByRole("columnheader", { name: "Owner", hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole("menu")).toBeInTheDocument(); // stays open for several changes
    await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "Value" }));
    const heads = screen.getAllByRole("columnheader", { hidden: true });
    expect(heads).toHaveLength(1);
    expect(heads[0]).toHaveTextContent("Datapoint");
    expect(within(menu).getByRole("menuitemcheckbox", { name: "Owner" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Columns (1 of 3)" })).toBeInTheDocument();
  });

  it("is controlled and the sorted hidden column still sorts", async () => {
    function C() {
      const [h, setH] = useState<string[]>(["owner"]);
      return table({ data: make(3), columnMenu: true, hiddenColumns: h, onHiddenColumnsChange: setH });
    }
    render(<C />);
    expect(screen.queryByRole("columnheader", { name: "Owner" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Columns/ }));
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Owner" }));
    expect(screen.getByRole("columnheader", { name: "Owner", hidden: true })).toBeInTheDocument();
  });

  it("has no menu when nothing can be hidden", () => {
    render(table({ data: make(3), columnMenu: true, columns: [columns[0]!] }));
    expect(screen.queryByRole("button", { name: /Columns/ })).not.toBeInTheDocument();
  });
});

describe("DataTable virtualisation", () => {
  const data = make(5000);
  it("renders only a window of rows but reports the full size", async () => {
    const { container } = render(table({ data, virtualize: true, maxHeight: "20rem" }));
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeLessThan(40);
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "5001");
    expect(rows[0]).toHaveAttribute("aria-rowindex", "1");
    expect(rows[1]).toHaveAttribute("aria-rowindex", "2");
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(container.querySelector(".faun-data-table")).toHaveAttribute("data-sticky");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("renders further rows on scroll with their absolute aria-rowindex", () => {
    const { container } = render(table({ data, virtualize: true, maxHeight: "20rem" }));
    const scroller = container.querySelector<HTMLElement>(".faun-data-table-scroll")!;
    act(() => { scroller.scrollTop = 40 * 2000; scroller.dispatchEvent(new Event("scroll", { bubbles: true })); });
    const rowheaders = screen.getAllByRole("rowheader").map((c) => c.textContent);
    expect(rowheaders).toContain("E1-2001");
    expect(rowheaders).not.toContain("E1-0001");
    const row = screen.getByRole("rowheader", { name: "E1-2001" }).closest("tr")!;
    expect(row).toHaveAttribute("aria-rowindex", "2002");
  });

  it("keeps keyboard navigation to rows outside the window (End, Home, PageDown)", async () => {
    render(table({ data, virtualize: true, maxHeight: "20rem", selectable: true }));
    expect(screen.getByRole("checkbox", { name: "Select E1-0001" })).toHaveAttribute("tabindex", "0");
    act(() => screen.getByRole("checkbox", { name: "Select E1-0001" }).focus());
    expect(screen.getByRole("checkbox", { name: "Select E1-0001" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("checkbox", { name: "Select E1-5000" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("checkbox", { name: "Select E1-4999" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("checkbox", { name: "Select E1-0001" })).toHaveFocus();
    await userEvent.keyboard("{PageDown}");
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute("aria-label")).not.toBe("Select E1-0001");
    expect(focused.getAttribute("aria-label")).toMatch(/^Select E1-/);
  });

  it("falls back with a warning when combined with pagination", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(table({ data: make(100), virtualize: true, paginated: true }));
    expect(screen.getAllByRole("row")).toHaveLength(26);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
