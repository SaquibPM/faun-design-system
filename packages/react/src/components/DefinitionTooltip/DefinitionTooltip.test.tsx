import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { DefinitionTooltip } from "./DefinitionTooltip.js";

function Example() {
  return <p>Report your <DefinitionTooltip definition="Indirect emissions from the value chain, outside your own operations and purchased energy.">Scope 3</DefinitionTooltip> inventory.</p>;
}

describe("DefinitionTooltip", () => {
  it("shows the definition on keyboard focus, describes the term and closes on Escape", async () => {
    const { container } = render(<Example />);
    await userEvent.tab();
    const term = screen.getByRole("button", { name: "Scope 3" });
    expect(term).toHaveFocus();
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Indirect emissions from the value chain");
    expect(term).toHaveAttribute("aria-describedby");
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
  it("opens on hover", async () => {
    render(<Example />);
    await userEvent.hover(screen.getByRole("button", { name: "Scope 3" }));
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });
  it("a press pins the definition, a second press closes it", async () => {
    render(<Example />);
    const term = screen.getByRole("button", { name: "Scope 3" });
    term.focus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
