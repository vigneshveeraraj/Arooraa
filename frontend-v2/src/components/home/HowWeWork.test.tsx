import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HowWeWork } from "./HowWeWork";
import { DELIVERY_STAGES } from "@/lib/content/process";

const EXPECTED_ORDER = [
  "Understand",
  "Discover",
  "Define",
  "Design",
  "Build",
  "Validate",
  "Launch",
  "Operate",
  "Evolve",
];

describe("HowWeWork", () => {
  it("renders exactly nine delivery stages in the frozen order", () => {
    render(<HowWeWork />);
    expect(DELIVERY_STAGES).toHaveLength(9);
    expect(DELIVERY_STAGES.map((stage) => stage.name)).toEqual(EXPECTED_ORDER);

    const names = screen.getAllByTestId("stage-name").map((el) => el.textContent);
    expect(names).toEqual(EXPECTED_ORDER);
  });

  it('uses the frozen section heading "From problem to production — and beyond."', () => {
    render(<HowWeWork />);
    expect(screen.getByRole("heading", { name: "From problem to production — and beyond." })).toBeInTheDocument();
  });
});
