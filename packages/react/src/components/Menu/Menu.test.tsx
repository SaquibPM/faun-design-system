import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "../Button/Button.js";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "./Menu.js";

function Example({ onEdit = () => {}, onToggle = () => {} }: { onEdit?: () => void; onToggle?: (v: boolean) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Agent</DropdownMenuLabel>
        <DropdownMenuItem shortcut="⌘E" onSelect={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem description="Make a copy">Duplicate</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked onCheckedChange={(v) => onToggle(v === true)}>Pinned</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem intent="danger">Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens from the keyboard, focuses the first item and moves with arrows", async () => {
    render(<Example />);
    screen.getByRole("button", { name: "Actions" }).focus();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(screen.getByRole("menuitem", { name: /Edit/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Duplicate/ })).toHaveFocus();
    expect(await axeViolations(menu)).toEqual([]);
  });
  it("selects an item, closes and returns focus", async () => {
    const onEdit = vi.fn();
    render(<Example onEdit={onEdit} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("menuitem", { name: /Edit/ }));
    expect(onEdit).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("toggles checkbox items without closing", async () => {
    const onToggle = vi.fn();
    render(<Example onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const item = await screen.findByRole("menuitemcheckbox", { name: "Pinned" });
    expect(item).toHaveAttribute("aria-checked", "true");
    await userEvent.click(item);
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
  it("marks destructive items and closes on Escape", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menuitem", { name: "Archive" })).toHaveAttribute("data-intent", "danger");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("ContextMenu", () => {
  it("opens on context menu", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger><div>Node</div></ContextMenuTrigger>
        <ContextMenuContent><ContextMenuItem>Re-run from here</ContextMenuItem></ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("Node"));
    expect(await screen.findByRole("menuitem", { name: "Re-run from here" })).toBeInTheDocument();
  });
});
