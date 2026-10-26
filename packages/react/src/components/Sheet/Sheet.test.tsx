import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "../Button/Button.js";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "./Sheet.js";

function Example({ modal = true }: { modal?: boolean }) {
  return (
    <>
      <Sheet modal={modal}>
        <SheetTrigger asChild><Button>Open datapoint</Button></SheetTrigger>
        <SheetContent side="right" size="sm">
          <SheetHeader title="Gross Scope 1" description="FY2026" />
          <SheetBody>3,212.6 tCO₂e</SheetBody>
          <SheetFooter><SheetClose asChild><Button>Done</Button></SheetClose></SheetFooter>
        </SheetContent>
      </Sheet>
      <button type="button">Outside</button>
    </>
  );
}

describe("Sheet", () => {
  it("opens as a named dialog with focus inside, closes on Escape and returns focus", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open datapoint" });
    await userEvent.click(trigger);
    const sheet = await screen.findByRole("dialog", { name: "Gross Scope 1" });
    expect(sheet).toHaveAttribute("data-side", "right");
    expect(sheet).toContainElement(document.activeElement as HTMLElement);
    expect(await axeViolations(sheet)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("closes from a footer action and the close button", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Open datapoint" }));
    await userEvent.click(await screen.findByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open datapoint" }));
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("non-modal inspector leaves the page interactive and stays open on outside clicks", async () => {
    render(<Example modal={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Open datapoint" }));
    const sheet = await screen.findByRole("dialog");
    expect(sheet).not.toHaveAttribute("data-modal");
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
