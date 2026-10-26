import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "../Button/Button.js";
import { Popover, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger } from "./Popover.js";

function Example({ showClose = false }: { showClose?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild><Button>Factor details</Button></PopoverTrigger>
      <PopoverContent showClose={showClose} aria-label="Factor details">
        <PopoverHeader title="Natural gas" description="DEFRA 2025" />
        <PopoverBody><button type="button">Use factor</button></PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("opens from its trigger, exposes expanded state and has no axe violations", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Factor details" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Natural gas");
    expect(await axeViolations(dialog)).toEqual([]);
  });
  it("closes on Escape and returns focus to the trigger", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Factor details" });
    await userEvent.click(trigger);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("opens from the keyboard and offers a labelled close button", async () => {
    render(<Example showClose />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Popover caret and tone", () => {
  it("renders a caret and the inverse tone on request, still without axe violations", async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
        <PopoverContent arrow tone="inverse" align="end" aria-label="Hint"><PopoverHeader title="Saved filters" /></PopoverContent>
      </Popover>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Hint" });
    expect(dialog).toHaveAttribute("data-tone", "inverse");
    expect(dialog).toHaveAttribute("data-arrow");
    expect(dialog.querySelector(".faun-popover-arrow")).not.toBeNull();
    expect(await axeViolations(dialog)).toEqual([]);
  });
});
