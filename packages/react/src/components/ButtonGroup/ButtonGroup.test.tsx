import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "../Button/Button.js";
import { ButtonGroup } from "./ButtonGroup.js";

describe("ButtonGroup", () => {
  it("is a named group of buttons and exposes its layout", async () => {
    const { container } = render(
      <ButtonGroup aria-label="Review actions" layout="joined" equal stack="narrow" align="start">
        <Button>Cancel</Button>
        <Button variant="solid" intent="accent">Approve</Button>
      </ButtonGroup>,
    );
    const g = screen.getByRole("group", { name: "Review actions" });
    expect(g).toHaveAttribute("data-layout", "joined");
    expect(g).toHaveAttribute("data-equal");
    expect(g).toHaveAttribute("data-stack", "narrow");
    expect(g).toHaveAttribute("data-align", "start");
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(await axeViolations(container)).toEqual([]);
  });
  it("defaults to a set aligned to the end", () => {
    render(<ButtonGroup aria-label="g"><Button>One</Button></ButtonGroup>);
    const g = screen.getByRole("group");
    expect(g).toHaveAttribute("data-layout", "set");
    expect(g).toHaveAttribute("data-align", "end");
  });
});
