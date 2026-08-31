import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpansionVisual } from "./ExpansionVisual";

describe("ExpansionVisual", () => {
  it("renders the staged growth progression as real text", () => {
    render(<ExpansionVisual />);
    for (const stage of ["One Room", "Several Rooms", "Coordinated Home"]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });

  it("names the five real rooms the product stages through", () => {
    render(<ExpansionVisual />);
    for (const room of ["Bedroom", "Living Room", "Kitchen", "Utility / Water Context", "Wider Home"]) {
      expect(screen.getByText(room)).toBeInTheDocument();
    }
  });

  it("renders no fake timeline or date", () => {
    render(<ExpansionVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(text).not.toMatch(/week \d|month \d|quarter \d/i);
  });
});
