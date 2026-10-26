import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { AIFeedback } from "./AiFeedback.js";

describe("AIFeedback", () => {
  it("rates helpful and not helpful as toggle buttons, one at a time, and can clear", async () => {
    const onValueChange = vi.fn();
    const { container } = render(<AIFeedback onValueChange={onValueChange} />);
    const up = screen.getByRole("button", { name: "Helpful" });
    const down = screen.getByRole("button", { name: "Not helpful" });
    expect(up).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(up);
    expect(up).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Marked as helpful.");
    await userEvent.click(down);
    expect(up).toHaveAttribute("aria-pressed", "false");
    expect(down).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(down);
    expect(down).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["helpful", "not-helpful", null]);
    expect(await axeViolations(container)).toEqual([]);
  });
  it("copies the text, confirms in words and calls onCopy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const onCopy = vi.fn();
    render(<AIFeedback text="Scope 3 is 41,820 tCO₂e." onCopy={onCopy} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("Scope 3 is 41,820 tCO₂e.");
    expect(onCopy).toHaveBeenCalledWith("Scope 3 is 41,820 tCO₂e.");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Copied to the clipboard.");
  });
  it("regenerate calls back and is disabled while regenerating; controls can be hidden", async () => {
    const onRegenerate = vi.fn();
    const { rerender } = render(<AIFeedback onRegenerate={onRegenerate} />);
    await userEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
    rerender(<AIFeedback onRegenerate={onRegenerate} regenerating />);
    expect(screen.getByRole("button", { name: "Regenerating" })).toBeDisabled();
    rerender(<AIFeedback hide={{ rating: true, copy: true }} onRegenerate={onRegenerate} />);
    expect(screen.queryByRole("button", { name: "Helpful" })).toBeNull();
  });
  it("asks what was wrong after Not helpful and reports the reason", async () => {
    const onReason = vi.fn();
    render(<AIFeedback reasons={["Inaccurate", "Missing sources"]} onReason={onReason} />);
    expect(screen.queryByRole("group", { name: "What was wrong?" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Not helpful" }));
    await userEvent.click(screen.getByRole("button", { name: "Missing sources" }));
    expect(onReason).toHaveBeenCalledWith("Missing sources");
    expect(screen.getByRole("status")).toHaveTextContent("Thanks. Sent: Missing sources.");
  });
});
