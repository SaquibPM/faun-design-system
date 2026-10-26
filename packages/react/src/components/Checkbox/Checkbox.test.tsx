import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Checkbox, CheckboxGroup, type CheckedState } from "./Checkbox.js";

const frameworks = [
  { value: "csrd", label: "CSRD" },
  { value: "issb", label: "ISSB" },
  { value: "cdp", label: "CDP", description: "Climate change questionnaire" },
];

describe("Checkbox", () => {
  it("toggles with click and Space, labelled by its text", async () => {
    const fn = vi.fn();
    render(<Checkbox label="Include Scope 3" onCheckedChange={fn} />);
    const box = screen.getByRole("checkbox", { name: "Include Scope 3" });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText("Include Scope 3"));
    expect(box).toBeChecked();
    box.focus();
    await userEvent.keyboard(" ");
    expect(box).not.toBeChecked();
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("supports the indeterminate state", async () => {
    function Parent() {
      const [c, setC] = useState<CheckedState>("indeterminate");
      return <Checkbox label="All sites" checked={c} onCheckedChange={setC} />;
    }
    render(<Parent />);
    const box = screen.getByRole("checkbox", { name: "All sites" });
    expect(box).toHaveAttribute("aria-checked", "mixed");
    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
  });
  it("describes itself and picks up Field errors", () => {
    render(<Field label="Consent" error="Confirm the data is complete"><Checkbox label="I confirm" description="Signed by the preparer" /></Field>);
    const box = screen.getByRole("checkbox", { name: /I confirm/ });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription(/Signed by the preparer/);
    expect(box).toHaveAccessibleDescription(/Confirm the data is complete/);
  });
  it("has no axe violations", async () => {
    const { container } = render(<><Checkbox label="Checked" defaultChecked /><Checkbox label="Mixed" checked="indeterminate" /><Checkbox label="Disabled" disabled /></>);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("CheckboxGroup", () => {
  it("is a labelled group that tracks selected values", async () => {
    const fn = vi.fn();
    render(<CheckboxGroup label="Frameworks" options={frameworks} defaultValue={["csrd"]} onValueChange={fn} />);
    expect(screen.getByRole("group", { name: "Frameworks" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "ISSB" }));
    expect(fn).toHaveBeenLastCalledWith(["csrd", "issb"]);
  });
  it("select all is mixed when some are selected and selects all enabled options", async () => {
    const fn = vi.fn();
    render(<CheckboxGroup label="Frameworks" options={frameworks} defaultValue={["csrd"]} onValueChange={fn} selectAll />);
    const all = screen.getByRole("checkbox", { name: /select all/i });
    expect(all).toHaveAttribute("aria-checked", "mixed");
    await userEvent.click(all);
    expect(fn).toHaveBeenLastCalledWith(expect.arrayContaining(["csrd", "issb", "cdp"]));
  });
  it("announces errors and has no axe violations", async () => {
    const { container } = render(<CheckboxGroup label="Frameworks" options={frameworks} error="Pick at least one framework" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Pick at least one framework");
    expect(await axeViolations(container)).toEqual([]);
  });
});
