import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { citations } from "../../utils/fixtures.js";
import { CitationMarker, SourceList } from "./Citation.js";

describe("CitationMarker", () => {
  it("is a button named by its number and source", () => {
    render(<CitationMarker citation={citations[0]!} />);
    expect(screen.getByRole("button", { name: "Source 1: Supplier survey 2026" })).toBeInTheDocument();
  });
  it("opens the source with kind, locator and quoted passage, and reports the open", async () => {
    const onOpen = vi.fn();
    render(<CitationMarker citation={citations[0]!} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: /Source 1/ }));
    expect(await screen.findByText(/EUR 412.6m across 148 suppliers/)).toBeInTheDocument();
    expect(screen.getByText("Dataset")).toBeInTheDocument();
    expect(screen.getByText("Sheet 2!C14")).toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledWith(citations[0]);
  });
  it("links to the source in a new tab when it has an address, and closes on Escape", async () => {
    render(<CitationMarker citation={citations[1]!} />);
    const marker = screen.getByRole("button", { name: /Source 2/ });
    await userEvent.click(marker);
    const links = await screen.findAllByRole("link", { name: /opens in a new tab/ });
    expect(links[0]).toHaveAttribute("href", citations[1]!.source.href);
    expect(links[0]).toHaveAttribute("rel", expect.stringContaining("noopener"));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText(/cradle-to-gate/)).toBeNull();
    expect(marker).toHaveFocus();
  });
  it("opens from the keyboard", async () => {
    render(<CitationMarker citation={citations[2]!} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByText(/112.4 MWh/)).toBeInTheDocument();
  });
  it("has no axe violations, closed or open", async () => {
    const { container } = render(<p>March use was 112.4 MWh<CitationMarker citation={citations[2]!} />.</p>);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button"));
    await screen.findByText(/112.4 MWh, 1 Mar/);
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

describe("SourceList", () => {
  it("lists sources in order with ids a marker can point at", () => {
    render(<SourceList aria-label="Sources" idPrefix="e16" citations={citations} />);
    const list = screen.getByRole("list", { name: "Sources" });
    expect(list.tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("id", "e16-2");
    expect(screen.getByText("Invoice INV-20931")).toBeInTheDocument();
    expect(screen.getByText("Emission factor")).toBeInTheDocument();
  });
  it("highlights the active source and has no axe violations", async () => {
    const { container } = render(<SourceList aria-label="Sources" citations={citations} activeIndex={3} />);
    expect(screen.getAllByRole("listitem")[2]).toHaveAttribute("data-active");
    expect(screen.getAllByRole("listitem")[0]).not.toHaveAttribute("data-active");
    expect(await axeViolations(container)).toEqual([]);
  });
});
