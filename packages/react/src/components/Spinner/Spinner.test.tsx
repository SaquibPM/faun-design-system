import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Spinner } from "./Spinner.js";

describe("Spinner", () => {
  it("is a status named Loading by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
  it("accepts a specific label", () => {
    render(<Spinner label="Drafting narrative" />);
    expect(screen.getByRole("status", { name: "Drafting narrative" })).toBeInTheDocument();
  });
  it("is hidden from assistive technology when label is null", () => {
    const { container } = render(<Spinner label={null} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
  it("exposes size and has no axe violations", async () => {
    const { container } = render(<Spinner size="xl" />);
    expect(container.firstElementChild).toHaveAttribute("data-size", "xl");
    expect(await axeViolations(container)).toEqual([]);
  });
});
