import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepDirection } from "./StepDirection";

describe("StepDirection", () => {
  it("shows both the solution-model and engagement-model choosers together, not sequentially gated", () => {
    render(
      <StepDirection
        solutionModel=""
        engagementModel=""
        errors={{}}
        onSolutionModelChange={() => {}}
        onEngagementModelChange={() => {}}
      />,
    );
    expect(screen.getByText("What kind of solution are you looking for?")).toBeInTheDocument();
    expect(screen.getByText("How would you like AROORAA to help?")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(15);
  });
});
