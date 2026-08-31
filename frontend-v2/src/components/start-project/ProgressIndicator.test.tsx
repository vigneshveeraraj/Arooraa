import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressIndicator } from "./ProgressIndicator";

describe("ProgressIndicator", () => {
  it("renders all three step labels", () => {
    render(<ProgressIndicator currentStep={0} />);
    expect(screen.getByText("Direction")).toBeInTheDocument();
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("marks the current step accessibly, not by color alone", () => {
    render(<ProgressIndicator currentStep={1} />);
    const list = screen.getByRole("list", { name: "Form progress" });
    const items = list.querySelectorAll("li");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).toHaveTextContent("✓");
  });
});
