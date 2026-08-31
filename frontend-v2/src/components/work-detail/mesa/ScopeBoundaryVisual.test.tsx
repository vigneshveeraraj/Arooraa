import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScopeBoundaryVisual } from "./ScopeBoundaryVisual";

describe("ScopeBoundaryVisual", () => {
  it("renders the inside and outside items as real text, with no named roadmap features", () => {
    render(<ScopeBoundaryVisual />);
    for (const item of ["Essential restaurant experience", "Core operations", "Reliable workflows", "Production foundations"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    for (const item of ["Unnecessary complexity", "Premature automation", "Speculative integrations", "Features without validated need"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
