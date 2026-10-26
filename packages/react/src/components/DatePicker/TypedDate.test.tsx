import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { DatePicker, DateRangePicker, type DateRange } from "./DatePicker.js";

describe("DatePicker typed entry", () => {
  it("is a labelled text field with a format hint, and a calendar button", () => {
    render(<Field label="Reporting date"><DatePicker /></Field>);
    const input = screen.getByRole("textbox", { name: "Reporting date" });
    expect(input).toHaveAttribute("placeholder", "dd/mm/yyyy");
    expect(input).toHaveAccessibleDescription(/Format dd\/mm\/yyyy/);
    expect(screen.getByRole("button", { name: "Choose date" })).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("masks as you type and reports a real date once it is complete", async () => {
    const fn = vi.fn();
    render(<DatePicker aria-label="Deadline" onValueChange={fn} />);
    const input = screen.getByRole("textbox", { name: "Deadline" });
    await userEvent.type(input, "31032026");
    expect(input).toHaveValue("31/03/2026");
    expect(fn).toHaveBeenLastCalledWith(new Date(2026, 2, 31));
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("accepts typed separators and pads one-digit parts", async () => {
    render(<DatePicker aria-label="Deadline" />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "1/2/2026");
    expect(input).toHaveValue("01/02/2026");
  });

  it("supports other formats", async () => {
    const fn = vi.fn();
    render(<DatePicker aria-label="Deadline" inputFormat="yyyy-MM-dd" onValueChange={fn} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "yyyy-mm-dd");
    await userEvent.type(input, "20260305");
    expect(input).toHaveValue("2026-03-05");
    expect(fn).toHaveBeenLastCalledWith(new Date(2026, 2, 5));
  });

  it("flags a date that does not exist with a message in words, and clears the value", async () => {
    const fn = vi.fn();
    const onValidate = vi.fn();
    render(<DatePicker aria-label="Deadline" defaultValue={new Date(2026, 0, 5)} onValueChange={fn} onValidate={onValidate} />);
    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "31022026");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Enter a real date as dd/mm/yyyy.");
    expect(input).toHaveAccessibleDescription(/Enter a real date/);
    expect(fn).toHaveBeenLastCalledWith(null);
    expect(onValidate).toHaveBeenLastCalledWith({ status: "invalid", message: "Enter a real date as dd/mm/yyyy." });
  });

  it("checks min, max and disabled dates", async () => {
    render(<DatePicker aria-label="Effective from" min={new Date(2026, 0, 10)} max={new Date(2026, 0, 20)} disabledDates={{ dayOfWeek: [0] }} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "05012026");
    expect(screen.getByRole("status")).toHaveTextContent("Enter a date on or after 10/01/2026.");
    await userEvent.clear(input);
    await userEvent.type(input, "25012026");
    expect(screen.getByRole("status")).toHaveTextContent("on or before 20/01/2026");
    await userEvent.clear(input);
    await userEvent.type(input, "18012026"); // a Sunday
    expect(screen.getByRole("status")).toHaveTextContent("not available");
    await userEvent.clear(input);
    await userEvent.type(input, "19012026");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("asks for the full date only after the field loses focus", async () => {
    render(<DatePicker aria-label="Deadline" />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "3103");
    expect(screen.queryByRole("status")).toBeNull();
    await userEvent.tab();
    expect(screen.getByRole("status")).toHaveTextContent("Enter the full date as dd/mm/yyyy.");
  });

  it("opens the calendar from the button, picks a day and writes it into the field", async () => {
    const fn = vi.fn();
    render(<DatePicker aria-label="Deadline" defaultValue={new Date(2026, 5, 10)} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Choose date" }));
    expect(await screen.findByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /June 15th, 2026/ }));
    expect(fn).toHaveBeenLastCalledWith(new Date(2026, 5, 15));
    expect(screen.getByRole("textbox")).toHaveValue("15/06/2026");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("opens the calendar with Alt+ArrowDown", async () => {
    render(<DatePicker aria-label="Deadline" />);
    screen.getByRole("textbox").focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("follows a controlled value and clears from the clear button", async () => {
    function C() {
      const [d, setD] = useState<Date | null>(new Date(2026, 2, 31));
      return <><DatePicker aria-label="Deadline" value={d} onValueChange={setD} clearable /><button onClick={() => setD(new Date(2027, 0, 2))}>Set</button></>;
    }
    render(<C />);
    expect(screen.getByRole("textbox")).toHaveValue("31/03/2026");
    await userEvent.click(screen.getByRole("button", { name: "Set" }));
    expect(screen.getByRole("textbox")).toHaveValue("02/01/2027");
    await userEvent.click(screen.getByRole("button", { name: "Clear deadline" }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("read-only keeps the value, ignores typing and hides the calendar button; skeleton disables", async () => {
    const { rerender } = render(<Field label="Date" readOnly><DatePicker defaultValue={new Date(2026, 0, 5)} /></Field>);
    const input = screen.getByRole("textbox", { name: "Date" });
    expect(input).toHaveAttribute("readonly");
    await userEvent.type(input, "9");
    expect(input).toHaveValue("05/01/2026");
    expect(input.closest(".faun-input")).toHaveAttribute("data-readonly");
    rerender(<Field label="Date" skeleton><DatePicker /></Field>);
    expect(screen.getByLabelText("Date")).toBeDisabled();
  });

  it("has no axe violations, open or with an error", async () => {
    const { container } = render(<Field label="Reporting date" description="Last day of the period"><DatePicker clearable defaultValue={new Date(2026, 2, 31)} /></Field>);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.type(screen.getByRole("textbox"), "{Backspace}");
    await userEvent.click(screen.getByRole("button", { name: "Choose date" }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

describe("DateRangePicker typed entry", () => {
  it("has a start and an end field inside a named group", () => {
    render(<Field label="Reporting period"><DateRangePicker /></Field>);
    expect(screen.getByRole("textbox", { name: /Reporting period.*start date/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Reporting period.*end date/i })).toBeInTheDocument();
  });

  it("reports a range once both ends are valid and in order", async () => {
    const fn = vi.fn();
    render(<DateRangePicker aria-label="Period" onValueChange={fn} />);
    const [start, end] = screen.getAllByRole("textbox");
    await userEvent.type(start!, "01012026");
    expect(fn).not.toHaveBeenCalled();
    await userEvent.type(end!, "31032026");
    expect(fn).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) });
  });

  it("says when the end is before the start, and reports no range", async () => {
    const fn = vi.fn();
    render(<DateRangePicker aria-label="Period" onValueChange={fn} />);
    const [start, end] = screen.getAllByRole("textbox");
    await userEvent.type(start!, "01032026");
    await userEvent.type(end!, "01022026");
    expect(screen.getByRole("status")).toHaveTextContent("The end date is before the start date.");
    expect(fn).not.toHaveBeenCalled();
    expect(start).toHaveAttribute("aria-invalid", "true");
  });

  it("picks from the calendar in two clicks and fills both fields", async () => {
    const fn = vi.fn();
    render(<DateRangePicker aria-label="Period" defaultValue={{ from: new Date(2026, 3, 1), to: new Date(2026, 3, 30) }} presets={false} onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Choose date range" }));
    await userEvent.click(screen.getByRole("button", { name: /April 20th, 2026/ }));
    expect(screen.getByText(/Starts 20\/04\/2026/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /April 6th, 2026/ }));
    expect(fn).toHaveBeenLastCalledWith({ from: new Date(2026, 3, 6), to: new Date(2026, 3, 20) });
    const [start, end] = screen.getAllByRole("textbox");
    expect(start).toHaveValue("06/04/2026");
    expect(end).toHaveValue("20/04/2026");
  });

  it("applies a preset into both fields", async () => {
    const fn = vi.fn();
    render(<DateRangePicker aria-label="Period" onValueChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Choose date range" }));
    await userEvent.click(screen.getByRole("button", { name: "Last quarter" }));
    const [start] = screen.getAllByRole("textbox");
    expect((start as HTMLInputElement).value).toMatch(/^01\/\d\d\/\d{4}$/);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("clears both ends; controlled value flows in", async () => {
    function C() {
      const [r, setR] = useState<DateRange | null>({ from: new Date(2026, 0, 1), to: new Date(2026, 0, 31) });
      return <><DateRangePicker aria-label="Period" value={r} onValueChange={setR} clearable /><button onClick={() => setR({ from: new Date(2026, 5, 1), to: new Date(2026, 5, 30) })}>Set</button></>;
    }
    render(<C />);
    const [start, end] = screen.getAllByRole("textbox");
    expect(start).toHaveValue("01/01/2026");
    await userEvent.click(screen.getByRole("button", { name: "Set" }));
    expect(start).toHaveValue("01/06/2026");
    expect(end).toHaveValue("30/06/2026");
    await userEvent.click(screen.getByRole("button", { name: "Clear period" }));
    expect(start).toHaveValue("");
    expect(end).toHaveValue("");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Field label="Reporting period"><DateRangePicker defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) }} /></Field>);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Choose date range" }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
