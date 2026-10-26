import { cx, StatusBadge, VisuallyHidden } from "@faun-ds/react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

/** States of the `data-quality` domain in the Faun status map. */
export type DataQualityState = "actual" | "evidenced" | "estimated" | "partial" | "missing" | "gap";

export interface DataQualityCellProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** How good the figure is. Drives the badge tone, icon and label from the status map. */
  state: DataQualityState;
  /** The formatted figure. Omit for `missing` and `gap`; the cell then shows a dash. */
  value?: ReactNode;
  /** Unit after the figure, for example "tCO₂e" or "kWh". */
  unit?: ReactNode;
  /** Where the figure came from, for example "Utility invoices, Jan to Dec 2025". Shown under the figure. */
  source?: ReactNode;
  /** Right-aligns the cell with tabular figures. Use in numeric table columns. */
  numeric?: boolean;
  /** Smaller badge for dense tables. */
  size?: "sm" | "md";
}

/** A table cell that pairs a reported figure with how far it can be trusted: actual, evidenced, estimated, partial, missing or gap. */
export const DataQualityCell = forwardRef<HTMLDivElement, DataQualityCellProps>(function DataQualityCell(
  { state, value, unit, source, numeric, size = "sm", className, ...props },
  ref,
) {
  const hasValue = value !== undefined && value !== null && value !== "";
  return (
    <div ref={ref} className={cx("faun-dq-cell", className)} data-state={state} data-numeric={numeric || undefined} {...props}>
      <div className="faun-dq-main">
        {hasValue ? (
          <span className="faun-dq-value">{value}{unit ? <span className="faun-dq-unit"> {unit}</span> : null}</span>
        ) : (
          <span className="faun-dq-value faun-dq-none"><span aria-hidden="true">—</span><VisuallyHidden>No value</VisuallyHidden></span>
        )}
        <StatusBadge domain="data-quality" state={state} size={size} variant="soft" />
      </div>
      {source ? <p className="faun-dq-source">{source}</p> : null}
    </div>
  );
});
