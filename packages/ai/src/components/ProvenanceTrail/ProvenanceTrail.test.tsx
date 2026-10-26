import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { NOW, provenance } from "../../utils/fixtures.js";
import { ProvenanceTrail } from "./ProvenanceTrail.js";

describe("ProvenanceTrail", () => {
  it("is an ordered list from source to reported value", () => {
    render(<ProvenanceTrail nodes={provenance} now={NOW} aria-label="Lineage" />);
    const list = screen.getByRole("list", { name: "Lineage" });
    expect(list.tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveAttribute("data-kind", "source");
    expect(items[5]).toHaveAttribute("data-kind", "datapoint");
    expect(items[5]).toHaveAttribute("data-last");
  });
  it("names each step's kind and shows the value it carried", () => {
    render(<ProvenanceTrail nodes={provenance} now={NOW} />);
    for (const kind of ["Source", "Extraction", "Review", "Emission factor", "Calculation", "Reported value"]) expect(screen.getAllByText(kind).length).toBeGreaterThan(0);
    expect(screen.getByText("1,284 MWh")).toBeInTheDocument();
    expect(screen.getByText("0.716 tCO₂e/MWh")).toBeInTheDocument();
    expect(screen.getByText("919 tCO₂e")).toBeInTheDocument();
  });
  it("shows who did it and when", () => {
    render(<ProvenanceTrail nodes={provenance} now={NOW} />);
    expect(screen.getByText("Data Collection Sub-agent")).toBeInTheDocument();
    expect(screen.getByText("Priya Raman")).toBeInTheDocument();
    expect(document.querySelector("time[datetime='2026-10-19T14:05:00Z']")).not.toBeNull();
  });
  it("flags estimates in words", () => {
    render(<ProvenanceTrail now={NOW} nodes={[{ id: "e", kind: "estimate", title: "March bill missing", value: "107 MWh" }]} />);
    expect(screen.getByText("Estimated")).toBeInTheDocument();
  });
  it("links a source that has an address, opening in a new tab", () => {
    render(<ProvenanceTrail now={NOW} nodes={[{ id: "s", kind: "source", title: "Bill", source: { id: "x", title: "Utility portal export", href: "https://example.com/export", kind: "dataset", locator: "row 14" } }]} />);
    const link = screen.getByRole("link", { name: /Utility portal export/ });
    expect(link).toHaveAttribute("href", "https://example.com/export");
    expect(screen.getByText(/Dataset:/)).toBeInTheDocument();
    expect(screen.getByText(/row 14/)).toBeInTheDocument();
  });
  it("has no axe violations", async () => {
    const { container } = render(<ProvenanceTrail nodes={provenance} now={NOW} aria-label="Lineage" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
