import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "../Button/Button.js";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "./Dialog.js";

function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Archive agent</Button></DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader title="Archive CSRD Filing Orchestrator?" description="It stops running and leaves the catalogue. Past runs stay in the audit trail." />
        <DialogBody>Three workflows reference this agent.</DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button>Cancel</Button></DialogClose>
          <Button variant="solid" intent="danger">Archive</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens with an accessible name and description, traps focus and closes on Escape, returning focus", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Archive agent" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Archive CSRD Filing Orchestrator?" });
    expect(dialog).toHaveAccessibleDescription(/stops running/);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(await axeViolations(dialog)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("has a labelled close button", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Archive agent" }));
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

function stubScroll(client: number, scroll: number) {
  const c = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
  const s = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => client });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => scroll });
  return () => {
    if (c) Object.defineProperty(HTMLElement.prototype, "clientHeight", c); else delete (HTMLElement.prototype as any).clientHeight;
    if (s) Object.defineProperty(HTMLElement.prototype, "scrollHeight", s); else delete (HTMLElement.prototype as any).scrollHeight;
  };
}

describe("Dialog sizes and variants", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)("size %s is set on the panel", async (size) => {
    render(<Dialog defaultOpen><DialogContent size={size}><DialogHeader title="Sized" /></DialogContent></Dialog>);
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-size", size);
  });
  it("danger variant adds a labelled danger icon to the header and no axe violations", async () => {
    render(<Dialog defaultOpen><DialogContent variant="danger" size="sm"><DialogHeader title="Delete the FY2022 snapshot?" description="Restatements that compare to it will lose their baseline." /><DialogFooter><DialogClose asChild><Button>Cancel</Button></DialogClose><Button variant="solid" intent="danger">Delete snapshot</Button></DialogFooter></DialogContent></Dialog>);
    const dialog = await screen.findByRole("dialog", { name: "Delete the FY2022 snapshot?" });
    expect(dialog).toHaveAttribute("data-variant", "danger");
    expect(within(dialog).getByRole("img", { name: "Danger" })).toBeInTheDocument();
    expect(await axeViolations(dialog)).toEqual([]);
  });
  it("passive variant is closable with the close button and has no required footer", async () => {
    render(<Dialog defaultOpen><DialogContent variant="passive"><DialogHeader title="How emissions are calculated" /><DialogBody>Activity data multiplied by an emission factor.</DialogBody></DialogContent></Dialog>);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("data-variant", "passive");
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("a body that overflows becomes a focusable labelled region; a short one does not", async () => {
    const restore = stubScroll(100, 400);
    const { unmount } = render(<Dialog defaultOpen><DialogContent><DialogHeader title="Long" /><DialogBody scrollLabel="Methodology">Long text</DialogBody></DialogContent></Dialog>);
    const region = await screen.findByRole("region", { name: "Methodology" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAttribute("data-scroll", "start");
    region.focus();
    expect(region).toHaveFocus();
    expect(await axeViolations(region)).toEqual([]);
    unmount();
    restore();
    render(<Dialog defaultOpen><DialogContent><DialogHeader title="Short" /><DialogBody>Short</DialogBody></DialogContent></Dialog>);
    await screen.findByRole("dialog");
    expect(screen.queryByRole("region")).toBeNull();
  });
});
