import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { PromptComposer } from "./PromptComposer.js";

describe("PromptComposer", () => {
  it("has a labelled text box and a Send button that is off until there is text", async () => {
    render(<PromptComposer label="Message to the orchestrator" />);
    const box = screen.getByRole("textbox", { name: "Message to the orchestrator" });
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();
    await userEvent.type(box, "   ");
    expect(send).toBeDisabled();
    await userEvent.type(box, "Why is Scope 3 up?");
    expect(send).toBeEnabled();
  });
  it("sends trimmed text with the button and clears an uncontrolled box", async () => {
    const onSend = vi.fn();
    render(<PromptComposer onSend={onSend} />);
    const box = screen.getByRole("textbox");
    await userEvent.type(box, "  Why is Scope 3 up?  ");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("Why is Scope 3 up?");
    expect(box).toHaveValue("");
  });
  it("sends on Enter and adds a line on Shift+Enter", async () => {
    const onSend = vi.fn();
    render(<PromptComposer onSend={onSend} />);
    const box = screen.getByRole("textbox");
    await userEvent.type(box, "Line one{Shift>}{Enter}{/Shift}Line two");
    expect(onSend).not.toHaveBeenCalled();
    expect(box).toHaveValue("Line one\nLine two");
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith("Line one\nLine two");
  });
  it("does not send while an input method is composing", async () => {
    const onSend = vi.fn();
    render(<PromptComposer onSend={onSend} defaultValue="こんにちは" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });
  it("with submitKey mod-enter, Enter adds a line and Ctrl+Enter sends", async () => {
    const onSend = vi.fn();
    render(<PromptComposer onSend={onSend} submitKey="mod-enter" />);
    const box = screen.getByRole("textbox");
    await userEvent.type(box, "Draft E1-6{Enter}");
    expect(onSend).not.toHaveBeenCalled();
    expect(box).toHaveValue("Draft E1-6\n");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(onSend).toHaveBeenCalledWith("Draft E1-6");
  });
  it("works controlled and leaves the value to the owner after sending", async () => {
    const onSend = vi.fn();
    function Host() {
      const [v, setV] = useState("Check March");
      return <PromptComposer value={v} onValueChange={setV} onSend={onSend} />;
    }
    render(<Host />);
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("Check March");
    expect(screen.getByRole("textbox")).toHaveValue("Check March");
  });
  it("swaps Send for Stop while the agent runs, and Enter no longer sends", async () => {
    const onStop = vi.fn();
    const onSend = vi.fn();
    render(<PromptComposer running onStop={onStop} onSend={onSend} defaultValue="Next question" />);
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull();
    await userEvent.type(screen.getByRole("textbox"), "{Enter}");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
  it("can send with attachments alone when allowed", async () => {
    const onSend = vi.fn();
    render(<PromptComposer allowEmpty onSend={onSend} attachments={<span>INV-20931.pdf</span>} />);
    expect(screen.getByText("INV-20931.pdf")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("");
  });
  it("renders toolbar actions and a hint that describes the box", () => {
    render(<PromptComposer actions={<button type="button">Attach a file</button>} hint="The agent can see this filing." />);
    expect(screen.getByRole("button", { name: "Attach a file" })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription("The agent can see this filing.");
  });
  it("disables everything when disabled", () => {
    render(<PromptComposer disabled defaultValue="Locked" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });
  it("has no axe violations in each state", async () => {
    const { container, rerender } = render(<PromptComposer hint="Shift+Enter adds a line." defaultValue="Why?" />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<PromptComposer running hint="Drafting." />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<PromptComposer disabled />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
