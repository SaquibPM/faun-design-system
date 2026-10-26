import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { DropdownMenuItem } from "../Menu/Menu.js";
import { OverflowMenu } from "./OverflowMenu.js";

describe("OverflowMenu", () => {
  it("is a named menu button that opens a menu of items", async () => {
    const onEdit = vi.fn();
    const { container } = render(
      <OverflowMenu label="Actions for Scope 2 import">
        <DropdownMenuItem onSelect={onEdit}>Edit mapping</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
      </OverflowMenu>,
    );
    const trigger = screen.getByRole("button", { name: "Actions for Scope 2 import" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit mapping" }));
    expect(onEdit).toHaveBeenCalled();
  });
  it("opens with the keyboard, navigates with arrows and returns focus on Escape", async () => {
    render(<OverflowMenu label="Row actions"><DropdownMenuItem>One</DropdownMenuItem><DropdownMenuItem>Two</DropdownMenuItem></OverflowMenu>);
    const trigger = screen.getByRole("button", { name: "Row actions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const first = await screen.findByRole("menuitem", { name: "One" });
    expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Two" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
  it("switches icon with orientation and ties item height to size", async () => {
    const { container, rerender } = render(<OverflowMenu label="a"><DropdownMenuItem>x</DropdownMenuItem></OverflowMenu>);
    expect(container.querySelector('[data-faun-icon="more-horizontal"]')).not.toBeNull();
    rerender(<OverflowMenu label="a" orientation="vertical" size="sm"><DropdownMenuItem>x</DropdownMenuItem></OverflowMenu>);
    expect(container.querySelector('[data-faun-icon="more-vertical"]')).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "a" }));
    expect(await screen.findByRole("menu")).toHaveAttribute("data-size", "sm");
  });
});
