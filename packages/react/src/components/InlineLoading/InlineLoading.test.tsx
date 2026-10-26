import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { InlineLoading } from "./InlineLoading.js";

afterEach(() => vi.useRealTimers());

describe("InlineLoading", () => {
  it("announces its text politely and shows a spinner while active", async () => {
    const { container } = render(<InlineLoading status="active" description="Saving…" />);
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("Saving…");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(container.querySelector(".faun-spinner")).not.toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("shows a check when finished and an alert when failed", () => {
    const { rerender, container } = render(<InlineLoading status="finished" description="Saved" />);
    expect(container.querySelector('[data-faun-icon="check"]')).not.toBeNull();
    rerender(<InlineLoading status="error" description="Save failed" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Save failed");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });
  it("renders nothing visible when inactive but keeps the live region mounted", () => {
    const { container } = render(<InlineLoading status="inactive" description="hidden" />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(container.querySelector("svg")).toBeNull();
  });
  it("calls onSuccess once after the delay when finished", () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    const { rerender } = render(<InlineLoading status="active" onSuccess={onSuccess} />);
    rerender(<InlineLoading status="finished" description="Saved" onSuccess={onSuccess} successDelay={1500} />);
    act(() => { vi.advanceTimersByTime(1499); });
    expect(onSuccess).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2); });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
  it("does not fire onSuccess if the status changes first", () => {
    vi.useFakeTimers();
    const onSuccess = vi.fn();
    const { rerender } = render(<InlineLoading status="finished" onSuccess={onSuccess} />);
    rerender(<InlineLoading status="active" onSuccess={onSuccess} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
