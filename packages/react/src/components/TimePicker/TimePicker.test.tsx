import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { TimePicker } from "./TimePicker.js";
import { checkTime, maskTime, toText } from "./timeText.js";

describe("time text", () => {
  it("masks digits, pads a first digit that cannot start an hour, and honours a typed colon", () => {
    expect(maskTime("1", false)).toBe("1");
    expect(maskTime("9", false)).toBe("09");
    expect(maskTime("930", false)).toBe("09:30");
    expect(maskTime("2", true)).toBe("02");
    expect(maskTime("1", true)).toBe("1");
    expect(maskTime("9:", false)).toBe("09:");
    expect(maskTime("1430", false)).toBe("14:30");
    expect(maskTime("14:305", false)).toBe("14:30");
    expect(maskTime("ab", false)).toBe("");
  });
  it("converts between 24 and 12 hour text", () => {
    expect(toText(0, true)).toEqual({ text: "12:00", period: "AM" });
    expect(toText(12 * 60 + 5, true)).toEqual({ text: "12:05", period: "PM" });
    expect(toText(15 * 60 + 45, true)).toEqual({ text: "03:45", period: "PM" });
    expect(toText(15 * 60 + 45, false)).toEqual({ text: "15:45", period: "PM" });
  });
  it("checks ranges and steps", () => {
    const o = { h12: false, step: 15, min: 9 * 60, max: 17 * 60 };
    expect(checkTime("09:15", "AM", o).status).toBe("valid");
    expect(checkTime("09:10", "AM", o).message).toBe("Use 15 minute steps, for example 09:00.");
    expect(checkTime("08:00", "AM", o).status).toBe("before-min");
    expect(checkTime("17:15", "AM", o).status).toBe("after-max");
    expect(checkTime("24:00", "AM", o).status).toBe("invalid");
    expect(checkTime("13:00", "PM", { h12: true, step: 1 }).status).toBe("invalid");
    expect(checkTime("01:00", "PM", { h12: true, step: 1 }).minutes).toBe(13 * 60);
    expect(checkTime("12:30", "AM", { h12: true, step: 1 }).minutes).toBe(30);
  });
});

