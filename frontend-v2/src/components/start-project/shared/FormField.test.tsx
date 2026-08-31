import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { describedBy, FormField } from "./FormField";

describe("FormField", () => {
  it("associates the label with the input via htmlFor/id", () => {
    render(
      <FormField label="Full name" htmlFor="name">
        <input id="name" aria-describedby={describedBy("name", {})} />
      </FormField>,
    );
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });

  it("renders helper text and wires it via aria-describedby", () => {
    render(
      <FormField label="Full name" htmlFor="name" helper="As it should appear on correspondence.">
        <input id="name" aria-describedby={describedBy("name", { helper: true })} />
      </FormField>,
    );
    const input = screen.getByLabelText("Full name");
    expect(input).toHaveAttribute("aria-describedby", "name-helper");
    expect(screen.getByText("As it should appear on correspondence.")).toBeInTheDocument();
  });

  it("renders an error as a live region wired via aria-describedby", () => {
    render(
      <FormField label="Full name" htmlFor="name" error="Enter your name.">
        <input id="name" aria-invalid aria-describedby={describedBy("name", { error: true })} />
      </FormField>,
    );
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Enter your name.");
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-describedby", "name-error");
  });

  it("combines helper and error ids when both are present", () => {
    expect(describedBy("name", { helper: true, error: true })).toBe("name-helper name-error");
  });
});
