import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Accordion.js";

const Items = () => (
  <>
    <AccordionItem value="a"><AccordionTrigger description="Entities and period">Scope</AccordionTrigger><AccordionContent>Scope content</AccordionContent></AccordionItem>
    <AccordionItem value="b"><AccordionTrigger meta="12">Gaps</AccordionTrigger><AccordionContent>Gaps content</AccordionContent></AccordionItem>
    <AccordionItem value="c" disabled><AccordionTrigger>Locked</AccordionTrigger><AccordionContent>Locked content</AccordionContent></AccordionItem>
  </>
);

describe("Accordion", () => {
  it("single mode opens one section at a time, and has no axe violations", async () => {
    const { container } = render(<Accordion type="single" collapsible defaultValue="a"><Items /></Accordion>);
    expect(screen.getByRole("button", { name: /Scope/ })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("button", { name: /Gaps/ }));
    expect(screen.getByRole("button", { name: /Scope/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Gaps content")).toBeVisible();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("multiple mode keeps several open", async () => {
    render(<Accordion type="multiple"><Items /></Accordion>);
    await userEvent.click(screen.getByRole("button", { name: /Scope/ }));
    await userEvent.click(screen.getByRole("button", { name: /Gaps/ }));
    expect(screen.getByRole("button", { name: /Scope/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Gaps/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("supports arrow, Home and End navigation and skips disabled triggers", async () => {
    render(<Accordion type="single" collapsible><Items /></Accordion>);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: /Scope/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /Gaps/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /Scope/ })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("button", { name: /Gaps/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Gaps content")).toBeVisible();
  });

  it("Collapsible toggles with its trigger", async () => {
    render(<Collapsible><CollapsibleTrigger>Show filters</CollapsibleTrigger><CollapsibleContent>Filters</CollapsibleContent></Collapsible>);
    const t = screen.getByRole("button", { name: "Show filters" });
    expect(t).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(t);
    expect(screen.getByText("Filters")).toBeVisible();
  });
});
