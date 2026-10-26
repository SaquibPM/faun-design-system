import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { CommandPalette, type CommandPaletteItem } from "./CommandPalette.js";

function makeItems(onSelect = vi.fn()): CommandPaletteItem[] {
  return [
    { value: "csrd", label: "CSRD filing", description: "FY2026 statement", group: "Navigate", onSelect: () => onSelect("csrd") },
    { value: "scope3", label: "Scope 3 workspace", group: "Navigate", keywords: ["value chain"], onSelect: () => onSelect("scope3") },
    { value: "new-run", label: "Start a run", group: "Actions", shortcut: ["⌘", "N"], onSelect: () => onSelect("new-run") },
    { value: "archive", label: "Archive agent", group: "Actions", disabled: true },
  ];
}

function Harness({ onSelect, defaultOpen = true }: { onSelect?: ReturnType<typeof vi.fn>; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <CommandPalette open={open} onOpenChange={setOpen} items={makeItems(onSelect)} />;
}

describe("CommandPalette", () => {
  it("opens as a named dialog with a search box and grouped options", async () => {
    render(<Harness />);
    const dialog = await screen.findByRole("dialog", { name: "Command palette" });
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getByText("Navigate")).toBeInTheDocument();
    expect(await axeViolations(dialog)).toEqual([]);
  });
  it("filters by label and keyword and shows the empty message", async () => {
    render(<Harness />);
    await userEvent.type(await screen.findByRole("combobox"), "value chain");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: /Scope 3 workspace/ })).toBeInTheDocument();
    await userEvent.clear(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
  });
  it("runs the highlighted command on Enter and closes", async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await userEvent.type(await screen.findByRole("combobox"), "start");
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("new-run");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("does not run disabled commands", async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await userEvent.click(await screen.findByRole("option", { name: /Archive agent/ }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  it("closes on Escape", async () => {
    render(<Harness />);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("toggles with Ctrl+K and Cmd+K when hotkey is on", async () => {
    render(<Harness defaultOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
  it("ignores the hotkey when turned off", async () => {
    render(<CommandPalette items={makeItems()} hotkey={false} open={false} onOpenChange={() => { throw new Error("should not toggle"); }} />);
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
