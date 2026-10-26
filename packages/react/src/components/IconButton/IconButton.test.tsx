import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconSettings } from "@faun-ds/icons";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { IconButton } from "./IconButton.js";

describe("IconButton", () => {
  it("uses its label as the accessible name", async () => {
    const { container } = render(<IconButton icon={<IconSettings />} label="Settings" />);
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("shows the label as a tooltip on keyboard focus", async () => {
    render(<IconButton icon={<IconSettings />} label="Settings" shortcut="⌘," />);
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Settings");
  });
});
