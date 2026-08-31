import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductConstellationVisual } from "./ProductConstellationVisual";

describe("ProductConstellationVisual", () => {
  it("renders all four products with their real names and descriptions", () => {
    render(<ProductConstellationVisual />);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(screen.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
    expect(screen.getByText(/guest experience and restaurant operations/)).toBeInTheDocument();
    expect(screen.getByText(/memory, everyday responsibilities/)).toBeInTheDocument();
  });

  it("renders the shared Real Problem → Product Thinking → Engineering spine", () => {
    render(<ProductConstellationVisual />);
    expect(screen.getByText("Real Problem")).toBeInTheDocument();
    expect(screen.getByText("Product Thinking")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });
});
