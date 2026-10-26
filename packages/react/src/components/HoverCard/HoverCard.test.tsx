import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard.js";

function Example({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <HoverCard openDelay={0} closeDelay={0} defaultOpen={defaultOpen}>
      <HoverCardTrigger asChild><a href="#agent">CSRD Narrative Agent</a></HoverCardTrigger>
      <HoverCardContent size="sm"><strong>CSRD Narrative Agent</strong><span>Drafts ESRS E1-6 disclosures from approved ledger data.</span></HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  it("is closed until the trigger is focused", async () => {
    render(<Example />);
    expect(screen.queryByText(/Drafts ESRS/)).not.toBeInTheDocument();
    await userEvent.tab();
    expect(await screen.findByText(/Drafts ESRS/)).toBeInTheDocument();
  });
  it("opens on hover and closes when the pointer leaves", async () => {
    render(<Example />);
    const trigger = screen.getByRole("link", { name: "CSRD Narrative Agent" });
    await userEvent.hover(trigger);
    expect(await screen.findByText(/Drafts ESRS/)).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.queryByText(/Drafts ESRS/)).not.toBeInTheDocument();
  });
  it("exposes size and the Faun class, and has no axe violations", async () => {
    const { baseElement } = render(<Example defaultOpen />);
    const card = baseElement.querySelector(".faun-hover-card")!;
    expect(card).toHaveAttribute("data-size", "sm");
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});
