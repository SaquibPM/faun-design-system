import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Checkbox, CheckboxGroup } from "../Checkbox/Checkbox.js";
import { Combobox } from "../Combobox/Combobox.js";
import { DatePicker } from "../DatePicker/DatePicker.js";
import { FileUpload } from "../FileUpload/FileUpload.js";
import { Input } from "../Input/Input.js";
import { MultiSelect } from "../MultiSelect/MultiSelect.js";
import { NumberField } from "../NumberField/NumberField.js";
import { RadioGroup } from "../RadioGroup/RadioGroup.js";
import { SearchField } from "../SearchField/SearchField.js";
import { Select } from "../Select/Select.js";
import { Slider } from "../Slider/Slider.js";
import { Switch } from "../Switch/Switch.js";
import { Textarea } from "../Textarea/Textarea.js";
import { Field } from "./Field.js";

const opts = [{ value: "a", label: "Operational control" }, { value: "b", label: "Financial control" }];

/** Every control that draws a single box, with the element that must carry the data-* state. */
const boxes: Array<[string, (p: Record<string, unknown>) => ReactElement, string]> = [
  ["Input", () => <Input defaultValue="x" />, ".faun-input"],
  ["Textarea", () => <Textarea defaultValue="x" />, ".faun-textarea"],
  ["NumberField", () => <NumberField defaultValue={3} />, ".faun-input"],
  ["SearchField", () => <SearchField defaultValue="x" />, ".faun-input"],
  ["Select", () => <Select options={opts} defaultValue="a" />, ".faun-field-trigger"],
  ["Combobox", () => <Combobox options={opts} defaultValue="a" />, ".faun-combobox"],
  ["MultiSelect", () => <MultiSelect options={opts} defaultValue={["a"]} />, ".faun-field-trigger"],
  ["DatePicker", () => <DatePicker entry="button" defaultValue={new Date(2026, 0, 5)} />, ".faun-field-trigger"],
];

