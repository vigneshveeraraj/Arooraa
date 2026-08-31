import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiCapabilitySection } from "./AiCapabilitySection";

describe("AiCapabilitySection", () => {
  it("renders the AI-as-capability heading and human-control limit", () => {
    render(<AiCapabilitySection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "We use AI where it makes the product more useful — not because every product needs an AI label.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("human control matters")).toBeInTheDocument();
    expect(screen.getByText("deterministic systems still matter")).toBeInTheDocument();
  });
});
