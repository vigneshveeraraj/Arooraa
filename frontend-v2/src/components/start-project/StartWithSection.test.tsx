import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StartWithSection } from "./StartWithSection";

describe("StartWithSection", () => {
  it("renders all four starting points and the closing reassurance", () => {
    render(<StartWithSection />);
    expect(screen.getByRole("heading", { level: 3, name: "An Idea" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "A Business Problem" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "An Existing Product" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "A Difficult System" })).toBeInTheDocument();
    expect(screen.getByText("Not sure which AROORAA service fits? That is fine. Start with the problem.")).toBeInTheDocument();
  });
});
