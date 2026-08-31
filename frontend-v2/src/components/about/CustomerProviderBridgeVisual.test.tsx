import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomerProviderBridgeVisual } from "./CustomerProviderBridgeVisual";

describe("CustomerProviderBridgeVisual", () => {
  it("renders both sides and all five signal labels as real text", () => {
    render(<CustomerProviderBridgeVisual />);
    expect(screen.getByText("Customer / User")).toBeInTheDocument();
    expect(screen.getByText("Provider / Operator")).toBeInTheDocument();
    for (const signal of ["Request", "Context", "Action", "Response", "Feedback"]) {
      expect(screen.getByText(signal)).toBeInTheDocument();
    }
  });
});
