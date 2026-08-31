import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolutionModelChooser } from "./SolutionModelChooser";

describe("SolutionModelChooser", () => {
  it("renders all eight solution-model options", () => {
    render(<SolutionModelChooser value="" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(8);
    expect(screen.getByRole("radio", { name: /Build a New Product/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /I Have a Problem — Help Me Find the Direction/ })).toBeInTheDocument();
  });

  it("marks the selected option as checked", () => {
    render(<SolutionModelChooser value="AI_DATA_AUTOMATION" onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: /AI, Data or Automation/ })).toBeChecked();
  });

  it("calls onChange when a card is selected, including the Needs Guidance option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SolutionModelChooser value="" onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: /I Have a Problem — Help Me Find the Direction/ }));
    expect(onChange).toHaveBeenCalledWith("NEEDS_GUIDANCE");
  });

  it("shows the inline error when provided", () => {
    render(<SolutionModelChooser value="" error="Choose the closest direction." onChange={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Choose the closest direction.");
  });
});
