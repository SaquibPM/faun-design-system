import { addMonths, endOfDay, endOfMonth, endOfQuarter, startOfDay, startOfMonth, startOfQuarter, subDays, subMonths, subQuarters } from "date-fns";
import type { DateRange } from "react-day-picker";

export interface DateRangePreset {
  label: string;
  /** Returns the range. Receives today, so presets are testable. */
  range: (today: Date) => DateRange;
}

export interface PresetOptions {
  /** Month the fiscal year starts, 0 = January. Fiscal years are named by the calendar year they end in. Default 0. */
  fiscalYearStartMonth?: number;
}

/** Start of the fiscal year containing `date`. */
export function fiscalYearStart(date: Date, startMonth = 0): Date {
  const y = date.getMonth() >= startMonth ? date.getFullYear() : date.getFullYear() - 1;
  return new Date(y, startMonth, 1);
}

/** Fiscal year name for the year starting at `start`, e.g. FY2026. */
export function fiscalYearLabel(start: Date, startMonth = 0): string {
  return `FY${startMonth === 0 ? start.getFullYear() : start.getFullYear() + 1}`;
}

/** The reporting presets used in ESG reporting: months, quarters, year to date, fiscal years, trailing twelve months. */
export function defaultRangePresets({ fiscalYearStartMonth = 0 }: PresetOptions = {}, today = new Date()): DateRangePreset[] {
  const fy = fiscalYearStart(today, fiscalYearStartMonth);
  const lastFy = addMonths(fy, -12);
  return [
    { label: "This month", range: (t) => ({ from: startOfMonth(t), to: endOfDay(t) }) },
    { label: "Last month", range: (t) => ({ from: startOfMonth(subMonths(t, 1)), to: endOfMonth(subMonths(t, 1)) }) },
    { label: "This quarter", range: (t) => ({ from: startOfQuarter(t), to: endOfDay(t) }) },
    { label: "Last quarter", range: (t) => ({ from: startOfQuarter(subQuarters(t, 1)), to: endOfQuarter(subQuarters(t, 1)) }) },
    { label: "Year to date", range: (t) => ({ from: fiscalYearStart(t, fiscalYearStartMonth), to: endOfDay(t) }) },
    { label: fiscalYearLabel(fy, fiscalYearStartMonth), range: (t) => { const s = fiscalYearStart(t, fiscalYearStartMonth); return { from: s, to: endOfDay(subDays(addMonths(s, 12), 1)) }; } },
    { label: fiscalYearLabel(lastFy, fiscalYearStartMonth), range: (t) => { const s = addMonths(fiscalYearStart(t, fiscalYearStartMonth), -12); return { from: s, to: endOfDay(subDays(addMonths(s, 12), 1)) }; } },
    { label: "Last 12 months", range: (t) => ({ from: startOfDay(addMonths(subDays(t, -1), -12)), to: endOfDay(t) }) },
  ];
}
