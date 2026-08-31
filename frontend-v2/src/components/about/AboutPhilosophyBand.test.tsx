import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutPhilosophyBand } from "./AboutPhilosophyBand";

describe("AboutPhilosophyBand", () => {
  it("renders the core positioning and the better-way philosophy quote", () => {
    render(<AboutPhilosophyBand />);
    expect(screen.getByText("AROORAA — Product Engineering & Innovation")).toBeInTheDocument();
    expect(
      screen.getByText("We turn ideas and business problems into production-ready digital products."),
    ).toBeInTheDocument();
    expect(screen.getByText(/starts where someone says/i)).toBeInTheDocument();
    expect(screen.getByText(/There should be a better way/i)).toBeInTheDocument();
  });
});
