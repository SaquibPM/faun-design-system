import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Link } from "./Link.js";

describe("Link", () => {
  it("is a link with an href and exposes tone and underline", () => {
    render(<Link href="/filings/csrd" tone="muted" underline="hover">CSRD filing</Link>);
    const a = screen.getByRole("link", { name: "CSRD filing" });
    expect(a).toHaveAttribute("href", "/filings/csrd");
    expect(a).toHaveAttribute("data-tone", "muted");
    expect(a).toHaveAttribute("data-underline", "hover");
  });
  it("opens external links safely and says so to screen readers", () => {
    render(<Link href="https://www.efrag.org" external>ESRS E1 text</Link>);
    const a = screen.getByRole("link", { name: /ESRS E1 text/ });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
    expect(a).toHaveAccessibleName("ESRS E1 text (opens in a new tab)");
  });
  it("leaves target and rel alone when not external", () => {
    render(<Link href="/x" target="_self" rel="author">Run log</Link>);
    const a = screen.getByRole("link", { name: "Run log" });
    expect(a).toHaveAttribute("target", "_self");
    expect(a).toHaveAttribute("rel", "author");
  });
  it("renders the child element with asChild and keeps it clickable", async () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(<Link asChild><a href="/runs/418" onClick={onClick}>Run 418</a></Link>);
    const a = screen.getByRole("link", { name: "Run 418" });
    expect(a).toHaveClass("faun-link");
    await userEvent.click(a);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("forwards its ref and has no axe violations", async () => {
    let node: HTMLAnchorElement | null = null;
    const { container } = render(<p>See <Link ref={(n) => { node = n; }} href="/evidence" external>evidence register</Link> for sources.</p>);
    expect(node).toBeInstanceOf(HTMLAnchorElement);
    expect(await axeViolations(container)).toEqual([]);
  });
});
