import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductAndEngineeringSection } from "./ProductAndEngineeringSection";

describe("ProductAndEngineeringSection", () => {
  it("renders the heading and the not-separate-rooms principle", () => {
    render(<ProductAndEngineeringSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "We do not separate empathy from engineering." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Product thinking and engineering should not live in separate rooms."),
    ).toBeInTheDocument();
  });
});