describe("Field state contract: warn", () => {
  it("shows an icon-and-text message, links it to the control and announces it politely", async () => {
    const { container } = render(<Field label="Base year" warn="Differs from last year's method."><Input defaultValue="2024" /></Field>);
    const input = screen.getByRole("textbox", { name: "Base year" });
    const msg = screen.getByRole("status");
    expect(msg).toHaveTextContent("Differs from last year's method.");
    expect(msg.querySelector("svg")).not.toBeNull();
    expect(input).toHaveAccessibleDescription("Differs from last year's method.");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("lets an error win over a warning", () => {
    render(<Field label="Base year" warn="Careful" error="Wrong"><Input /></Field>);
    expect(screen.queryByText("Careful")).toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent("Wrong");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox").parentElement).not.toHaveAttribute("data-warn");
  });
  for (const [name, make, sel] of boxes) {
    it(`${name} carries data-warn from the Field and never aria-invalid`, () => {
      const { container } = render(<Field label="L" warn="Check this">{make({})}</Field>);
      expect(container.querySelector(sel)).toHaveAttribute("data-warn");
      expect(container.querySelector("[aria-invalid]")).toBeNull();
    });
  }
  it("groups and the remaining controls show warn", () => {
    const { container } = render(
      <>
        <CheckboxGroup label="Scopes" warn="Scope 3 is empty" options={opts} />
        <RadioGroup label="Boundary" warn="Changed since last year" options={opts} />
        <Field label="Threshold" warn="High"><Slider defaultValue={[50]} /></Field>
        <Field label="Evidence" warn="Large file"><FileUpload /></Field>
      </>,
    );
    expect(container.querySelectorAll("[data-warn]").length).toBeGreaterThanOrEqual(4);
    expect([...container.querySelectorAll(".faun-field-warn")].map((n) => n.textContent)).toEqual(["Scope 3 is empty", "Changed since last year", "High", "Large file"]);
  });
});

describe("Field state contract: read-only", () => {
  for (const [name, make, sel] of boxes) {
    it(`${name} is flagged read-only inside a read-only Field and stays focusable`, async () => {
      const { container } = render(<Field label="L" readOnly>{make({})}</Field>);
      expect(container.querySelector(sel)).toHaveAttribute("data-readonly");
      const focusable = container.querySelector<HTMLElement>("input, textarea, button[role=combobox], button.faun-field-trigger, [role=spinbutton]")!;
      expect(focusable).not.toBeDisabled();
      await userEvent.tab();
      expect(document.activeElement).toBe(focusable);
    });
  }
  it("Input and Textarea use native readOnly and do not change", async () => {
    render(<Field label="A" readOnly><Input defaultValue="fixed" /></Field>);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");
    await userEvent.type(input, "zzz");
    expect(input).toHaveValue("fixed");
  });
  it("Select, Combobox, MultiSelect and DatePicker do not open", async () => {
    render(
      <>
        <Select aria-label="s" options={opts} defaultValue="a" readOnly />
        <Combobox aria-label="c" options={opts} defaultValue="a" readOnly />
        <MultiSelect aria-label="m" options={opts} defaultValue={["a"]} readOnly />
        <DatePicker entry="button" aria-label="d" defaultValue={new Date(2026, 0, 5)} readOnly />
      </>,
    );
    for (const name of ["s", "c", "m"]) {
      const t = screen.getByRole("combobox", { name });
      expect(t).toHaveAttribute("aria-readonly", "true");
      await userEvent.click(t);
      expect(t).toHaveAttribute("aria-expanded", "false");
    }
    const d = screen.getByRole("button", { name: /^d, / });
    await userEvent.click(d);
    expect(d).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("Checkbox, Switch and RadioGroup keep their value and expose aria-readonly", async () => {
    const onChange = vi.fn();
    render(
      <>
        <Checkbox label="Final" readOnly defaultChecked onCheckedChange={onChange} />
        <Switch label="Alerts" readOnly onCheckedChange={onChange} />
        <RadioGroup label="Boundary" readOnly defaultValue="a" options={opts} onValueChange={onChange} />
      </>,
    );
    const cb = screen.getByRole("checkbox", { name: "Final" });
    const sw = screen.getByRole("switch", { name: "Alerts" });
    await userEvent.click(cb);
    await userEvent.click(sw);
    await userEvent.click(screen.getByRole("radio", { name: "Financial control" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(cb).toHaveAttribute("aria-checked", "true");
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Operational control" })).toBeChecked();
    for (const el of [cb, sw]) expect(el).toHaveAttribute("aria-readonly", "true");
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-readonly", "true");
  });
  it("CheckboxGroup read-only keeps selection", async () => {
    const onChange = vi.fn();
    render(<CheckboxGroup label="Scopes" readOnly defaultValue={["a"]} options={opts} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Financial control" }));
    expect(onChange).not.toHaveBeenCalled();
  });
  it("Slider read-only does not change on keys and marks its thumb", async () => {
    const onChange = vi.fn();
    render(<Field label="Cut-off" readOnly><Slider defaultValue={[40]} onValueChange={onChange} /></Field>);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-readonly", "true");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
  });
  it("FileUpload read-only lists files without add or remove", () => {
    render(<FileUpload readOnly defaultFiles={[{ id: "1", name: "bill.pdf", size: 2048, status: "done" }]} />);
    expect(screen.getByText("bill.pdf")).toBeInTheDocument();
    expect(screen.queryByText(/browse/)).toBeNull();
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
  });
  it("NumberField read-only blocks arrow keys and steppers", async () => {
    const onChange = vi.fn();
    render(<Field label="N" readOnly><NumberField defaultValue={5} stepper onValueChange={onChange} /></Field>);
    const n = screen.getByRole("spinbutton");
    n.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Increase", hidden: true })).toBeDisabled();
  });
  it("SearchField read-only hides clear and ignores Escape", async () => {
    render(<Field label="S" readOnly><SearchField defaultValue="diesel" /></Field>);
    const s = screen.getByRole("searchbox");
    s.focus();
    await userEvent.keyboard("{Escape}");
    expect(s).toHaveValue("diesel");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
});

describe("Field state contract: skeleton", () => {
  for (const [name, make, sel] of boxes) {
    it(`${name} renders a skeleton box that cannot be operated`, () => {
      const { container } = render(<Field label="L" skeleton>{make({})}</Field>);
      expect(container.querySelector(sel)).toHaveAttribute("data-skeleton");
      expect(container.querySelector("input:not([type=hidden]), textarea, button.faun-field-trigger, button[role=combobox]")).toBeDisabled();
    });
  }
  it("Field skeleton marks itself busy, keeps the label and drops messages", () => {
    render(<Field label="Base year" description="Help" error="Bad" skeleton><Input /></Field>);
    expect(screen.getByLabelText("Base year")).toBeDisabled();
    expect(screen.queryByText("Help")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector(".faun-field")).toHaveAttribute("aria-busy", "true");
  });
  it("standalone controls accept skeleton, and groups hide their options' interactivity", () => {
    const { container } = render(
      <>
        <Input aria-label="a" skeleton />
        <Checkbox label="c" skeleton />
        <Switch label="s" skeleton />
        <RadioGroup label="r" skeleton options={opts} />
        <CheckboxGroup label="g" skeleton options={opts} />
        <Slider aria-label="sl" skeleton />
        <FileUpload skeleton />
      </>,
    );
    expect(container.querySelectorAll("[data-skeleton]").length).toBeGreaterThanOrEqual(7);
    expect(screen.getByRole("textbox", { name: "a" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "c" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "s" })).toBeDisabled();
  });
});

describe("Field state contract: accessibility", () => {
  it("has no axe violations with every state across the families", async () => {
    const { container } = render(
      <>
        <Field label="Warn" warn="Look again"><Input defaultValue="a" /></Field>
        <Field label="Read-only" readOnly><Select options={opts} defaultValue="a" /></Field>
        <Field label="Skeleton" skeleton><Textarea /></Field>
        <CheckboxGroup label="Group" warn="Careful" options={opts} />
        <RadioGroup label="Radios" readOnly defaultValue="a" options={opts} />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
