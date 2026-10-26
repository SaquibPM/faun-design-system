import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs.js";

function Example({ variant }: { variant?: "line" | "contained" | "segmented" }) {
  return (
    <Tabs defaultValue="overview" variant={variant}>
      <TabsList aria-label="Report sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="datapoints" count={1034}>Datapoints</TabsTrigger>
        <TabsTrigger value="locked" disabled>Assurance</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="datapoints">Datapoints panel</TabsContent>
      <TabsContent value="history">History panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it.each(["line", "contained", "segmented"] as const)("%s variant has no axe violations", async (variant) => {
    const { container } = render(<Example variant={variant} />);
    expect(container.querySelector(".faun-tabs")).toHaveAttribute("data-variant", variant);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("wires tabs to panels and formats counts", () => {
    render(<Example />);
    const tab = screen.getByRole("tab", { name: /Datapoints/ });
    expect(tab).toHaveTextContent("1,034");
    expect(screen.getByRole("tablist", { name: "Report sections" })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Overview" })).toHaveTextContent("Overview panel");
  });

  it("moves with arrow keys, skips disabled tabs and activates on focus", async () => {
    render(<Example />);
    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Datapoints/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "History" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("History panel");
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "History" })).toHaveFocus();
  });
});
