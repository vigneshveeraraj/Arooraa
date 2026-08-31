import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhyAroorraSection } from "./WhyAroorraSection";

describe("WhyAroorraSection", () => {
  it("renders the chapter heading and the reduce-complexity principle", () => {
    render(<WhyAroorraSection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Good products often begin with a problem someone has learned to tolerate.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Good products should reduce complexity, not add to it.")).toBeInTheDocument();
  });

  it("renders the repeated-frustration origin moment", () => {
    render(<WhyAroorraSection />);
    expect(screen.getByText("Why does this still work this way?")).toBeInTheDocument();
    expect(
      screen.getByText(/frustration became responsibility/i),
    ).toBeInTheDocument();
  });

  it("renders the customer/provider bridge connector", () => {
    render(<WhyAroorraSection />);
    expect(screen.getByText(/We want to understand both sides of the problem/)).toBeInTheDocument();
  });
});
