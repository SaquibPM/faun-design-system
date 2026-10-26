import { forwardRef } from "react";
import { BarChart, type BarChartProps } from "../BarChart/BarChart.js";

export interface StackedBarChartProps extends Omit<BarChartProps, "variant" | "showValues"> {}

/**
 * Shows how a total is made up: one stacked bar per category. This is `BarChart` with `variant="stacked"`.
 * Series with the ids `scope-1`, `scope-2` and `scope-3` take the GHG scope colours. Negative values stack below the baseline.
 */
export const StackedBarChart = forwardRef<HTMLElement, StackedBarChartProps>(function StackedBarChart(props, ref) {
  return <BarChart ref={ref} {...props} variant="stacked" />;
});
