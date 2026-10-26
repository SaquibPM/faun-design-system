import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { FileUpload, formatBytes } from "./FileUpload.js";

const pdf = (name: string, size = 1024) => new File([new Uint8Array(size)], name, { type: "application/pdf" });

describe("FileUpload", () => {
  it("labels the file input from the Field and generates a type and size hint", () => {
    render(<Field label="Utility bills"><FileUpload title="Drop utility bills" accept=".pdf" maxSize={20 * 1024 * 1024} /></Field>);
    const input = screen.getByLabelText("Utility bills");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAccessibleDescription("PDF, up to 20 MB");
  });
  it("accepts chosen files and reports them", async () => {
    const accepted = vi.fn();
    render(<FileUpload aria-describedby={undefined} accept=".pdf" onFilesAccepted={accepted} />);
    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    await userEvent.upload(input, [pdf("march-electricity.pdf"), pdf("april-gas.pdf")]);
    expect(accepted).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: "march-electricity.pdf", status: "queued" })]));
    expect(screen.getByRole("list", { name: "Files" }).children).toHaveLength(2);
  });
  it("rejects wrong types and oversize files on drop, with reasons", () => {
    const accepted = vi.fn();
    const { container } = render(<FileUpload accept=".pdf" maxSize={2048} onFilesAccepted={accepted} />);
    const zone = container.querySelector(".faun-file-upload-dropzone")!;
    fireEvent.drop(zone, { dataTransfer: { files: [new File(["x"], "meter.xlsx", { type: "application/vnd.ms-excel" }), pdf("huge.pdf", 4096)] } });
    expect(screen.getByText("PDF only")).toBeInTheDocument();
    expect(screen.getByText("Larger than 2 KB")).toBeInTheDocument();
    expect(accepted).not.toHaveBeenCalled();
  });
  it("shows progress, retries and removes items", async () => {
    const retry = vi.fn();
    const change = vi.fn();
    render(<FileUpload onRetry={retry} onFilesChange={change} files={[
      { id: "1", name: "q1-invoices.pdf", size: 3_400_000, status: "uploading", progress: 42 },
      { id: "2", name: "q2-invoices.pdf", size: 1_200_000, status: "error", error: "Upload failed. Check your connection." },
    ]} />);
    expect(screen.getByRole("progressbar", { name: "Uploading q1-invoices.pdf" })).toHaveAttribute("aria-valuenow", "42");
    await userEvent.click(screen.getByRole("button", { name: "Retry q2-invoices.pdf" }));
    expect(retry).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove q1-invoices.pdf" }));
    expect(change).toHaveBeenCalledWith([expect.objectContaining({ id: "2" })]);
  });
  it("formats bytes", () => {
    expect(formatBytes(900)).toBe("900 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(20 * 1024 * 1024)).toBe("20 MB");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Field label="Evidence"><FileUpload title="Drop evidence" accept=".pdf,.csv" defaultFiles={[{ id: "a", name: "audit-letter.pdf", size: 220_000, status: "done" }]} /></Field>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
