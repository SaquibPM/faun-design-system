import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { SkipLink } from "./SkipLink.js";

function Page() {
  return (
    <div>
      <SkipLink href="#content" />
      <header><a href="#home">Home</a></header>
      <main id="content" tabIndex={-1}><h1>Filings</h1></main>
    </div>
  );
}

describe("SkipLink", () => {
  it("is the first thing reached by Tab and has a default name", async () => {
    render(<Page />);
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveFocus();
  });
  it("moves focus to the target when activated", async () => {
    render(<Page />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("main")).toHaveFocus();
  });
  it("takes a custom label and has no axe violations", async () => {
    const { container } = render(<SkipLink href="#table">Skip to the filings table</SkipLink>);
    expect(screen.getByRole("link", { name: "Skip to the filings table" })).toHaveAttribute("href", "#table");
    expect(await axeViolations(container)).toEqual([]);
  });
});
