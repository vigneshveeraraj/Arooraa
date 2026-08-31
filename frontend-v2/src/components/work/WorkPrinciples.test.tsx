import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkPrinciples } from "./WorkPrinciples";

describe("WorkPrinciples", () => {
  it("renders the heading and all five principles as headings + body text, not five equal cards", () => {
    render(<WorkPrinciples />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Building changes how you think about building." }),
    ).toBeInTheDocument();
    for (const title of [
      "Start smaller than the idea.",
      "Operations are part of UX.",
      "Physical systems change the rules.",
      "Intelligence needs context.",
      "Products never really finish.",
    ]) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }
    expect(screen.getByText(/not claimed universal laws/)).toBeInTheDocument();
  });
});
