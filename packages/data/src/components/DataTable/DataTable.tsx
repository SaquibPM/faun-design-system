import { IconArrowDown, IconArrowUp, IconChevronRight, IconChevronsUpDown, IconColumns } from "@faun-ds/icons";
import {
  Button, Checkbox, cx, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, EmptyState, Pagination,
  Skeleton, useControllableState, VisuallyHidden,
} from "@faun-ds/react";
import {
  Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactElement, type ReactNode, type Ref,
} from "react";
import { forwardRef } from "react";
import { DataTableContext, RowSizeMenu, type DataTableRowSize } from "./DataTableParts";

export type SortDirection = "ascending" | "descending";

export interface DataTableSort {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Stable id. Used for sorting, resizing and as the React key. */
  id: string;
  /** Column header content. */
  header: ReactNode;
  /** Plain-text name for assistive technology (sort and resize controls). Defaults to `header` when it is a string. */
  label?: string;
  /** Key of the row, or a function, that supplies the cell value when there is no `cell` renderer. */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom cell renderer. */
  cell?: (row: T, index: number) => ReactNode;
  /** Right-aligned with tabular figures. Use for every column of numbers, including units in the header. */
  numeric?: boolean;
  /** Shows a sort button in the header. */
  sortable?: boolean;
  /** Value to sort by when it differs from the displayed value (for example a number behind a formatted string). */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Initial width in px when columns are resizable. */
  width?: number;
  /** Smallest width in px when resizing. Default 96. */
  minWidth?: number;
  /** Lets people hide this column from the column menu (when `columnMenu` is on). Default true. Set false for the column that names the row. */
  hideable?: boolean;
  /** Renders the cell as a row header (`th scope="row"`). Use for the column that names the row. */
  rowHeader?: boolean;
}

export interface DataTableError {
  title?: string;
  description?: ReactNode;
  /** Shows a "Try again" button. */
  onRetry?: () => void;
}

