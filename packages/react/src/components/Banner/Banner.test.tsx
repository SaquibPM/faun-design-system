import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Banner } from "./Banner.js";

describe("Banner", () => {
  it("is an alert for danger and warning, a status otherwise", () => {
    const { rerender } = render(<Banner tone="danger" title="Ledger import failed" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Ledger import failed");
    rerender(<Banner tone="warning" title="Estimated" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    for (const tone of ["info", "success", "attention"] as const) {
      rerender(<Banner tone={tone} title="Note" />);
      expect(screen.getByRole("status")).toHaveAttribute("data-tone", tone);
    }
  });
  it("exposes the variant and renders title, text and actions", () => {
    render(<Banner variant="page" title="Deadline" actions={<button type="button">Review</button>}>Due on 24 October.</Banner>);
    expect(screen.getByRole("status")).toHaveAttribute("data-variant", "page");
    expect(screen.getByText("Due on 24 October.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument();
  });
  it("dismisses only when onDismiss is given", async () => {
    const fn = vi.fn();
    const { rerender } = render(<Banner title="Note" />);
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
    rerender(<Banner title="Note" onDismiss={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("hides the tone icon from assistive tech and allows hiding it", () => {
    const { container, rerender } = render(<Banner title="Note" />);
    expect(container.querySelector(".faun-banner-icon")).toHaveAttribute("aria-hidden", "true");
    rerender(<Banner title="Note" icon={null} />);
    expect(container.querySelector(".faun-banner-icon")).toBeNull();
  });
  it("has no axe violations", async () => {
    const { container } = render(<div><Banner tone="danger" title="Failed" onDismiss={() => {}}>Row 418 has no unit.</Banner><Banner tone="success" title="Done" /></div>);
    expect(await axeViolations(container)).toEqual([]);
  });
  it("high contrast and low contrast keep the tone in the icon and a hidden label, and expose a timestamp", () => {
    const { rerender } = render(<Banner tone="danger" contrast="high" title="Ledger import failed" timestamp={<time dateTime="2026-10-22T09:00">2 min ago</time>}>Row 418 has no unit.</Banner>);
    const el = screen.getByRole("alert");
    expect(el).toHaveAttribute("data-contrast", "high");
    expect(el).toHaveTextContent("Error: Ledger import failed");
    expect(screen.getByText("2 min ago")).toBeInTheDocument();
    rerender(<Banner tone="danger" title="Ledger import failed" />);
    expect(screen.getByRole("alert")).toHaveAttribute("data-contrast", "low");
  });
  it("an actionable banner calls onAction from a labelled button", async () => {
    const fn = vi.fn();
    const { container } = render(<Banner tone="warning" contrast="high" title="Sync paused" actionLabel="Retry import" onAction={fn} onDismiss={() => {}}>3 sources failed.</Banner>);
    await userEvent.click(screen.getByRole("button", { name: "Retry import" }));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await axeViolations(container)).toEqual([]);
  });
});
