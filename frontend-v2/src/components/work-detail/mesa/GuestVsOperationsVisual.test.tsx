import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuestVsOperationsVisual } from "./GuestVsOperationsVisual";

describe("GuestVsOperationsVisual", () => {
  it("renders the simple guest journey line and the denser operational cluster as real, visible text", () => {
    render(<GuestVsOperationsVisual />);
    for (const step of ["Scan", "Browse", "Order", "Wait", "Eat", "Request Bill", "Pay"]) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    for (const moment of ["Table", "Menu", "Guest Choices", "Staff", "Kitchen", "Service", "Order State", "Billing", "Operations"]) {
      expect(screen.getByText(moment)).toBeInTheDocument();
    }
  });

  it("keeps only the connecting branch paths decorative", () => {
    const { container } = render(<GuestVsOperationsVisual />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Kitchen")).not.toHaveAttribute("aria-hidden");
  });
});
