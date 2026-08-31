import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorMomentsRow } from "./SmartMirrorMomentsRow";

describe("SmartMirrorMomentsRow", () => {
  it("lists the four natural moments as real, accessible text", () => {
    render(<SmartMirrorMomentsRow />);
    for (const moment of ["Getting Ready", "Before Leaving", "Coming Home", "Before Bed"]) {
      expect(screen.getByText(moment)).toBeInTheDocument();
    }
  });
});
