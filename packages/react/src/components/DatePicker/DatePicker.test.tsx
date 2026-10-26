import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Calendar } from "./Calendar.js";
import { DatePicker, DateRangePicker } from "./DatePicker.js";
import { defaultRangePresets, fiscalYearLabel, fiscalYearStart } from "./presets.js";

describe("DatePicker", () => {
  it("shows the formatted value in a Field-labelled trigger", () => {
    render(<Field label="Reporting date"><DatePicker entry="button" defaultValue={new Date(2026, 2, 31)} /></Field>);
    expect(screen.getByRole("button", { name: "Reporting date 31 Mar 2026" })).toHaveAttribute("aria-haspopup", "dialog");
  });
  it("opens a calendar dialog and picks a day", async () => {
    const fn = vi.fn();
    render(<DatePicker entry="button" aria-label="Deadline" defaultValue={new Date(2026, 5, 10)} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Deadline/ }));
    expect(await screen.findByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /June 15th, 2026/ }));
    expect(fn).toHaveBeenCalledWith(new Date(2026, 5, 15));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("disables days outside min and max, and clears", async () => {
    const fn = vi.fn();
    render(<DatePicker entry="button" aria-label="Effective from" defaultValue={new Date(2026, 0, 15)} min={new Date(2026, 0, 10)} max={new Date(2026, 0, 20)} clearable onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /^Effective from/ }));
    expect(screen.getByRole("button", { name: /January 5th, 2026/ })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: /clear effective from/i }));
    expect(fn).toHaveBeenCalledWith(null);
  });
  it("has no axe violations", async () => {
    const { container } = render(<Field label="Reporting date" description="Last day of the period"><DatePicker entry="button" /></Field>);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("DateRangePicker", () => {
  it("picks a range in two clicks", async () => {
    const fn = vi.fn();
    render(<DateRangePicker entry="button" aria-label="Period" defaultValue={{ from: new Date(2026, 3, 1), to: new Date(2026, 3, 30) }} presets={false} onValueChange={fn} />);
    expect(screen.getByRole("button", { name: /1 Apr 2026 – 30 Apr 2026/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Period/ }));
    await userEvent.click(screen.getByRole("button", { name: /April 20th, 2026/ }));
    expect(screen.getByText(/Starts 20 Apr 2026/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /April 6th, 2026/ }));
    expect(fn).toHaveBeenCalledWith({ from: new Date(2026, 3, 6), to: new Date(2026, 3, 20) });
  });
  it("applies a preset", async () => {
    const fn = vi.fn();
    render(<DateRangePicker entry="button" aria-label="Period" onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Period/ }));
    await userEvent.click(screen.getByRole("button", { name: "Last quarter" }));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]![0].from.getDate()).toBe(1);
  });
  it("has no axe violations when open", async () => {
    render(<Field label="Reporting period"><DateRangePicker entry="button" defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) }} /></Field>);
    await userEvent.click(screen.getByRole("button", { name: /Reporting period/ }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

describe("presets", () => {
  it("names fiscal years by the year they end in", () => {
    expect(fiscalYearStart(new Date(2026, 1, 10), 3)).toEqual(new Date(2025, 3, 1));
    expect(fiscalYearLabel(new Date(2025, 3, 1), 3)).toBe("FY2026");
    expect(fiscalYearLabel(new Date(2026, 0, 1), 0)).toBe("FY2026");
  });
  it("computes quarters and the fiscal year", () => {
    const today = new Date(2026, 9, 18);
    const p = defaultRangePresets({ fiscalYearStartMonth: 3 }, today);
    const byLabel = Object.fromEntries(p.map((x) => [x.label, x.range(today)]));
    expect(byLabel["Last quarter"]!.from).toEqual(new Date(2026, 6, 1));
    expect(byLabel["FY2027"]!.from).toEqual(new Date(2026, 3, 1));
    expect(byLabel["FY2027"]!.to!.getMonth()).toBe(2);
    expect(byLabel["FY2026"]).toBeDefined();
  });
});

describe("Calendar", () => {
  it("renders inline with no axe violations", async () => {
    const { container } = render(<Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} selected={new Date(2026, 9, 18)} />);
    expect(screen.getByText("October 2026")).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
