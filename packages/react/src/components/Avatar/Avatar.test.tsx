import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Avatar, AvatarGroup, initials } from "./Avatar.js";

describe("Avatar", () => {
  it("derives initials", () => {
    expect(initials("Alex Morgan")).toBe("AM");
    expect(initials("Priya")).toBe("P");
    expect(initials("  ")).toBe("?");
    expect(initials("Anna Maria Keller")).toBe("AK");
  });
  it("is an image named after the person, showing initials", async () => {
    render(<Avatar name="Priya Raman" size="lg" />);
    const img = screen.getByRole("img", { name: "Priya Raman" });
    expect(img).toHaveAttribute("data-size", "lg");
    await waitFor(() => expect(img).toHaveTextContent("PR"));
  });
  it("renders the agent mark and announces status", async () => {
    const { container } = render(<Avatar name="Ledger Resolver" kind="agent" status="running" />);
    expect(screen.getByRole("img", { name: "Ledger Resolver, working" })).toHaveAttribute("data-kind", "agent");
    await waitFor(() => expect(container.querySelector(".faun-avatar-mark")).toBeInTheDocument());
  });
  it("can be decorative when a name is shown next to it", () => {
    render(<Avatar name="Mei Lin" decorative />);
    expect(screen.queryByRole("img")).toBeNull();
  });
  it("hue is stable for the same name", () => {
    const { container } = render(<><Avatar name="Tomás Ortega" /><Avatar name="Tomás Ortega" /></>);
    const [a, b] = container.querySelectorAll(".faun-avatar");
    expect(a!.getAttribute("data-hue")).toBe(b!.getAttribute("data-hue"));
  });
  it("AvatarGroup names everyone and shows an overflow count", () => {
    const { container } = render(
      <AvatarGroup label="Reviewers" max={2}><Avatar name="Priya Raman" /><Avatar name="Mei Lin" /><Avatar name="Anna Keller" /></AvatarGroup>,
    );
    expect(screen.getByRole("group", { name: "Reviewers: Priya Raman, Mei Lin, Anna Keller" })).toBeInTheDocument();
    expect(container.querySelectorAll(".faun-avatar:not(.faun-avatar-more)")).toHaveLength(2);
    expect(container.querySelector(".faun-avatar-more")).toHaveTextContent("+1");
  });
  it("has no axe violations", async () => {
    const { container } = render(<div><Avatar name="Alex Morgan" /><Avatar name="CSRD Agent" kind="agent" status="attention" /><AvatarGroup label="Reviewers"><Avatar name="Mei Lin" /></AvatarGroup></div>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
