import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Card, CardBody, CardFooter, CardHeader } from "./Card.js";

describe("Card", () => {
  it("exposes variant and padding", () => {
    const { container } = render(<Card variant="muted" padding="lg">x</Card>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass("faun-card");
    expect(el).toHaveAttribute("data-variant", "muted");
    expect(el).toHaveAttribute("data-padding", "lg");
  });
  it("renders a heading at the chosen level with description and actions", () => {
    render(<Card><CardHeader title="Workflow" description="9 steps" level={2} actions={<button type="button">Open graph</button>} /><CardBody>Body</CardBody><CardFooter divided>Foot</CardFooter></Card>);
    expect(screen.getByRole("heading", { level: 2, name: "Workflow" })).toBeInTheDocument();
    expect(screen.getByText("9 steps")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open graph" })).toBeInTheDocument();
    expect(screen.getByText("Foot")).toHaveAttribute("data-divided");
  });
  it("becomes a link or button with asChild and stays operable", async () => {
    const fn = vi.fn();
    render(<Card asChild variant="interactive"><button type="button" onClick={fn}>CSRD Filing Orchestrator</button></Card>);
    const b = screen.getByRole("button", { name: "CSRD Filing Orchestrator" });
    expect(b).toHaveClass("faun-card");
    await userEvent.click(b);
    expect(fn).toHaveBeenCalled();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Card><CardHeader title="Emissions by scope" /><CardBody>Scope 1 · 3,213 tCO₂e</CardBody></Card>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
