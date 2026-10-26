import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field } from "../Field/Field.js";
import { Input, PasswordInput, TextField } from "./Input.js";

describe("Input and Field", () => {
  it("associates label, description and error with the control", async () => {
    const { container } = render(<TextField label="Reporting period" description="Calendar or fiscal year" error="Enter a year between 2015 and 2030" />);
    const input = screen.getByRole("textbox", { name: "Reporting period" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/^Calendar or fiscal year\s*Enter a year between 2015 and 2030$/);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a year between 2015 and 2030");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("marks required fields for assistive tech", () => {
    render(<TextField label="Entity name" required />);
    expect(screen.getByRole("textbox", { name: /Entity name/ })).toHaveAttribute("aria-required", "true");
  });
  it("renders units as suffix and accepts typing", async () => {
    render(<Field label="Scope 1 total"><Input suffix="tCO₂e" numeric defaultValue="" /></Field>);
    const input = screen.getByRole("textbox", { name: "Scope 1 total" });
    await userEvent.type(input, "3212.6");
    expect(input).toHaveValue("3212.6");
    expect(screen.getByText("tCO₂e")).toBeInTheDocument();
  });
  it("inherits disabled from Field", () => {
    render(<Field label="Locked" disabled><Input /></Field>);
    expect(screen.getByRole("textbox", { name: "Locked" })).toBeDisabled();
  });

  describe("password toggle", () => {
    it("reveals and hides the value with a named button", async () => {
      const { container } = render(<Field label="Passphrase"><PasswordInput defaultValue="s3cret" /></Field>);
      const input = screen.getByLabelText("Passphrase");
      expect(input).toHaveAttribute("type", "password");
      await userEvent.click(screen.getByRole("button", { name: "Show password" }));
      expect(input).toHaveAttribute("type", "text");
      await userEvent.click(screen.getByRole("button", { name: "Hide password" }));
      expect(input).toHaveAttribute("type", "password");
      expect(await axeViolations(container)).toEqual([]);
    });
    it("works on type=password, can be turned off, and takes custom labels", () => {
      const { rerender } = render(<Input type="password" aria-label="p" showPasswordLabel="Mostrar contraseña" />);
      expect(screen.getByRole("button", { name: "Mostrar contraseña" })).toBeInTheDocument();
      rerender(<Input type="password" aria-label="p" passwordToggle={false} />);
      expect(screen.queryByRole("button")).toBeNull();
    });
    it("keeps the toggle out of the way when disabled", () => {
      render(<Input type="password" aria-label="p" disabled />);
      expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled();
    });
  });

  describe("character counter", () => {
    it("counts as you type, links the count to the input and enforces maxLength", async () => {
      const { container } = render(<TextField label="Title" maxLength={10} showCount />);
      const input = screen.getByLabelText("Title");
      expect(input).toHaveAccessibleDescription(/^0 \/ 10\s*characters$/);
      await userEvent.type(input, "Scope 1 emissions");
      expect(input).toHaveValue("Scope 1 em");
      expect(input).toHaveAccessibleDescription(/^10 \/ 10\s*characters$/);
      expect(container.querySelector(".faun-input-count")).toHaveAttribute("data-over");
      expect(await axeViolations(container)).toEqual([]);
    });
    it("starts from the initial value and follows a controlled value", () => {
      const { rerender } = render(<Input aria-label="t" maxLength={20} showCount defaultValue="abc" />);
      expect(screen.getByText(/3 \/ 20/)).toBeInTheDocument();
      rerender(<Input aria-label="t" maxLength={20} showCount value="abcdef" onChange={() => undefined} />);
      expect(screen.getByText(/6 \/ 20/)).toBeInTheDocument();
    });
    it("announces the remaining characters near the limit", async () => {
      render(<Input aria-label="t" maxLength={10} showCount />);
      await userEvent.type(screen.getByLabelText("t"), "123456789");
      expect(screen.getByText("1 characters left")).toBeInTheDocument();
    });
  });

  describe("field variants", () => {
    it("exposes inline and fluid layouts and keeps the label association", async () => {
      const { container } = render(<><TextField variant="inline" label="Entity" /><TextField variant="fluid" label="Year" /></>);
      expect(container.querySelector('[data-variant="inline"]')).not.toBeNull();
      expect(container.querySelector('[data-variant="fluid"]')).not.toBeNull();
      expect(screen.getByLabelText("Entity")).toBeInTheDocument();
      expect(screen.getByLabelText("Year")).toBeInTheDocument();
      expect(await axeViolations(container)).toEqual([]);
    });
    it("omits the attribute for the default layout", () => {
      const { container } = render(<TextField label="Entity" />);
      expect(container.querySelector("[data-variant]")).toBeNull();
    });
  });
});
