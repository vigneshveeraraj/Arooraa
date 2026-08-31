import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SameDisciplineSection } from "./SameDisciplineSection";

describe("SameDisciplineSection", () => {
  it("renders the discipline heading, steps and the time-back line", () => {
    render(<SameDisciplineSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "The products are different. The discipline behind them is not." }),
    ).toBeInTheDocument();
    expect(screen.getByText("understand the actual problem")).toBeInTheDocument();
    expect(screen.getByText(/A good product should give time back/)).toBeInTheDocument();
  });
});
