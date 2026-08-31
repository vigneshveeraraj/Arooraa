import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MindraScatteredToStructured } from "./MindraScatteredToStructured";

describe("MindraScatteredToStructured", () => {
  it("renders both the scattered and structured groups", () => {
    render(<MindraScatteredToStructured />);
    expect(screen.getByText("Scattered")).toBeInTheDocument();
    expect(screen.getByText("One calm place")).toBeInTheDocument();
  });

  it("shows the everyday scattered places as real, accessible text", () => {
    render(<MindraScatteredToStructured />);
    const scattered = within(screen.getByTestId("scattered-panel"));
    for (const place of ["A Note", "A Chat", "Your Memory", "A Piece of Paper", "A Calendar"]) {
      expect(scattered.getByText(place)).toBeInTheDocument();
    }
  });

  it("shows the structured items as real, accessible text", () => {
    render(<MindraScatteredToStructured />);
    const structured = within(screen.getByTestId("structured-panel"));
    for (const item of ["Notes", "Groceries", "Tasks", "Meals", "Reminders"]) {
      expect(structured.getByText(item)).toBeInTheDocument();
    }
  });

  it("does not expose internal data-model or architecture terms", () => {
    render(<MindraScatteredToStructured />);
    const text = document.body.textContent ?? "";
    const disallowed = [/database/i, /schema/i, /household id/i, /user id/i, /\bapi\b/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
