import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "../Button/Button.js";
import { Tooltip, TooltipProvider } from "./Tooltip.js";

describe("Tooltip", () => {
  it("shows on keyboard focus and describes the trigger", async () => {
    render(<Tooltip content="Export the evidence package" delayDuration={0}><Button>Export</Button></Tooltip>);
    await userEvent.tab();
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Export the evidence package");
    expect(screen.getByRole("button", { name: "Export" })).toHaveAccessibleDescription("Export the evidence package");
  });
  it("shows on hover and hides on Escape", async () => {
    render(<Tooltip content="Copy run ID" delayDuration={0}><Button>Copy</Button></Tooltip>);
    await userEvent.hover(screen.getByRole("button"));
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
  it("renders a shortcut after the content", async () => {
    render(<Tooltip content="Search" shortcut="⌘K" defaultOpen><Button>Search</Button></Tooltip>);
    expect((await screen.findAllByText("⌘K")).length).toBeGreaterThan(0);
  });
  it("renders only the trigger when disabled or empty", async () => {
    const { rerender } = render(<Tooltip content="Hint" disabled delayDuration={0}><Button>A</Button></Tooltip>);
    await userEvent.hover(screen.getByRole("button"));
    expect(screen.queryByRole("tooltip")).toBeNull();
    rerender(<Tooltip content="" delayDuration={0}><Button>A</Button></Tooltip>);
    await userEvent.hover(screen.getByRole("button"));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
  it("works under TooltipProvider and has no axe violations", async () => {
    const { baseElement } = render(<TooltipProvider><Tooltip content="Archive agent" defaultOpen><Button>Archive</Button></Tooltip></TooltipProvider>);
    await screen.findByRole("tooltip");
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});
