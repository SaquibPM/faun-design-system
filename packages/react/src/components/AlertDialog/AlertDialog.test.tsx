import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Button } from "../Button/Button.js";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "./AlertDialog.js";

function Example(props: Partial<React.ComponentProps<typeof AlertDialogContent>>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button>Archive agent</Button></AlertDialogTrigger>
      <AlertDialogContent title="Archive CSRD Filing Orchestrator?" description="It stops running." confirmLabel="Archive" {...props} />
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  it("opens as an alertdialog with name and description, focusing Cancel", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Archive agent" }));
    const dlg = await screen.findByRole("alertdialog", { name: "Archive CSRD Filing Orchestrator?" });
    expect(dlg).toHaveAccessibleDescription("It stops running.");
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
    expect(await axeViolations(dlg)).toEqual([]);
  });
  it("runs onConfirm with a loading state and closes when it resolves", async () => {
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    render(<Example onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Archive agent" }));
    await userEvent.click(await screen.findByRole("button", { name: "Archive" }));
    expect(onConfirm).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Archive" })).toHaveAttribute("aria-busy", "true");
    resolve();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
  it("stays open and shows the error when onConfirm rejects", async () => {
    render(<Example onConfirm={() => Promise.reject(new Error("Archiving failed: the agent is running."))} />);
    await userEvent.click(screen.getByRole("button", { name: "Archive agent" }));
    await userEvent.click(await screen.findByRole("button", { name: "Archive" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Archiving failed");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
  it("requires typing the confirm text", async () => {
    const onConfirm = vi.fn();
    render(<Example confirmText="DEFRA 2025" onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Archive agent" }));
    const confirm = await screen.findByRole("button", { name: "Archive" });
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/to confirm/), "DEFRA 2025");
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalled();
  });
  it("cancels with Escape", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Archive agent" });
    await userEvent.click(trigger);
    await screen.findByRole("alertdialog");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
