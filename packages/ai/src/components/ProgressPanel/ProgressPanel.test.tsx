import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { ProgressPanel, type ProgressStep } from "./ProgressPanel.js";

const steps: ProgressStep[] = [
  { id: "1", title: "Collect activity data", state: "done", elapsedMs: 256_000 },
  { id: "2", title: "Apply emission factors", state: "in_progress", detail: "212 of 340 suppliers", elapsedMs: 130_000 },
  { id: "3", title: "Draft the E1-6 narrative", state: "pending" },
  { id: "4", title: "Ask for approval", state: "pending" },
];

describe("ProgressPanel", () => {
  it("is a named region with the title, the current step, elapsed time and progress", () => {
    render(<ProgressPanel title="Drafting the ESRS E1 disclosure" steps={steps} elapsedMs={392_000} />);
    const region = screen.getByRole("region", { name: "Drafting the ESRS E1 disclosure" });
    expect(within(region).getByText("Step 2 of 4: Apply emission factors")).toBeInTheDocument();
    expect(within(region).getByText("6 min 32 s")).toBeInTheDocument();
    const bar = within(region).getByRole("progressbar", { name: "Task progress" });
    expect(bar).toBeInTheDocument();
    expect(within(region).getByText("1 of 4 steps done")).toBeInTheDocument();
  });
  it("lists every step with a status word and marks the current one", () => {
    render(<ProgressPanel title="Task" steps={steps} />);
    const list = screen.getByRole("list", { name: "Steps" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(within(items[0]!).getByText("Done")).toBeInTheDocument();
    expect(within(items[1]!).getByText(/in progress|running/i)).toBeInTheDocument();
    expect(within(items[1]!).getByText("212 of 340 suppliers")).toBeInTheDocument();
  });
  it("derives the overall state: failed, waiting for a person, completed", () => {
    const { rerender } = render(<ProgressPanel title="Task" steps={[{ id: "a", title: "A", state: "failed" }]} />);
    expect(screen.getByRole("region")).toHaveAttribute("data-run-state", "failed");
    rerender(<ProgressPanel title="Task" steps={[{ id: "a", title: "A", state: "awaiting_human" }]} />);
    expect(screen.getByRole("region")).toHaveAttribute("data-run-state", "awaiting_approval");
    rerender(<ProgressPanel title="Task" steps={[{ id: "a", title: "A", state: "done" }, { id: "b", title: "B", state: "skipped" }]} />);
    expect(screen.getByRole("region")).toHaveAttribute("data-run-state", "completed");
    expect(screen.getAllByText("All 2 steps done").length).toBeGreaterThan(0);
  });
  it("folds the step list but keeps the current step and progress bar", async () => {
    render(<ProgressPanel title="Task" steps={steps} />);
    const toggle = screen.getByRole("button", { name: "Task" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list", { name: "Steps" })).not.toBeInTheDocument();
    expect(screen.getByText("Step 2 of 4: Apply emission factors")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("list", { name: "Steps" })).toBeInTheDocument();
  });
  it("can start folded and reports open changes", async () => {
    const onOpenChange = vi.fn();
    render(<ProgressPanel title="Task" steps={steps} defaultOpen={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole("list", { name: "Steps" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Task" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
  it("docked: not collapsible, has a Close button, closes on Escape from inside, and takes focus", async () => {
    const onClose = vi.fn();
    render(<ProgressPanel variant="docked" title="Task" steps={steps} onClose={onClose} />);
    expect(screen.queryByRole("button", { name: "Task" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Task" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Close progress panel" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
  it("gives focus back when a docked panel unmounts", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const { unmount } = render(<ProgressPanel variant="docked" title="Task" steps={steps} />);
    expect(opener).not.toHaveFocus();
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
  it("does not take focus when inline", () => {
    render(<ProgressPanel title="Task" steps={steps} />);
    expect(screen.getByRole("heading", { name: "Task" })).not.toHaveFocus();
  });
  it("announces a change of current step politely, and says nothing on mount", () => {
    const { rerender } = render(<ProgressPanel title="Task" steps={steps} />);
    const live = document.querySelector("[data-announce]") as HTMLElement;
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent("");
    const next = steps.map((s, i) => (i === 1 ? { ...s, state: "done" as const } : i === 2 ? { ...s, state: "in_progress" as const } : s));
    act(() => { rerender(<ProgressPanel title="Task" steps={next} />); });
    expect(live).toHaveTextContent("Step 3 of 4, Draft the E1-6 narrative, in progress");
  });
  it("honours the heading level", () => {
    render(<ProgressPanel title="Task" steps={steps} headingLevel={4} />);
    expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
  });
  it("has no axe violations in inline, folded, docked and failed forms", async () => {
    const { container, rerender } = render(<ProgressPanel title="Task" steps={steps} elapsedMs={5000} />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<ProgressPanel title="Task" steps={steps} defaultOpen={false} />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<ProgressPanel variant="docked" title="Task" steps={steps} onClose={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<ProgressPanel title="Task" steps={[{ id: "x", title: "Fetch", state: "failed", detail: "No factor found" }]} />);
    expect(await axeViolations(container)).toEqual([]);
  });
  it("ignores Escape that does not come from inside (portalled popups)", () => {
    const onClose = vi.fn();
    render(<ProgressPanel variant="docked" title="Task" steps={steps} onClose={onClose} />);
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