export interface DataTableProps<T> {
  /** Accessible name for the table. Required. */
  label: string;
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable id per row. Required for selection. Defaults to the row index. */
  getRowId?: (row: T, index: number) => string;
  /** Plain-text name for a row, used in the selection checkbox label. Defaults to the row id. */
  getRowLabel?: (row: T, index: number) => string;
  /** Controlled sort. `null` means unsorted. */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Sorting is done by the server: rows are shown in the order given. */
  manualSort?: boolean;
  /** Adds a selection column: checkboxes, or radios when `selectionMode="single"`. */
  selectable?: boolean;
  /**
   * `multiple` (default) shows checkboxes, a select-all header and the selection bar. `single` shows radio buttons: choosing a row clears the previous one,
   * `selectedIds` holds at most one id, and there is no selection bar.
   */
  selectionMode?: "multiple" | "single";
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  /** Shown next to the selection count when rows are selected (bulk actions). */
  selectionActions?: ReactNode;
  /** Makes rows focusable and calls this on Enter or row click. */
  onRowActivate?: (row: T, index: number) => void;
  /** Keeps the header visible while the body scrolls. Set `maxHeight` too. */
  stickyHeader?: boolean;
  /** Maximum height of the scroll area as a CSS length, for example `"24rem"`. */
  maxHeight?: string;
  /** Overrides the surrounding density for this table. */
  density?: "compact" | "comfortable" | "spacious";
  /**
   * Row height in five steps: `xs` 24, `sm` 32, `md` 40, `lg` 48, `xl` 64 px. Overrides the height `density` gives. Unset: rows follow density.
   * Controlled.
   */
  rowSize?: DataTableRowSize;
  defaultRowSize?: DataTableRowSize;
  onRowSizeChange?: (size: DataTableRowSize) => void;
  /** Adds a "Row height" menu to the toolbar so people can pick a size. Shows the toolbar strip even without a `toolbar`. */
  rowSizeMenu?: boolean;
  /** Alternating row background. Stripes follow the row's position in the data, not in the page. */
  zebra?: boolean;
  /** Keeps the selection column and the first data column in view while the table scrolls sideways. Needs a table wider than its container. */
  stickyFirstColumn?: boolean;
  /**
   * Content of the toolbar strip above the rows. Build it with `DataTableToolbar` (search, filters, actions) or pass your own parts.
   * While rows are selected in multiple mode, the selection bar replaces the toolbar.
   */
  toolbar?: ReactNode;
  /** Lets people drag header edges (or use arrow keys on the handle) to change column widths. */
  resizableColumns?: boolean;
  /** Adds a "Columns" menu above the table for showing and hiding columns. At least one column always stays visible. */
  columnMenu?: boolean;
  /** Ids of hidden columns (controlled). */
  hiddenColumns?: string[];
  /** Ids of columns hidden at first (uncontrolled). */
  defaultHiddenColumns?: string[];
  onHiddenColumnsChange?: (ids: string[]) => void;
  /**
   * Shows rows in pages with the Pagination component. Client-side by default: all of `data` is passed in and the table slices it after sorting.
   * Pass `totalRows` for server-side paging.
   */
  paginated?: boolean;
  /**
   * Total number of rows on the server. When set, `data` holds only the current page, rows are shown as given, and you fetch the new page in `onPageChange`
   * (and set `manualSort` if the server sorts). Implies `paginated`.
   */
  totalRows?: number;
  /** Current page, 1-based (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page (controlled). Default 25, or the first of `pageSizeOptions`. */
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Offers a rows-per-page picker, for example `[25, 50, 100]`. */
  pageSizeOptions?: number[];
  /** Plural noun for the pagination summary. Default "rows". */
  itemLabel?: string;
  /**
   * Makes every row expandable: a toggle button in the first column reveals what this returns in a full-width row below.
   * Not available together with `virtualize`.
   */
  renderExpanded?: (row: T, index: number) => ReactNode;
  /** Limits which rows can expand. Default: all. */
  isRowExpandable?: (row: T) => boolean;
  /** Ids of expanded rows (controlled). */
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedIdsChange?: (ids: string[]) => void;
  /**
   * Renders only the rows in view, for tens of thousands of rows. Needs `maxHeight` so the table scrolls, and a fixed row height (the first row is measured, so density is respected).
   * Keyboard navigation still reaches every row, and `aria-rowcount` and `aria-rowindex` keep the full size known to assistive technology.
   * Cell content must not wrap. Combine with sticky header (switched on automatically); not with pagination or expandable rows.
   */
  virtualize?: boolean;
  /** Rows drawn above and below the visible window when virtualised. Default 6. */
  overscan?: number;
  loading?: boolean;
  /** Skeleton rows shown while loading. Default 5. */
  loadingRows?: number;
  /** Replaces the rows with an error state. */
  error?: DataTableError;
  /** Shown instead of rows when `data` is empty. */
  emptyState?: ReactNode;
  className?: string;
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function valueOf<T>(col: DataTableColumn<T>, row: T): unknown {
  if (col.sortValue) return col.sortValue(row);
  if (typeof col.accessor === "function") return col.accessor(row);
  if (col.accessor !== undefined) return row[col.accessor];
  return undefined;
}

function sortRows<T>(rows: T[], col: DataTableColumn<T>, direction: SortDirection): T[] {
  const sign = direction === "ascending" ? 1 : -1;
  return rows
    .map((row, i) => ({ row, i, v: valueOf(col, row) as string | number | null | undefined }))
    .sort((a, b) => {
      const an = a.v == null || a.v === "";
      const bn = b.v == null || b.v === "";
      if (an || bn) return an === bn ? a.i - b.i : an ? 1 : -1; // empty values last, in both directions
      const c = typeof a.v === "number" && typeof b.v === "number" ? a.v - b.v : collator.compare(String(a.v), String(b.v));
      return c === 0 ? a.i - b.i : c * sign;
    })
    .map((x) => x.row);
}

const labelOf = <T,>(c: DataTableColumn<T>) => c.label ?? (typeof c.header === "string" ? c.header : c.id);
const SELECT_WIDTH = 48;
const RESIZE_STEP = 16;
const MAX_WIDTH = 640;

function DataTableInner<T>(
  {
    label, columns: allColumns, data, getRowId, getRowLabel, sort, defaultSort = null, onSortChange, manualSort, selectable, selectionMode = "multiple", selectedIds, defaultSelectedIds = [],
    onSelectedIdsChange, rowSize, defaultRowSize, onRowSizeChange, rowSizeMenu, zebra, stickyFirstColumn, toolbar, selectionActions, onRowActivate, stickyHeader, maxHeight, density, resizableColumns, loading, loadingRows = 5, error, emptyState, className,
    columnMenu, hiddenColumns, defaultHiddenColumns = [], onHiddenColumnsChange,
    paginated, totalRows, page, defaultPage = 1, onPageChange, pageSize, defaultPageSize, onPageSizeChange, pageSizeOptions, itemLabel = "rows",
    renderExpanded, isRowExpandable, expandedIds, defaultExpandedIds = [], onExpandedIdsChange, virtualize, overscan = 6,
  }: DataTableProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const [activeSort, setSort] = useControllableState<DataTableSort | null>({ value: sort, defaultValue: defaultSort, onChange: onSortChange });
  const [selected, setSelected] = useControllableState<string[]>({ value: selectedIds, defaultValue: defaultSelectedIds, onChange: onSelectedIdsChange });
  const [hidden, setHidden] = useControllableState<string[]>({ value: hiddenColumns, defaultValue: defaultHiddenColumns, onChange: onHiddenColumnsChange });
  const [expanded, setExpanded] = useControllableState<string[]>({ value: expandedIds, defaultValue: defaultExpandedIds, onChange: onExpandedIdsChange });
  const [pageNo, setPageNo] = useControllableState<number>({ value: page, defaultValue: defaultPage, onChange: onPageChange });
  const [size, setSize] = useControllableState<number>({ value: pageSize, defaultValue: defaultPageSize ?? pageSizeOptions?.[0] ?? 25, onChange: onPageSizeChange });
  const [activeRowSize, setRowSize] = useControllableState<DataTableRowSize | undefined>({ value: rowSize, defaultValue: defaultRowSize, onChange: (v) => v && onRowSizeChange?.(v) });
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [roving, setRoving] = useState(0);
  const [announce, setAnnounce] = useState("");
  const body = useRef<HTMLTableSectionElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<number | null>(null);
  const uid = useId();

  const server = totalRows !== undefined;
  const paging = !!paginated || server;
  const virtual = !!virtualize && !paging;
  const expandable = !!renderExpanded && !virtual;
  useEffect(() => {
    if (typeof console === "undefined") return;
    if (virtualize && paging) console.warn(`Faun DataTable "${label}": virtualize is ignored when the table is paginated.`);
    if (virtualize && renderExpanded) console.warn(`Faun DataTable "${label}": expandable rows are ignored when virtualize is on.`);
  }, [virtualize, paging, renderExpanded, label]);

  // Columns the person has not hidden. The last visible column cannot be hidden.
  const hiddenIds = new Set(hidden.filter((id) => allColumns.some((c) => c.id === id && c.hideable !== false)));
  const columns = allColumns.filter((c) => !hiddenIds.has(c.id));

  const idOf = (row: T, i: number) => (getRowId ? getRowId(row, i) : String(i));
  const sorted = useMemo(() => {
    const col = activeSort && !manualSort ? allColumns.find((c) => c.id === activeSort.columnId) : undefined;
    return col && activeSort ? sortRows(data, col, activeSort.direction) : data;
  }, [data, allColumns, activeSort, manualSort]);

  // Paging: client-side slices the sorted rows; server-side shows `data` as given.
  const total = server ? totalRows! : sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, pageNo), pageCount);
  const offset = paging ? (current - 1) * size : 0;
  const rows = useMemo(() => (paging && !server ? sorted.slice(offset, offset + size) : sorted), [paging, server, sorted, offset, size]);
  const allIds = sorted.map((r, i) => idOf(r, i));
  const ids = paging && !server ? allIds.slice(offset, offset + size) : allIds;
  const selectedSet = new Set(selected);
  const selectedCount = ids.filter((id) => selectedSet.has(id)).length;
  const allSelected = ids.length > 0 && selectedCount === ids.length;
  const showRows = !loading && !error && rows.length > 0;
  const expandedSet = new Set(expanded);
  const canExpand = (row: T) => expandable && (isRowExpandable ? isRowExpandable(row) : true);
  const interactiveRows = showRows && (selectable || !!onRowActivate || expandable);
  const focusIndex = Math.min(roving, Math.max(rows.length - 1, 0));

  // Virtual window. The row height is measured from the first rendered row so density tokens are respected.
  const [rowH, setRowH] = useState(40);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(0);
  const viewport = viewH || 400;
  useLayoutEffect(() => {
    if (!virtual) return;
    const el = scroller.current;
    if (!el) return;
    setViewH(el.clientHeight);
    const ro = new ResizeObserver(() => setViewH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [virtual]);
  useLayoutEffect(() => {
    if (!virtual) return;
    const first = body.current?.querySelector<HTMLElement>("tr[data-row-index]");
    const h = first?.getBoundingClientRect().height ?? 0;
    if (h > 0 && Math.abs(h - rowH) > 0.5) setRowH(h);
  });
  const winStart = virtual ? Math.max(0, Math.floor(scrollTop / rowH) - overscan) : 0;
  const winEnd = virtual ? Math.min(rows.length, Math.ceil((scrollTop + viewport) / rowH) + overscan) : rows.length;
  const tabStop = virtual ? Math.min(Math.max(focusIndex, winStart), Math.max(winEnd - 1, 0)) : focusIndex;
  const windowed = virtual ? rows.slice(winStart, winEnd) : rows;
  const labelRows = paging || virtual;
  const rowNumber = (i: number) => offset + i + 2; // header is row 1

  const cycleSort = (col: DataTableColumn<T>) => {
    const current = activeSort?.columnId === col.id ? activeSort.direction : null;
    setSort(current === null ? { columnId: col.id, direction: "ascending" } : current === "ascending" ? { columnId: col.id, direction: "descending" } : null);
  };
  const single = !!selectable && selectionMode === "single";
  const toggleRow = (id: string, on: boolean) => setSelected(single ? (on ? [id] : []) : on ? [...selected, id] : selected.filter((x) => x !== id));
  const toggleAll = (on: boolean) => setSelected(on ? Array.from(new Set([...selected, ...ids])) : selected.filter((x) => !ids.includes(x)));
  const setExpandedRow = (id: string, on: boolean) => setExpanded(on ? [...expanded.filter((x) => x !== id), id] : expanded.filter((x) => x !== id));
  const toggleColumn = (id: string, on: boolean) => {
    if (!on && columns.length === 1 && columns[0]!.id === id) return;
    setHidden(on ? hidden.filter((x) => x !== id) : [...hidden, id]);
  };
  const changePage = (p: number) => {
    setPageNo(p);
    setRoving(0);
    const from = (p - 1) * size + 1;
    setAnnounce(`Page ${p} of ${pageCount}, rows ${from} to ${Math.min(total, p * size)} of ${total}`);
  };
  const changeSize = (n: number) => {
    setSize(n);
    setPageNo(1);
    setRoving(0);
    setAnnounce(`${n} rows per page`);
  };

  const rowTarget = (i: number) => body.current?.querySelector<HTMLElement>(`tr[data-row-index="${i}"] [data-row-focus], tr[data-row-index="${i}"][data-row-focus]`) ?? null;
  const focusRow = (index: number) => {
    const i = Math.max(0, Math.min(rows.length - 1, index));
    setRoving(i);
    const el = rowTarget(i);
    if (el) { el.focus(); return; }
    if (virtual && scroller.current) {
      // The row is outside the window: scroll it into view and focus it once it has rendered.
      pendingFocus.current = i;
      const top = i * rowH;
      const el2 = scroller.current;
      if (top < el2.scrollTop) el2.scrollTop = top;
      else el2.scrollTop = top + rowH - Math.max(el2.clientHeight - headerH(), rowH);
      setScrollTop(el2.scrollTop);
    }
  };
  const headerH = () => scroller.current?.querySelector("thead")?.getBoundingClientRect().height ?? 0;
  useEffect(() => {
    if (pendingFocus.current === null) return;
    const el = rowTarget(pendingFocus.current);
    if (el) { el.focus(); pendingFocus.current = null; }
  });
  const onBodyKeyDown = (e: KeyboardEvent<HTMLTableSectionElement>) => {
    const target = e.target as HTMLElement;
    const row = target.closest("tr");
    const idx = Number(row?.getAttribute("data-row-index"));
    if (!target.hasAttribute("data-row-focus") || Number.isNaN(idx)) return;
    const page = Math.max(1, Math.floor(viewport / rowH) - 1);
    const move = e.key === "ArrowDown" ? idx + 1 : e.key === "ArrowUp" ? idx - 1 : e.key === "Home" ? 0 : e.key === "End" ? rows.length - 1
      : virtual && e.key === "PageDown" ? idx + page : virtual && e.key === "PageUp" ? idx - page : null;
    if (move !== null) { e.preventDefault(); focusRow(move); return; }
    const rowData = rows[idx];
    if (rowData !== undefined && canExpand(rowData) && (e.key === "ArrowRight" || e.key === "ArrowLeft") && target.tagName !== "INPUT") {
      const id = ids[idx]!;
      const open = expandedSet.has(id);
      if ((e.key === "ArrowRight" && !open) || (e.key === "ArrowLeft" && open)) { e.preventDefault(); setExpandedRow(id, !open); }
      return;
    }
    if (e.key === "Enter" && onRowActivate && target.tagName === "TR") { e.preventDefault(); onRowActivate(rows[idx]!, idx); }
  };

  const widthOf = (c: DataTableColumn<T>) => widths[c.id] ?? c.width ?? 160;
  const startResize = (e: ReactPointerEvent<HTMLElement>, c: DataTableColumn<T>) => {
    e.preventDefault();
    const startX = e.clientX;
    const start = widthOf(c);
    const el = e.currentTarget;
    el.setPointerCapture?.(e.pointerId);
    const rtl = getComputedStyle(el).direction === "rtl";
    const move = (ev: PointerEvent) => {
      const delta = (rtl ? -1 : 1) * (ev.clientX - startX);
      setWidths((w) => ({ ...w, [c.id]: Math.max(c.minWidth ?? 96, Math.min(MAX_WIDTH, start + delta)) }));
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onResizeKey = (e: KeyboardEvent<HTMLElement>, c: DataTableColumn<T>) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const step = e.shiftKey ? RESIZE_STEP * 4 : RESIZE_STEP;
    setWidths((w) => ({ ...w, [c.id]: Math.max(c.minWidth ?? 96, Math.min(MAX_WIDTH, widthOf(c) + dir * step)) }));
  };

  const colCount = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);
  const totalWidth = resizableColumns ? columns.reduce((n, c) => n + widthOf(c), (selectable ? SELECT_WIDTH : 0) + (expandable ? SELECT_WIDTH : 0)) : undefined;
  const statusMessage = loading ? `Loading ${label}` : error ? `${label} failed to load` : announce;
  const hideableCount = allColumns.filter((c) => c.hideable !== false).length;
  const hiddenCount = allColumns.length - columns.length;
  const barCount = single ? 0 : paging ? selected.length : selectedCount;
  const showTools = !!toolbar || !!rowSizeMenu;
  const leadWidth = (selectable ? SELECT_WIDTH : 0) + (expandable ? SELECT_WIDTH : 0);
  // The roving stop is the selection checkbox when rows are selectable, else the expand button, else the row itself.
  const pinStyle = { "--_pin-start": `${leadWidth}px` } as CSSProperties;
  const focusKind = selectable ? "checkbox" : expandable ? "expand" : onRowActivate ? "row" : null;

  return (
    <DataTableContext.Provider value={{ batch: barCount > 0 }}>
    <div
      ref={ref}
      className={cx("faun-data-table", className)}
      data-faun-density={density}
      data-row-size={activeRowSize}
      data-zebra={zebra || undefined}
      data-sticky-col={stickyFirstColumn || undefined}
      data-sticky={stickyHeader || virtual || undefined}
    >
      {showTools ? (
        <div className="faun-data-table-toolbar-strip" hidden={barCount > 0}>
          {toolbar}
          {rowSizeMenu ? <div className="faun-data-table-tools-end"><RowSizeMenu value={activeRowSize ?? "md"} onChange={setRowSize} /></div> : null}
        </div>
      ) : null}
      {columnMenu && hideableCount > 0 ? (
        <div className="faun-data-table-toolbar">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" leadingIcon={<IconColumns />}>{hiddenCount > 0 ? `Columns (${columns.length} of ${allColumns.length})` : "Columns"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" aria-label="Show or hide columns">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              {allColumns.filter((c) => c.hideable !== false).map((c) => {
                const on = !hiddenIds.has(c.id);
                return (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={on}
                    disabled={on && columns.length === 1}
                    onSelect={(e) => { e.preventDefault(); toggleColumn(c.id, !on); }}
                  >
                    {labelOf(c)}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
      {selectable && !single && barCount > 0 ? (
        <div className="faun-data-table-selection" role="group" aria-label="Selection">
          <span className="faun-data-table-selection-count" aria-live="polite">{barCount} selected</span>
          <Button size="sm" variant="ghost" onClick={() => (paging ? setSelected([]) : toggleAll(false))}>Clear selection</Button>
          {selectionActions ? <span className="faun-data-table-selection-actions">{selectionActions}</span> : null}
        </div>
      ) : null}
      <div
        ref={scroller}
        className="faun-data-table-scroll"
        role="region"
        aria-label={`${label}, scrollable`}
        tabIndex={0}
        data-virtual={virtual || undefined}
        style={maxHeight ? { maxBlockSize: maxHeight } : undefined}
        onScroll={virtual ? (e) => setScrollTop(e.currentTarget.scrollTop) : undefined}
      >
        <table
          className="faun-data-table-table"
          data-selection={selectable ? selectionMode : undefined}
          aria-label={label}
          aria-busy={loading || undefined}
          aria-rowcount={labelRows && showRows ? total + 1 : undefined}
          data-resizable={resizableColumns || undefined}
          data-virtual={virtual || undefined}
          style={totalWidth ? ({ "--_table-width": `${totalWidth}px` } as CSSProperties) : undefined}
        >
          {resizableColumns ? (
            <colgroup>
              {selectable ? <col style={{ inlineSize: SELECT_WIDTH }} /> : null}
              {expandable ? <col style={{ inlineSize: SELECT_WIDTH }} /> : null}
              {columns.map((c) => <col key={c.id} style={{ inlineSize: widthOf(c) }} />)}
            </colgroup>
          ) : null}
          <thead>
            <tr aria-rowindex={labelRows && showRows ? 1 : undefined}>
              {selectable ? (
                <th scope="col" className="faun-data-table-select">
                  {single ? (
                    <VisuallyHidden>Select a row</VisuallyHidden>
                  ) : (
                    <Checkbox
                      aria-label={paging ? "Select all rows on this page" : "Select all rows"}
                      size="sm"
                      disabled={!showRows}
                      checked={allSelected ? true : selectedCount > 0 ? "indeterminate" : false}
                      onCheckedChange={(c) => toggleAll(c === true)}
                    />
                  )}
                </th>
              ) : null}
              {expandable ? <th scope="col" className="faun-data-table-expand"><VisuallyHidden>Row details</VisuallyHidden></th> : null}
              {columns.map((c, ci) => {
                const dir = activeSort?.columnId === c.id ? activeSort.direction : undefined;
                const SortIcon = dir === "ascending" ? IconArrowUp : dir === "descending" ? IconArrowDown : IconChevronsUpDown;
                return (
                  <th key={c.id} scope="col" aria-sort={c.sortable ? (dir ?? "none") : undefined} data-numeric={c.numeric || undefined} data-sorted={dir ? "" : undefined} data-pin={stickyFirstColumn && ci === 0 ? "" : undefined} style={stickyFirstColumn && ci === 0 ? pinStyle : undefined}>
                    {c.sortable ? (
                      <button type="button" className="faun-data-table-sort" onClick={() => cycleSort(c)}>
                        <span>{c.header}</span>
                        <SortIcon size="sm" className="faun-data-table-sort-icon" />
                        <VisuallyHidden>{dir ? `, sorted ${dir}. Activate to ${dir === "ascending" ? "sort descending" : "clear sort"}` : ", not sorted. Activate to sort ascending"}</VisuallyHidden>
                      </button>
                    ) : (
                      <span className="faun-data-table-head">{c.header}</span>
                    )}
                    {resizableColumns ? (
                      <span
                        role="separator"
                        tabIndex={0}
                        aria-orientation="vertical"
                        aria-label={`Resize ${labelOf(c)} column`}
                        aria-valuenow={widthOf(c)}
                        aria-valuemin={c.minWidth ?? 96}
                        aria-valuemax={MAX_WIDTH}
                        className="faun-data-table-resizer"
                        onPointerDown={(e) => startResize(e, c)}
                        onKeyDown={(e) => onResizeKey(e, c)}
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody ref={body} onKeyDown={onBodyKeyDown}>
            {loading
              ? Array.from({ length: loadingRows }, (_, r) => (
                  <tr key={r} className="faun-data-table-row" data-loading="">
                    {Array.from({ length: colCount }, (_, k) => (
                      <td key={k}><Skeleton width={(selectable || expandable) && k === 0 ? "1rem" : `${50 + ((r * 7 + k * 13) % 40)}%`} /></td>
                    ))}
                  </tr>
                ))
              : error
                ? (
                  <tr><td colSpan={colCount} className="faun-data-table-message">
                    <EmptyState size="sm" kind="error" level={3} title={error.title ?? "Could not load this table"} description={error.description ?? "Check your connection and try again."}
                      action={error.onRetry ? <Button size="sm" onClick={error.onRetry}>Try again</Button> : undefined} />
                  </td></tr>
                )
                : rows.length === 0
                  ? (
                    <tr><td colSpan={colCount} className="faun-data-table-message">
                      {emptyState ?? <EmptyState size="sm" kind="no-results" level={3} title="Nothing to show" description="No rows match the current view." />}
                    </td></tr>
                  )
                  : (
                    <>
                      {virtual && winStart > 0 ? <tr aria-hidden="true" className="faun-data-table-spacer"><td colSpan={colCount} style={{ blockSize: winStart * rowH }} /></tr> : null}
                      {windowed.map((row, w) => {
                        const i = winStart + w;
                        const id = ids[i]!;
                        const isSelected = selectedSet.has(id);
                        const rowLabel = getRowLabel ? getRowLabel(row, i) : id;
                        const tabIndex = interactiveRows ? (i === tabStop ? 0 : -1) : undefined;
                        const open = canExpand(row) && expandedSet.has(id);
                        const detailId = `${uid}-detail-${i}`;
                        return (
                          <Fragment key={id}>
                            <tr
                              className="faun-data-table-row"
                              data-row-index={i}
                              aria-rowindex={labelRows ? rowNumber(i) : undefined}
                              data-selected={isSelected ? "" : undefined}
                              data-stripe={zebra && i % 2 === 1 ? "" : undefined}
                              data-expanded={open ? "" : undefined}
                              data-interactive={onRowActivate ? "" : undefined}
                              data-row-focus={focusKind === "row" ? "" : undefined}
                              tabIndex={focusKind === "row" ? tabIndex : undefined}
                              onFocus={() => setRoving(i)}
                              onClick={onRowActivate ? (e) => { if (!(e.target as HTMLElement).closest("button, a, input, [role=checkbox]")) onRowActivate(row, i); } : undefined}
                            >
                              {selectable ? (
                                <td className="faun-data-table-select">
                                  {single ? (
                                    <input
                                      type="radio"
                                      name={`${uid}-select`}
                                      className="faun-data-table-radio"
                                      aria-label={`Select ${rowLabel}`}
                                      tabIndex={tabIndex}
                                      data-row-focus=""
                                      checked={isSelected}
                                      onChange={() => toggleRow(id, true)}
                                    />
                                  ) : (
                                    <Checkbox
                                      aria-label={`Select ${rowLabel}`}
                                      size="sm"
                                      tabIndex={tabIndex}
                                      data-row-focus=""
                                      checked={isSelected}
                                      onCheckedChange={(c) => toggleRow(id, c === true)}
                                    />
                                  )}
                                </td>
                              ) : null}
                              {expandable ? (
                                <td className="faun-data-table-expand">
                                  {canExpand(row) ? (
                                    <button
                                      type="button"
                                      className="faun-data-table-expander"
                                      aria-expanded={open}
                                      aria-controls={open ? detailId : undefined}
                                      aria-label={`${open ? "Collapse" : "Expand"} details for ${rowLabel}`}
                                      tabIndex={focusKind === "expand" ? tabIndex : i === tabStop ? 0 : -1}
                                      data-row-focus={focusKind === "expand" ? "" : undefined}
                                      onFocus={() => setRoving(i)}
                                      onClick={() => setExpandedRow(id, !open)}
                                    >
                                      <IconChevronRight size="sm" className="faun-data-table-expander-icon" />
                                    </button>
                                  ) : null}
                                </td>
                              ) : null}
                              {columns.map((c, ci) => {
                                const pin = stickyFirstColumn && ci === 0;
                                const raw = c.cell ? c.cell(row, i) : (valueOf({ ...c, sortValue: undefined }, row) as ReactNode);
                                const content = raw === null || raw === undefined || raw === "" ? <span className="faun-data-table-empty"><span aria-hidden="true">—</span><VisuallyHidden>No value</VisuallyHidden></span> : raw;
                                return c.rowHeader
                                  ? <th key={c.id} scope="row" data-numeric={c.numeric || undefined} data-pin={pin ? "" : undefined} style={pin ? pinStyle : undefined}>{content}</th>
                                  : <td key={c.id} data-numeric={c.numeric || undefined} data-pin={pin ? "" : undefined} style={pin ? pinStyle : undefined}>{content}</td>;
                              })}
                            </tr>
                            {open ? (
                              <tr className="faun-data-table-detail">
                                <td colSpan={colCount}>
                                  <div id={detailId} role="group" aria-label={`Details for ${rowLabel}`} className="faun-data-table-detail-body">{renderExpanded!(row, i)}</div>
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })}
                      {virtual && winEnd < rows.length ? <tr aria-hidden="true" className="faun-data-table-spacer"><td colSpan={colCount} style={{ blockSize: (rows.length - winEnd) * rowH }} /></tr> : null}
                    </>
                  )}
          </tbody>
        </table>
      </div>
      {paging && !error && total > 0 ? (
        <Pagination
          aria-label={`${label} pagination`}
          page={current}
          onPageChange={changePage}
          total={total}
          pageSize={size}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={pageSizeOptions ? changeSize : undefined}
          itemLabel={itemLabel}
        />
      ) : null}
      <VisuallyHidden role="status">{statusMessage}</VisuallyHidden>
    </div>
    </DataTableContext.Provider>
  );
}

/**
 * A dense, sortable table for datapoints, suppliers, runs and evidence. Handles sorting, row selection, pagination (client or server), expandable rows,
 * a column visibility menu, sticky headers, density, optional column resizing, optional virtualisation and the loading, empty and error states.
 */
export const DataTable = forwardRef(DataTableInner) as <T>(props: DataTableProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement | null;
