import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { actors } from "../../utils/fixtures.js";
import { ActorChip } from "./ActorChip.js";

describe("ActorChip", () => {
  it("names the actor and says what kind it is, even without a visible kind", () => {
    render(<ActorChip actor={actors.scope3} />);
    expect(screen.getByText("Scope 3 Sub-agent")).toBeInTheDocument();
    expect(screen.getByText(/Sub-agent, Sub-agent · Value chain/)).toHaveClass("faun-visually-hidden");
  });
  it("separates machines from people by data attribute, icon and initials, not only colour", async () => {
    const { container, rerender } = render(<ActorChip actor={actors.orchestrator} />);
    const chip = container.firstElementChild!;
    expect(chip).toHaveAttribute("data-tone", "machine");
    expect(chip.querySelector("svg")).not.toBeNull();
    rerender(<ActorChip actor={actors.priya} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "human");
    expect(await screen.findByText("PR")).toBeInTheDocument();
    rerender(<ActorChip actor={actors.scheduler} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "system");
  });
  it("shows the kind and role in words on request", () => {
    render(<ActorChip actor={actors.priya} showKind showRole />);
    expect(screen.getByText("Person", { selector: ".faun-actor-chip-kind" })).toBeInTheDocument();
    expect(screen.getByText("Sustainability lead", { selector: ".faun-actor-chip-role" })).toBeInTheDocument();
  });
  it("supports size and forwards props and ref", () => {
    let node: HTMLSpanElement | null = null;
    render(<ActorChip ref={(n) => { node = n; }} size="sm" actor={actors.calc} data-testid="chip" />);
    expect(screen.getByTestId("chip")).toHaveAttribute("data-size", "sm");
    expect(node).toBe(screen.getByTestId("chip"));
  });
  it("has no axe violations for every kind", async () => {
    const { container } = render(<div>{Object.values(actors).map((a) => <ActorChip key={a.id} actor={a} showKind showRole />)}</div>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
