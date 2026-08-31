import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringFoundationVisual } from "./EngineeringFoundationVisual";

describe("EngineeringFoundationVisual", () => {
  it("renders the four foundation layers as real text", () => {
    render(<EngineeringFoundationVisual />);
    for (const layer of ["Home Experience", "Local Control & Visibility", "Edge Gateway", "Physical Home"]) {
      expect(screen.getByText(layer)).toBeInTheDocument();
    }
  });

  it("renders intelligence as a separate, optional, later layer", () => {
    render(<EngineeringFoundationVisual />);
    expect(screen.getByText("Intelligence (optional, later)")).toBeInTheDocument();
    expect(screen.getByText("Intelligence sits as an optional later layer above this reliable foundation.")).toBeInTheDocument();
  });

  it("states the honest Raspberry Pi 5 / ESP32 prototype wording, no partnership or final-hardware claim", () => {
    render(<EngineeringFoundationVisual />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/Raspberry Pi 5 as an edge gateway foundation for early experimentation/i);
    expect(text).toMatch(/ESP32-based experiments remain limited to appropriate low-voltage contexts/i);
    expect(text).not.toMatch(/Raspberry Pi partnership/i);
  });
});
