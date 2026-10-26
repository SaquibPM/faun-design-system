import { Field, Input } from "@faun-ds/react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { actors } from "../../utils/fixtures.js";
import { AISlot, type AISlotState } from "./AiSlot.js";

function Harness({ initial = "suggested" as AISlotState }) {
  const ORIGINAL = "41,820";
  const [state, setState] = useState<AISlotState>(initial);
  const [value, setValue] = useState(ORIGINAL);
  return (
    <AISlot
      state={state}
      explain={{ agent: actors.scope3, model: "scope3-estimator 2026-09" }}
      onAccept={() => setState("accepted")}
      onRevert={() => { setValue(ORIGINAL); setState("accepted"); }}
    >
      <Field label="Scope 3 category 1 (tCO₂e)"><Input value={value} onChange={(e) => { setValue(e.target.value); setState("edited"); }} /></Field>
    </AISlot>
  );
}

describe("AISlot", () => {
  it("marks a suggestion as AI suggested with Accept and Edit, and has no axe violations", async () => {
    const { container } = render(<Harness />);
    expect(screen.getByRole("button", { name: "AI suggested" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-state", "suggested");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("Accept keeps the label as AI generated, drops the actions and announces it", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(screen.getByRole("button", { name: "AI generated" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Suggestion accepted.");
  });
  it("Edit moves focus into the control; typing marks it edited and offers Revert, which restores the AI value", async () => {
    const onEdit = vi.fn();
    render(<AISlot state="suggested" onEdit={onEdit}><Field label="Narrative"><Input defaultValue="x" /></Field></AISlot>);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Narrative" })).toHaveFocus();
  });
  it("edited state: label says edited, Revert puts the original back", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Accept" }));
    const input = screen.getByRole("textbox", { name: /Scope 3 category 1/ });
    await userEvent.type(input, "0");
    expect(input).toHaveValue("41,8200");
    expect(screen.getByRole("button", { name: "AI generated, edited" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Revert to AI version" }));
    expect(input).toHaveValue("41,820");
    expect(screen.getByRole("button", { name: "AI generated" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Suggestion accepted.");
  });
  it("the label's explanation also offers revert while edited", async () => {
    const onRevert = vi.fn();
    render(<AISlot state="edited" onRevert={onRevert}><p>Text</p></AISlot>);
    await userEvent.click(screen.getByRole("button", { name: "AI generated, edited" }));
    const card = await screen.findByRole("dialog", { name: "About this AI content" });
    await userEvent.click(within(card).getByRole("button", { name: "Revert to AI version" }));
    expect(onRevert).toHaveBeenCalled();
  });
});
