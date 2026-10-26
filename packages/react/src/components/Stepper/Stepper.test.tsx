import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Stepper } from "./Stepper.js";

const steps = [{ label: "Scope" }, { label: "Collect data" }, { label: "Review", state: "awaiting-human" as const, description: "Waiting for J. Rivera" }, { label: "Publish" }];

describe("Stepper", () => {
  it.each(["horizontal", "vertical"] as const)("%s has no axe violations", async (orientation) => {
    const { container } = render(<Stepper steps={steps} current={1} orientation={orientation} aria-label="Filing progress" />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("derives states, marks the current step and exposes status text", () => {
    render(<Stepper steps={steps} current={1} aria-label="Filing progress" />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((i) => i.getAttribute("data-state"))).toEqual(["complete", "current", "awaiting-human", "upcoming"]);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).toHaveTextContent("Completed");
    expect(items[2]).toHaveTextContent("Waiting for a person");
    expect(screen.getByRole("list", { name: "Filing progress" })).toBeInTheDocument();
  });

  it("makes selectable steps keyboard-operable", async () => {
    const onSelect = vi.fn();
    render(<Stepper steps={[{ label: "Scope", onSelect }, { label: "Collect" }]} current={1} />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: /Scope/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("writes the state under each step when showStatus is on, with and without error", async () => {
    const { container } = render(<Stepper showStatus steps={[{ label: "Scope" }, { label: "Collect", state: "error", description: "2 sources failed" }, { label: "Publish" }]} current={1} />);
    const vis = [...container.querySelectorAll(".faun-step-status[data-visible]")].map((e) => e.textContent);
    expect(vis).toEqual(["Completed", "Needs attention", "Not started"]);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("a disabled step is a disabled button reading Unavailable", async () => {
    const onSelect = vi.fn();
    render(<Stepper steps={[{ label: "Scope", onSelect: () => {} }, { label: "Review", onSelect, disabled: true }]} current={0} />);
    const b = screen.getByRole("button", { name: /Review/ });
    expect(b).toBeDisabled();
    expect(b).toHaveTextContent("Unavailable");
    await userEvent.click(b);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
