import { IconTrend, IconTrendDown } from "@faun-ds/icons";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export interface StatDelta {
  /** Formatted change, e.g. "4.2%" or "312 tCO₂e". */
  value: string;
  direction: "up" | "down" | "flat";
  /** Whether this change is good news. Emissions going down is good; coverage going down is bad. */
  sentiment?: "good" | "bad" | "neutral";
  /** Comparison basis, e.g. "vs base year 2022". */
  label?: string;
}

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  /** Formatted figure. Format numbers before passing (locale, decimals). */
  value: ReactNode;
  /** Unit after the figure, e.g. "tCO₂e", "%", "of 1,034". */
  unit?: ReactNode;
  icon?: ReactNode;
  delta?: StatDelta;
  /** Small text under the figure. */
  footnote?: ReactNode;
  /** `lg` for overview pages, `md` for KPI rows, `sm` for dense cards. */
  size?: "sm" | "md" | "lg";
  /** Extra visual under the figure: a Meter, ProgressBar or sparkline. */
  children?: ReactNode;
}

/** A single headline number with its context: unit, change and comparison. */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat({ label, value, unit, icon, delta, footnote, size = "md", className, children, ...props }, ref) {
  const sentiment = delta?.sentiment ?? "neutral";
  const DeltaIcon = delta?.direction === "down" ? IconTrendDown : IconTrend;
  const spoken = delta ? `${delta.direction === "flat" ? "unchanged" : delta.direction === "up" ? "up" : "down"} ${delta.value}${delta.label ? ` ${delta.label}` : ""}` : undefined;
  return (
    <div ref={ref} className={cx("faun-stat", className)} data-size={size} {...props}>
      <p className="faun-stat-label">{icon ? <span className="faun-stat-icon" aria-hidden="true">{icon}</span> : null}{label}</p>
      <p className="faun-stat-figure"><span className="faun-stat-value">{value}</span>{unit ? <span className="faun-stat-unit">{unit}</span> : null}</p>
      {children ? <div className="faun-stat-visual">{children}</div> : null}
      {delta || footnote ? (
        <p className="faun-stat-foot">
          {delta ? (
            <span className="faun-stat-delta" data-sentiment={sentiment} aria-label={spoken}>
              {delta.direction === "flat" ? null : <DeltaIcon size="sm" />}
              <span aria-hidden="true">{delta.value}</span>
            </span>
          ) : null}
          {delta?.label ? <span aria-hidden="true">{delta.label}</span> : null}
          {footnote ? <span>{footnote}</span> : null}
        </p>
      ) : null}
    </div>
  );
});

export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `card` draws one surface with dividers between stats (the KPI row); `plain` has no surface. */
  variant?: "card" | "plain";
  /** Minimum width per stat before the row wraps, as a CSS length. */
  minItemWidth?: string;
}

/** A row of Stats sharing one surface and divided evenly. */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(function StatGroup({ variant = "card", minItemWidth, className, style, ...props }, ref) {
  return <div ref={ref} role="group" className={cx("faun-stat-group", className)} data-variant={variant} style={minItemWidth ? { ...style, ["--_min" as string]: minItemWidth } : style} {...props} />;
});
