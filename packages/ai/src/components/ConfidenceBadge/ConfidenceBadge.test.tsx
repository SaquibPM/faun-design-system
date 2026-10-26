import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { ConfidenceBadge } from "./ConfidenceBadge.js";

describe("ConfidenceBadge", () => {
  it.each([
    ["high", "High confidence"],
    ["medium", "Medium confidence"],
    ["low", "Low confidence"],
  ] as const)("says %s in words", (level, text) => {
    render(<ConfidenceBadge confidence={{ level }} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
  it("shows the score as a percentage only when asked", () => {
    const { rerender } = render(<ConfidenceBadge confidence={{ level: "high", score: 0.924 }} />);
    expect(screen.queryByText(/92%/)).toBeNull();
    rerender(<ConfidenceBadge showScore confidence={{ level: "high", score: 0.924 }} />);
    expect(screen.getByText(/92%/)).toBeInTheDocument();
  });
  it("makes the reason available to screen readers and keyboard users", async () => {
    render(<ConfidenceBadge confidence={{ level: "low", reason: "Matched on supplier name only." }} />);
    const badge = screen.getByText("Low confidence").closest(".faun-badge")!;
    expect(badge).toHaveAttribute("tabindex", "0");
    expect(badge).toHaveAccessibleDescription(/Matched on supplier name only/);
    await userEvent.tab();
    expect(badge).toHaveFocus();
  });
  it("is not focusable when there is no reason", () => {
    render(<ConfidenceBadge confidence={{ level: "medium" }} />);
    expect(screen.getByText("Medium confidence").closest(".faun-badge")).not.toHaveAttribute("tabindex");
  });
  it("has no axe violations", async () => {
    const { container } = render(<div><ConfidenceBadge confidence={{ level: "high", score: 0.9 }} showScore /><ConfidenceBadge confidence={{ level: "low", reason: "No unit found." }} /></div>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
