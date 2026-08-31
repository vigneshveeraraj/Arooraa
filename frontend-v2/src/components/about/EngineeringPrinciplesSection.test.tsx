import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringPrinciplesSection } from "./EngineeringPrinciplesSection";

describe("EngineeringPrinciplesSection", () => {
  it("renders the section heading and the principles grid", () => {
    render(<EngineeringPrinciplesSection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Some engineering decisions should remain boring. That is often a good thing.",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
  });
});
