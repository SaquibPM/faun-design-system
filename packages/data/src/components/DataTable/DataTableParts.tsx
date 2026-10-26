import { IconRows } from "@faun-ds/icons";
import {
  cx, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger, IconButton, OverflowMenu,
} from "@faun-ds/react";
import { createContext, useContext, useState, type HTMLAttributes, type ReactNode } from "react";

/** Row heights, aligned with Carbon's five sizes: xs 24, sm 32, md 40, lg 48 and xl 64 px. They map to the control-size tokens (xl to space 16). */
export type DataTableRowSize = "xs" | "sm" | "md" | "lg" | "xl";

export const ROW_SIZES: { value: DataTableRowSize; label: string; px: number }[] = [
  { value: "xs", label: "Extra small", px: 24 },
  { value: "sm", label: "Small", px: 32 },
  { value: "md", label: "Medium", px: 40 },
  { value: "lg", label: "Large", px: 48 },
  { value: "xl", label: "Extra large", px: 64 },
];

/** What a table tells its rows: batch mode turns row actions off while rows are selected. */
export const DataTableContext = createContext<{ batch: boolean }>({ batch: false });

export interface DataTableToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** A `SearchField` (size sm or md). Takes the leading edge and grows. */
  search?: ReactNode;
  /** Filter controls: `FilterChip`s, a `MultiSelect`, a filter menu. */
  filters?: ReactNode;
  /** Trailing buttons: export, add, a primary action. */
  actions?: ReactNode;
  /** Accessible name for the toolbar. Default "Table tools". */
  label?: string;
}

/**
 * The strip above a table's rows: search, filters and actions in one place. Pass it as `toolbar` on `DataTable`.
 * It is a labelled group, not an ARIA toolbar, so Tab moves through the controls in reading order.
 */
export function DataTableToolbar({ search, filters, actions, label = "Table tools", className, ...rest }: DataTableToolbarProps) {
  return (
    <div role="group" aria-label={label} className={cx("faun-data-table-tools", className)} {...rest}>
      {search ? <div className="faun-data-table-tools-search">{search}</div> : null}
      {filters ? <div className="faun-data-table-tools-filters">{filters}</div> : null}
      {actions ? <div className="faun-data-table-tools-actions">{actions}</div> : null}
    </div>
  );
}

/** The row-height menu a table shows in its toolbar when `rowSizeMenu` is on. */
export function RowSizeMenu({ value, onChange }: { value: DataTableRowSize; onChange: (v: DataTableRowSize) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon={<IconRows />} label="Row height" size="sm" variant="ghost" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="sm">
        <DropdownMenuLabel>Row height</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as DataTableRowSize)}>
          {ROW_SIZES.map((s) => <DropdownMenuRadioItem key={s.value} value={s.value}>{s.label} ({s.px} px)</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface DataTableRowAction {
  id: string;
  /** Short verb phrase: "Edit", "Assign owner", "Delete". */
  label: string;
  /** Icon for the inline form. Needed when the action may show as an icon button. */
  icon?: ReactNode;
  onSelect: () => void;
  /** Destructive. Destructive actions always live in the menu, never as an icon-only button. */
  danger?: boolean;
  disabled?: boolean;
}

export interface DataTableRowActionsProps {
  /** Names the row for assistive technology: "Actions for E1-6.44". Use the same text as `getRowLabel`. */
  label: string;
  actions: DataTableRowAction[];
  /** `hover` (default) shows the actions when the row is hovered or focused, and always on touch screens. `always` keeps them visible. */
  reveal?: "hover" | "always";
  /** Turn the actions off while rows are selected for a batch action. Default true. */
  disableInBatch?: boolean;
}

/**
 * Actions for one row. Fewer than three actions with an icon each (and none destructive) show as icon buttons; otherwise one overflow menu.
 * With `reveal="hover"` the actions fade in on row hover and stay visible while they have focus, while the menu is open, and on touch screens.
 */
export function DataTableRowActions({ label, actions, reveal = "hover", disableInBatch = true }: DataTableRowActionsProps) {
  const { batch } = useContext(DataTableContext);
  const [open, setOpen] = useState(false);
  const off = disableInBatch && batch;
  const inline = actions.length > 0 && actions.length < 3 && actions.every((a) => a.icon && !a.danger);
  return (
    <span className="faun-data-table-row-actions" data-reveal={reveal} data-open={open || undefined} data-disabled={off || undefined}>
      {inline
        ? actions.map((a) => <IconButton key={a.id} icon={a.icon} label={`${a.label} ${label}`} size="sm" disabled={off || a.disabled} onClick={a.onSelect} />)
        : (
          <OverflowMenu label={`Actions for ${label}`} size="sm" disabled={off} open={open} onOpenChange={setOpen}>
            {actions.map((a, i) => (
              <span key={a.id} style={{ display: "contents" }}>
                {a.danger && i > 0 && !actions[i - 1]!.danger ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem icon={a.icon} intent={a.danger ? "danger" : "neutral"} disabled={a.disabled} onSelect={a.onSelect}>{a.label}</DropdownMenuItem>
              </span>
            ))}
          </OverflowMenu>
        )}
    </span>
  );
}
