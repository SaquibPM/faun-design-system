import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { EmptyState } from "./EmptyState.js";

describe("EmptyState", () => {
  it("renders a heading, description and actions", async () => {
    const fn = vi.fn();
    render(<EmptyState title="No filings yet" description="Start a filing." action={<button type="button" onClick={fn}>New filing</button>} secondaryAction={<button type="button">Browse templates</button>} />);
    expect(screen.getByRole("heading", { level: 2, name: "No filings yet" })).toBeInTheDocument();
    expect(screen.getByText("Start a filing.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "New filing" }));
    expect(fn).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Browse templates" })).toBeInTheDocument();
  });
  it("exposes kind and size and honours the heading level", () => {
    const { container } = render(<EmptyState kind="error" size="sm" level={3} title="Couldn't load" />);
    expect(container.firstElementChild).toHaveAttribute("data-kind", "error");
    expect(container.firstElementChild).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
  it("shows a default visual per kind and hides it from assistive tech", () => {
    const { container, rerender } = render(<EmptyState kind="first-use" title="t" />);
    expect(container.querySelector(".faun-empty-art")).toBeInTheDocument();
    rerender(<EmptyState kind="no-permission" title="t" />);
    expect(container.querySelector(".faun-empty-art")).toBeNull();
    expect(container.querySelector(".faun-empty-visual")).toHaveAttribute("aria-hidden", "true");
  });
  it("accepts a custom icon", () => {
    const { container } = render(<EmptyState title="t" icon={<svg data-testid="custom" />} />);
    expect(container.querySelector("[data-testid=custom]")).toBeInTheDocument();
  });
  it("has no axe violations for every kind", async () => {
    const { container } = render(<div>{(["first-use", "no-results", "error", "no-permission"] as const).map((k) => <EmptyState key={k} kind={k} level={3} title={k} description="d" action={<button type="button">Go</button>} />)}</div>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
