import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringPrinciplesVisual } from "./EngineeringPrinciplesVisual";

describe("EngineeringPrinciplesVisual", () => {
  it("renders all nine principle titles and bodies", () => {
    render(<EngineeringPrinciplesVisual />);
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    expect(screen.getByRole("heading", { level: 3, name: "Solve the real problem" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Operate what we build" })).toBeInTheDocument();
    expect(screen.getByText("Trust cannot be added at the end.")).toBeInTheDocument();
  });
});
