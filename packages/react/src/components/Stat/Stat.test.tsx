import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Stat, StatGroup } from "./Stat.js";

describe("Stat", () => {
  it("shows label, figure and unit", () => {
    render(<Stat label="Scope 1 emissions" value="18,240" unit="tCO₂e" />);
    expect(screen.getByText("Scope 1 emissions")).toBeInTheDocument();
    expect(screen.getByText("18,240")).toBeInTheDocument();
    expect(screen.getByText("tCO₂e")).toBeInTheDocument();
  });
  it("speaks the change in words and carries sentiment", () => {
    const { container } = render(<Stat label="Scope 2" value="9,310" delta={{ value: "4.2%", direction: "down", sentiment: "good", label: "vs base year 2022" }} />);
    expect(screen.getByLabelText("down 4.2% vs base year 2022")).toBeInTheDocument();
    expect(container.querySelector(".faun-stat-delta")).toHaveAttribute("data-sentiment", "good");
  });
  it("says unchanged for a flat delta and draws no arrow", () => {
    const { container } = render(<Stat label="Coverage" value="96" unit="%" delta={{ value: "0%", direction: "flat" }} />);
    expect(screen.getByLabelText("unchanged 0%")).toBeInTheDocument();
    expect(container.querySelector(".faun-stat-delta svg")).toBeNull();
  });
  it("renders footnote, visual children and size", () => {
    const { container } = render(<Stat size="lg" label="Evidence coverage" value="91" unit="%" footnote="2,316 of 2,545 items"><div data-testid="meter" /></Stat>);
    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    expect(screen.getByTestId("meter")).toBeInTheDocument();
    expect(screen.getByText("2,316 of 2,545 items")).toBeInTheDocument();
  });
  it("StatGroup groups stats, sets min item width and has no axe violations", async () => {
    const { container } = render(
      <StatGroup aria-label="Emissions summary" minItemWidth="10rem">
        <Stat label="Scope 1" value="18,240" unit="tCO₂e" />
        <Stat label="Scope 2" value="9,310" unit="tCO₂e" />
      </StatGroup>,
    );
    const group = screen.getByRole("group", { name: "Emissions summary" });
    expect(group.style.getPropertyValue("--_min")).toBe("10rem");
    expect(group).toHaveAttribute("data-variant", "card");
    expect(await axeViolations(container)).toEqual([]);
  });
});
