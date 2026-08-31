import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NormalHomeStatesVisual } from "./NormalHomeStatesVisual";

describe("NormalHomeStatesVisual", () => {
  it("renders the three home states as real, visible text", () => {
    render(<NormalHomeStatesVisual />);
    for (const name of ["Normal Home", "Smart Assist", "Offline / Local Continuity"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("renders the familiarity key line as visible text", () => {
    render(<NormalHomeStatesVisual />);
    expect(screen.getByText("Technology should add capability without removing familiarity.")).toBeInTheDocument();
  });

  it("shows the offline state as explicitly local, not just unlabeled", () => {
    render(<NormalHomeStatesVisual />);
    expect(screen.getByText("Local")).toBeInTheDocument();
  });
});