describe("TimePicker", () => {
  it("is a labelled text field with a format hint", () => {
    render(<Field label="Meeting starts"><TimePicker /></Field>);
    const input = screen.getByRole("textbox", { name: "Meeting starts" });
    expect(input).toHaveAttribute("placeholder", "hh:mm");
    expect(input).toHaveAccessibleDescription(/Format hh:mm/);
  });

  it("types a 24 hour time and reports HH:mm", async () => {
    const fn = vi.fn();
    render(<TimePicker aria-label="Start" onValueChange={fn} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "0930");
    expect(input).toHaveValue("09:30");
    expect(fn).toHaveBeenLastCalledWith("09:30");
    await userEvent.clear(input);
    expect(fn).toHaveBeenLastCalledWith(null);
  });

  it("12 hour: has an AM/PM choice, and the value stays 24 hour", async () => {
    const fn = vi.fn();
    render(<TimePicker aria-label="Start" hourCycle={12} onValueChange={fn} />);
    await userEvent.type(screen.getByRole("textbox"), "0345");
    expect(fn).toHaveBeenLastCalledWith("03:45");
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "AM or PM" }), "PM");
    expect(fn).toHaveBeenLastCalledWith("15:45");
  });

  it("12 hour: pressing A or P switches the period", async () => {
    const fn = vi.fn();
    render(<TimePicker aria-label="Start" hourCycle={12} defaultValue="09:00" onValueChange={fn} />);
    expect(screen.getByRole("textbox")).toHaveValue("09:00");
    expect(screen.getByRole("combobox", { name: "AM or PM" })).toHaveValue("AM");
    screen.getByRole("textbox").focus();
    await userEvent.keyboard("p");
    expect(fn).toHaveBeenLastCalledWith("21:00");
    expect(screen.getByRole("combobox", { name: "AM or PM" })).toHaveValue("PM");
    expect(screen.getByRole("textbox")).toHaveValue("09:00");
  });

  it("shows a stored value in the chosen hour cycle", () => {
    render(<TimePicker aria-label="Start" hourCycle={12} defaultValue="00:30" />);
    expect(screen.getByRole("textbox")).toHaveValue("12:30");
    expect(screen.getByRole("combobox", { name: "AM or PM" })).toHaveValue("AM");
  });

  it("Arrow Up and Down move by the step and wrap inside the limits", async () => {
    const fn = vi.fn();
    render(<TimePicker aria-label="Slot" step={15} min="09:00" max="10:00" defaultValue="09:45" onValueChange={fn} />);
    const input = screen.getByRole("textbox");
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("10:00");
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("09:00"); // wraps
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveValue("10:00");
    expect(fn).toHaveBeenLastCalledWith("10:00");
  });

  it("starts from the minimum when empty and snaps an off-grid time to the next step", async () => {
    render(<TimePicker aria-label="Slot" step={30} min="08:00" />);
    const input = screen.getByRole("textbox");
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("08:00");
    await userEvent.clear(input);
    await userEvent.type(input, "0910");
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("09:30");
  });

  it("flags times that do not exist, are outside the limits, or are off the step, in words", async () => {
    const onValidate = vi.fn();
    render(<TimePicker aria-label="Slot" step={15} min="09:00" max="17:00" onValidate={onValidate} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "2575");
    expect(screen.getByRole("status")).toHaveTextContent("Enter a real time");
    expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(input);
    await userEvent.type(input, "0800");
    expect(screen.getByRole("status")).toHaveTextContent("Enter a time at or after 09:00.");
    await userEvent.clear(input);
    await userEvent.type(input, "0910");
    expect(screen.getByRole("status")).toHaveTextContent("Use 15 minute steps, for example 09:00.");
    expect(onValidate).toHaveBeenLastCalledWith({ status: "off-step", message: "Use 15 minute steps, for example 09:00." });
    await userEvent.clear(input);
    await userEvent.type(input, "0915");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("asks for the full time only after the field loses focus", async () => {
    render(<TimePicker aria-label="Start" />);
    await userEvent.type(screen.getByRole("textbox"), "09:");
    expect(screen.queryByRole("status")).toBeNull();
    await userEvent.tab();
    expect(screen.getByRole("status")).toHaveTextContent("Enter the full time as hh:mm.");
  });

  it("follows a controlled value", async () => {
    function C() {
      const [v, setV] = useState<string | null>("08:15");
      return <><TimePicker aria-label="Start" value={v} onValueChange={setV} /><button onClick={() => setV("17:45")}>Set</button></>;
    }
    render(<C />);
    expect(screen.getByRole("textbox")).toHaveValue("08:15");
    await userEvent.click(screen.getByRole("button", { name: "Set" }));
    expect(screen.getByRole("textbox")).toHaveValue("17:45");
  });

  it("read-only keeps the value and ignores typing; skeleton disables", async () => {
    const { rerender } = render(<Field label="Start" readOnly><TimePicker defaultValue="09:30" hourCycle={12} /></Field>);
    const input = screen.getByRole("textbox", { name: "Start" });
    await userEvent.type(input, "1");
    expect(input).toHaveValue("09:30");
    expect(input.closest(".faun-input")).toHaveAttribute("data-readonly");
    rerender(<Field label="Start" skeleton><TimePicker /></Field>);
    expect(screen.getByLabelText("Start")).toBeDisabled();
  });

  it("has no axe violations in 24 hour, 12 hour and error states", async () => {
    const { container } = render(
      <>
        <Field label="Start (24 hour)" description="Local time"><TimePicker defaultValue="09:30" /></Field>
        <Field label="Start (12 hour)"><TimePicker hourCycle={12} defaultValue="15:30" /></Field>
        <Field label="Slot" error="Pick a slot."><TimePicker /></Field>
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
