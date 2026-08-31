import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FrontAndOperationsOverlapVisual } from "./FrontAndOperationsOverlapVisual";

describe("FrontAndOperationsOverlapVisual", () => {
  it("renders both panels with all their real items, and MESA in the overlap", () => {
    render(<FrontAndOperationsOverlapVisual />);
    expect(screen.getByText("Front Of Experience")).toBeInTheDocument();
    expect(screen.getByText("Operating Reality")).toBeInTheDocument();
    for (const item of ["Guest", "Menu", "Table", "Ordering", "Service"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    for (const item of ["Staff", "Kitchen", "Billing", "Availability", "Operational States"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    expect(screen.getByText("MESA")).toBeInTheDocument();
  });
});
