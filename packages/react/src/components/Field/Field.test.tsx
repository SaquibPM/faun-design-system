import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Field, Fieldset, useFieldControl } from "./Field.js";

function Control(props: { id?: string }) {
  const { invalid: _invalid, ...p } = useFieldControl(props);
  return <input {...p} />;
}

describe("Field", () => {
  it("labels the control and links description and error", () => {
    render(
      <Field label="Reporting boundary" description="Choose the consolidation approach." error="Select a boundary to continue." required>
        <Control />
      </Field>,
    );
    const input = screen.getByLabelText(/Reporting boundary/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription("Choose the consolidation approach. Select a boundary to continue.");
    expect(screen.getByRole("alert")).toHaveTextContent("Select a boundary to continue.");
  });
  it("is not invalid and not required by default", () => {
    render(<Field label="Entity"><Control /></Field>);
    const input = screen.getByLabelText("Entity");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-required");
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("marks optional fields and hides the label visually but not from screen readers", () => {
    const { container } = render(<Field label="Comment" optional hideLabel><Control /></Field>);
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(container.querySelector(".faun-field-label-row")).toHaveClass("faun-visually-hidden");
    expect(screen.getByLabelText(/Comment/)).toBeInTheDocument();
  });
  it("passes disabled to the control and honours an explicit control id", () => {
    render(<Field label="Entity" disabled controlId="entity"><Control /></Field>);
    const input = screen.getByLabelText("Entity");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("id", "entity");
  });
  it("useFieldControl is a no-op outside a Field", () => {
    render(<Control id="solo" />);
    expect(document.getElementById("solo")).toBeInTheDocument();
  });
  it("Fieldset groups fields under a legend and has no axe violations", async () => {
    const { container } = render(
      <Fieldset legend="Reporting period" description="Dates are inclusive.">
        <Field label="From"><Control /></Field>
        <Field label="To"><Control /></Field>
      </Fieldset>,
    );
    expect(screen.getByRole("group", { name: "Reporting period" })).toHaveAccessibleDescription("Dates are inclusive.");
    expect(await axeViolations(container)).toEqual([]);
  });
});
