import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { SearchField } from "./SearchField.js";

describe("SearchField", () => {
  it("is a searchbox; Enter searches and Escape clears", async () => {
    const onSearch = vi.fn();
    const onValue = vi.fn();
    render(<SearchField aria-label="Search agents" onSearch={onSearch} onValueChange={onValue} />);
    const s = screen.getByRole("searchbox", { name: "Search agents" });
    await userEvent.type(s, "scope 3{Enter}");
    expect(onSearch).toHaveBeenCalledWith("scope 3");
    await userEvent.keyboard("{Escape}");
    expect(s).toHaveValue("");
    expect(onValue).toHaveBeenLastCalledWith("");
  });
  it("shows a clear button only with a value, and returns focus after clearing", async () => {
    render(<SearchField aria-label="Search tools" defaultValue="factor" />);
    const clear = screen.getByRole("button", { name: "Clear search" });
    await userEvent.click(clear);
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
  it("shows a shortcut hint and has no axe violations", async () => {
    const { container } = render(<SearchField aria-label="Search" shortcut="/" />);
    expect(container.querySelector("kbd")).toHaveTextContent("/");
    expect(await axeViolations(container)).toEqual([]);
  });
});
