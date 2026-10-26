import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp } from "@faun-ds/icons";
import type { ComponentProps } from "react";
import { DayPicker, type ChevronProps } from "react-day-picker";
import { cx } from "../../utils/cx.js";

export type CalendarProps = ComponentProps<typeof DayPicker>;

const classNames = {
  root: "faun-calendar",
  months: "faun-calendar-months",
  month: "faun-calendar-month",
  month_caption: "faun-calendar-caption",
  caption_label: "faun-calendar-caption-label",
  dropdowns: "faun-calendar-dropdowns",
  dropdown_root: "faun-calendar-dropdown-root",
  dropdown: "faun-calendar-dropdown",
  nav: "faun-calendar-nav",
  button_previous: "faun-calendar-nav-button",
  button_next: "faun-calendar-nav-button",
  chevron: "faun-calendar-chevron",
  month_grid: "faun-calendar-grid",
  weekdays: "faun-calendar-weekdays",
  weekday: "faun-calendar-weekday",
  weeks: "faun-calendar-weeks",
  week: "faun-calendar-week",
  week_number: "faun-calendar-week-number",
  week_number_header: "faun-calendar-week-number",
  day: "faun-calendar-day",
  day_button: "faun-calendar-day-button",
  footer: "faun-calendar-footer",
  today: "faun-calendar-today",
  outside: "faun-calendar-outside",
  disabled: "faun-calendar-disabled",
  hidden: "faun-calendar-hidden",
  focused: "faun-calendar-focused",
  selected: "faun-calendar-selected",
  range_start: "faun-calendar-range-start",
  range_middle: "faun-calendar-range-middle",
  range_end: "faun-calendar-range-end",
};

function Chevron({ orientation, className }: ChevronProps) {
  const Icon = orientation === "left" ? IconChevronLeft : orientation === "right" ? IconChevronRight : orientation === "up" ? IconChevronUp : IconChevronDown;
  return <Icon className={className} aria-hidden="true" />;
}

/** A month grid for picking dates. Used inside DatePicker and DateRangePicker, or inline on a page. */
export function Calendar({ className, classNames: extra, components, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      {...props}
      className={cx(className)}
      classNames={{ ...classNames, ...extra }}
      components={{ Chevron, ...components }}
    />
  );
}
