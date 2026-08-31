import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EngagementModelChooser } from "./EngagementModelChooser";

describe("EngagementModelChooser", () => {
  it("renders all seven engagement-model options", () => {
    render(<EngagementModelChooser value="" onChange={() => {}} />);
    expect(screen.getAllByRole("radio")).toHaveLength(7);
    expect(screen.getByRole("radio", { name: /Discover & Define/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Recommend the Right Model/ })).toBeInTheDocument();
  });

  it("never positions the team-extension option as staff augmentation", () => {
    render(<EngagementModelChooser value="" onChange={() => {}} />);
    expect(screen.getByText(/specialist product-engineering collaboration/i)).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/rent developers/i);
    expect(text).not.toMatch(/staff augmentation/i);
  });

  it("calls onChange when a card is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EngagementModelChooser value="" onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: /Recommend the Right Model/ }));
    expect(onChange).toHaveBeenCalledWith("NEEDS_RECOMMENDATION");
  });
});
