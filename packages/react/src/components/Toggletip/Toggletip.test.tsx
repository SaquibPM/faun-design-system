import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Toggletip } from "./Toggletip.js";

function Example() {
  return (
    <p>
      Confidence score <Toggletip label="About the confidence score" title="How the score works" actions={<a href="#method">Read the method</a>}>Share of inputs backed by metered or supplier data.</Toggletip>
    </p>
  );
}

describe("Toggletip", () => {
  it("is a labelled button that reports expanded state and opens on click", async () => {
    render(<Example />);
    const btn = screen.getByRole("button", { name: "About the confidence score" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    const panel = await screen.findByRole("dialog", { name: "About the confidence score" });
    expect(panel).toHaveTextContent("Share of inputs backed by metered or supplier data.");
    expect(await axeViolations(panel)).toEqual([]);
  });
  it("opens with Enter and Space, holds a link, closes on Escape and returns focus", async () => {
    render(<Example />);
    const btn = screen.getByRole("button", { name: "About the confidence score" });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("link", { name: "Read the method" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(btn).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
  it("has a default name and no axe violations when closed", async () => {
    const { container } = render(<Toggletip>Short note</Toggletip>);
    expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
