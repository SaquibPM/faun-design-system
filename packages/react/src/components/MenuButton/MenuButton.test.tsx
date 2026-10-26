import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { DropdownMenuItem } from "../Menu/Menu.js";
import { ComboButton, MenuButton } from "./MenuButton.js";

describe("MenuButton", () => {
  it("opens a menu from a labelled button and selects an item", async () => {
    const onPick = vi.fn();
    const { container } = render(<MenuButton menu={<><DropdownMenuItem onSelect={onPick}>CSV</DropdownMenuItem><DropdownMenuItem>XLSX</DropdownMenuItem></>}>Export</MenuButton>);
    const b = screen.getByRole("button", { name: "Export" });
    expect(b).toHaveAttribute("aria-haspopup", "menu");
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(b);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "CSV" }));
    expect(onPick).toHaveBeenCalled();
  });
  it("matches menu item height to the button size", async () => {
    render(<MenuButton size="lg" menu={<DropdownMenuItem>CSV</DropdownMenuItem>}>Export</MenuButton>);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(await screen.findByRole("menu")).toHaveAttribute("data-size", "lg");
  });
  it("maps xs and xl to the nearest menu size", async () => {
    render(<MenuButton size="xs" menu={<DropdownMenuItem>CSV</DropdownMenuItem>}>Export</MenuButton>);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(await screen.findByRole("menu")).toHaveAttribute("data-size", "sm");
  });
});

describe("ComboButton", () => {
  it("runs the primary action from the label button and opens alternatives from the chevron", async () => {
    const run = vi.fn();
    const alt = vi.fn();
    const { container } = render(<ComboButton onClick={run} menu={<DropdownMenuItem onSelect={alt}>Run with sample data</DropdownMenuItem>}>Run now</ComboButton>);
    expect(screen.getByRole("group", { name: "Run now" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Run now" }));
    expect(run).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "More actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Run with sample data" }));
    expect(alt).toHaveBeenCalled();
    expect(run).toHaveBeenCalledTimes(1);
  });
  it("takes a custom chevron name and disables both halves", () => {
    render(<ComboButton disabled menuLabel="Run options" menu={<DropdownMenuItem>x</DropdownMenuItem>}>Run now</ComboButton>);
    expect(screen.getByRole("button", { name: "Run now" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Run options" })).toBeDisabled();
  });
});
