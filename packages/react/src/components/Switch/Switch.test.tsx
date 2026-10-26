import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Switch } from "./Switch.js";

describe("Switch", () => {
  it("is a labelled switch that toggles with click, Space and Enter", async () => {
    const fn = vi.fn();
    render(<Switch label="Email me when a run fails" onCheckedChange={fn} />);
    const sw = screen.getByRole("switch", { name: "Email me when a run fails" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(screen.getByText("Email me when a run fails"));
    expect(sw).toHaveAttribute("aria-checked", "true");
    sw.focus();
    await userEvent.keyboard(" ");
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("is controlled and respects disabled", async () => {
    const fn = vi.fn();
    render(<Switch label="Auto-approve" checked onCheckedChange={fn} disabled />);
    await userEvent.click(screen.getByRole("switch"));
    expect(fn).not.toHaveBeenCalled();
    expect(screen.getByRole("switch")).toBeChecked();
  });
  it("gets its name and description from a Field", () => {
    render(<Field label="Require approval" description="Runs pause until a reviewer approves"><Switch /></Field>);
    const sw = screen.getByRole("switch", { name: "Require approval" });
    expect(sw).toHaveAccessibleDescription("Runs pause until a reviewer approves");
  });
  it("has no axe violations", async () => {
    const { container } = render(<><Switch label="Enabled" description="Visible to the team" defaultChecked /><Switch aria-label="Compact" size="sm" /></>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
