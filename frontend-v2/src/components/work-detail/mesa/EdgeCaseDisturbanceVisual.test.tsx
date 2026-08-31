import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EdgeCaseDisturbanceVisual } from "./EdgeCaseDisturbanceVisual";

describe("EdgeCaseDisturbanceVisual", () => {
  it("renders the steady main line with eight disturbance points, and all eight scenarios as real text", () => {
    const { container } = render(<EdgeCaseDisturbanceVisual />);
    expect(container.querySelectorAll("circle")).toHaveLength(8);
    // main line + 8 stubs
    expect(container.querySelectorAll("line")).toHaveLength(9);
    for (const edgeCase of [
      "Another guest joins",
      "An item changes",
      "Service is delayed",
      "A request is cancelled",
      "The bill is requested",
      "Connectivity changes",
      "The page is revisited",
      "Staff and guest actions overlap",
    ]) {
      expect(screen.getByText(edgeCase)).toBeInTheDocument();
    }
  });
});
