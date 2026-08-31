import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectableCard } from "./SelectableCard";

describe("SelectableCard", () => {
  it("renders as a real radio input with the label as real text", () => {
    render(
      <SelectableCard name="solutionModel" value="NEW_PRODUCT" checked={false} onChange={() => {}} label="Build a New Product" description="Something new." />,
    );
    const input = screen.getByRole("radio", { name: /Build a New Product/ });
    expect(input).not.toBeChecked();
    expect(screen.getByText("Something new.")).toBeInTheDocument();
  });

  it("calls onChange with the value when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectableCard name="solutionModel" value="NEW_PRODUCT" checked={false} onChange={onChange} label="Build a New Product" />);
    await user.click(screen.getByRole("radio", { name: /Build a New Product/ }));
    expect(onChange).toHaveBeenCalledWith("NEW_PRODUCT");
  });

  it("is keyboard operable via Tab + Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectableCard name="solutionModel" value="NEW_PRODUCT" checked={false} onChange={onChange} label="Build a New Product" />);
    await user.tab();
    expect(screen.getByRole("radio", { name: /Build a New Product/ })).toHaveFocus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith("NEW_PRODUCT");
  });

  it("shows a non-color checkmark indicator when selected", () => {
    render(<SelectableCard name="solutionModel" value="NEW_PRODUCT" checked onChange={() => {}} label="Build a New Product" />);
    expect(screen.getByRole("radio", { name: /Build a New Product/ })).toBeChecked();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("supports checkbox mode for multi-select fields", () => {
    render(<SelectableCard type="checkbox" name="productTypes" value="WEB_APPLICATION" checked={false} onChange={() => {}} label="Web application" />);
    expect(screen.getByRole("checkbox", { name: /Web application/ })).toBeInTheDocument();
  });
});
