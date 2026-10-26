import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { DataQualityCell, type DataQualityState } from "./DataQualityCell.js";

describe("DataQualityCell", () => {
  it.each<[DataQualityState, string, string]>([
    ["actual", "Actual", "success"],
    ["evidenced", "Evidenced", "success"],
    ["estimated", "Estimated", "warning"],
    ["partial", "Partial", "warning"],
    ["missing", "Missing", "danger"],
    ["gap", "Gap", "danger"],
  ])("%s uses the data-quality status map: label %s, tone %s", (state, label, tone) => {
    const { container } = render(<DataQualityCell state={state} value="1,200" />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(container.querySelector(".faun-badge")).toHaveAttribute("data-tone", tone);
    expect(container.querySelector(".faun-badge svg")).not.toBeNull();
  });

  it("shows the figure, unit and source", () => {
    render(<DataQualityCell state="evidenced" value="18,240" unit="tCO₂e" source="Utility invoices, 2025" />);
    expect(screen.getByText("18,240")).toBeInTheDocument();
    expect(screen.getByText("tCO₂e")).toBeInTheDocument();
    expect(screen.getByText("Utility invoices, 2025")).toBeInTheDocument();
  });

  it("shows a dash with a spoken label when there is no value", () => {
    render(<DataQualityCell state="missing" />);
    expect(screen.getByText("No value")).toBeInTheDocument();
    expect(screen.getByText("Missing")).toBeInTheDocument();
  });

  it("keeps a real zero as a value", () => {
    render(<DataQualityCell state="actual" value="0" unit="tCO₂e" />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("No value")).not.toBeInTheDocument();
  });

  it("flags numeric alignment and has no axe violations", async () => {
    const { container } = render(<DataQualityCell numeric state="estimated" value="9,310" unit="tCO₂e" />);
    expect(container.firstElementChild).toHaveAttribute("data-numeric");
    expect(await axeViolations(container)).toEqual([]);
  });
});
