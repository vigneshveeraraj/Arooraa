import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FutureHorizonVisual } from "./FutureHorizonVisual";

describe("FutureHorizonVisual", () => {
  it("renders all four domain labels as real text", () => {
    render(<FutureHorizonVisual />);
    for (const domain of ["Software", "AI & Data", "Cloud & Platform", "Connected Products"]) {
      expect(screen.getByText(domain)).toBeInTheDocument();
    }
  });
});
