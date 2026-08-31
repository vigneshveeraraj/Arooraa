import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorDashboard } from "./SmartMirrorDashboard";

describe("SmartMirrorDashboard", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<SmartMirrorDashboard />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the five approved high-level tiles", () => {
    render(<SmartMirrorDashboard />);
    for (const tile of ["Family", "Wellness", "Home", "Energy", "Memory"]) {
      expect(screen.getByText(tile)).toBeInTheDocument();
    }
  });

  it("labels itself as a concept, not a production screenshot", () => {
    render(<SmartMirrorDashboard />);
    expect(screen.getByText("Concept visualization")).toBeInTheDocument();
  });

  it("does not expose internal architecture labels", () => {
    render(<SmartMirrorDashboard />);
    const text = document.body.textContent ?? "";
    const disallowed = [/edge node/i, /api gateway/i, /websocket/i, /postgresql/i, /raspberry pi 5/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not publish fabricated metrics", () => {
    render(<SmartMirrorDashboard />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%/);
  });
});
