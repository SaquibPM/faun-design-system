import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Pagination, paginationRange } from "./Pagination.js";

describe("paginationRange", () => {
  it.each([
    [5, 42, [1, "gap", 4, 5, 6, "gap", 42]],
    [1, 42, [1, 2, 3, 4, 5, "gap", 42]],
    [3, 42, [1, 2, 3, 4, 5, "gap", 42]],
    [42, 42, [1, "gap", 38, 39, 40, 41, 42]],
    [4, 7, [1, 2, 3, 4, 5, 6, 7]],
    [2, 5, [1, 2, 3, 4, 5]],
    [1, 1, [1]],
  ])("page %i of %i", (page, count, expected) => {
    expect(paginationRange(page, count)).toEqual(expected);
  });
});

function Controlled({ onSize = vi.fn() }: { onSize?: (n: number) => void }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  return (
    <Pagination
      page={page}
      onPageChange={setPage}
      total={1034}
      pageSize={size}
      pageSizeOptions={[25, 50, 100]}
      onPageSizeChange={(n) => { setSize(n); setPage(1); onSize(n); }}
      itemLabel="rows"
    />
  );
}

describe("Pagination", () => {
  it("summarises the range, marks the current page and has no axe violations", async () => {
    const { container } = render(<Controlled />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1–25 of 1,034 rows");
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 42" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("moves between pages by keyboard and updates the summary", async () => {
    render(<Controlled />);
    const next = screen.getByRole("button", { name: "Next page" });
    next.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 26–50 of 1,034 rows");
    await userEvent.click(screen.getByRole("button", { name: "Page 42" }));
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1,026–1,034 of 1,034 rows");
    expect(next).toBeDisabled();
  });

  it("changes page size through a labelled select", async () => {
    const onSize = vi.fn();
    render(<Controlled onSize={onSize} />);
    await userEvent.selectOptions(screen.getByLabelText("Rows per page"), "100");
    expect(onSize).toHaveBeenCalledWith(100);
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1–100 of 1,034 rows");
    expect(screen.getByRole("button", { name: "Page 11" })).toBeInTheDocument();
  });
});
