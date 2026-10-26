import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconAdd } from "@faun-ds/icons";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "./Button.js";

describe("Button", () => {
  it("is a type=button by default and exposes its variant, intent and size", () => {
    render(<Button variant="solid" intent="accent" size="lg">Run workflow</Button>);
    const b = screen.getByRole("button", { name: "Run workflow" });
    expect(b).toHaveAttribute("type", "button");
    expect(b).toHaveAttribute("data-variant", "solid");
    expect(b).toHaveAttribute("data-intent", "accent");
    expect(b).toHaveAttribute("data-size", "lg");
  });
  it("calls onClick, and not when disabled", async () => {
    const fn = vi.fn();
    const { rerender } = render(<Button onClick={fn}>Save</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledTimes(1);
    rerender(<Button onClick={fn} disabled>Save</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("announces loading, keeps its name and blocks activation", async () => {
    const fn = vi.fn();
    render(<Button loading onClick={fn}>Approve</Button>);
    const b = screen.getByRole("button", { name: "Approve" });
    expect(b).toHaveAttribute("aria-busy", "true");
    await userEvent.click(b);
    expect(fn).not.toHaveBeenCalled();
  });
  it("renders a link with asChild", () => {
    render(<Button asChild variant="ghost"><a href="/runs">View runs</a></Button>);
    const a = screen.getByRole("link", { name: "View runs" });
    expect(a).toHaveClass("faun-button");
    expect(a).not.toHaveAttribute("type");
  });
  it("hides decorative icons from assistive tech and has no axe violations", async () => {
    const { container } = render(<Button leadingIcon={<IconAdd />}>Add agent</Button>);
    expect(container.querySelector(".faun-button-icon")).toHaveAttribute("aria-hidden", "true");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("supports xs and xl sizes", () => {
    render(<><Button size="xs">Tiny</Button><Button size="xl">Huge</Button></>);
    expect(screen.getByRole("button", { name: "Tiny" })).toHaveAttribute("data-size", "xs");
    expect(screen.getByRole("button", { name: "Huge" })).toHaveAttribute("data-size", "xl");
  });
  it("shows an outcome icon and adds the status label to the name", async () => {
    const { container, rerender } = render(<Button status="success" statusLabel="Saved" leadingIcon={<IconAdd />}>Save</Button>);
    expect(screen.getByRole("button", { name: /^Save\s*Saved$/ })).toHaveAttribute("data-status", "success");
    expect(container.querySelector('[data-faun-icon="check"]')).not.toBeNull();
    expect(container.querySelector('[data-faun-icon="add"]')).toBeNull();
    rerender(<Button status="error" statusLabel="Save failed">Save</Button>);
    expect(container.querySelector('[data-faun-icon="status-danger"]')).not.toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("lets a long label wrap", () => {
    render(<Button wrap>A very long label that should wrap</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-wrap");
  });
});
