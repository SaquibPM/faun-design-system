import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Textarea } from "./Textarea.js";

describe("Textarea", () => {
  it("takes input and wires to Field", async () => {
    const fn = vi.fn();
    render(<Field label="Methodology note" description="Visible to auditors"><Textarea onChange={fn} /></Field>);
    const t = screen.getByRole("textbox", { name: "Methodology note" });
    await userEvent.type(t, "Spend-based");
    expect(fn).toHaveBeenCalled();
    expect(t).toHaveValue("Spend-based");
    expect(t).toHaveAccessibleDescription("Visible to auditors");
  });
  it("counts characters against maxLength and links the count", async () => {
    render(<Textarea aria-label="Summary" showCount maxLength={20} defaultValue="Scope 1" />);
    const t = screen.getByRole("textbox", { name: "Summary" });
    expect(screen.getByText(/^7 \/ 20/)).toBeInTheDocument();
    expect(t).toHaveAccessibleDescription(/7 \/ 20/);
    await userEvent.type(t, " gas");
    expect(screen.getByText(/^11 \/ 20/)).toBeInTheDocument();
    await userEvent.type(t, " emissio");
    expect(screen.getByText("1 characters left")).toBeInTheDocument();
  });
  it("auto-grows within min and max rows", () => {
    render(<Textarea aria-label="Notes" autoGrow minRows={2} maxRows={4} />);
    const t = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(t.rows).toBe(2);
    fireEvent.change(t, { target: { value: "a\nb\nc" } });
    expect(t).toHaveValue("a\nb\nc");
  });
  it("marks invalid and has no axe violations", async () => {
    const { container } = render(<Field label="Justification" error="Add a justification of at least 50 characters"><Textarea showCount maxLength={500} /></Field>);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(await axeViolations(container)).toEqual([]);
  });
});
