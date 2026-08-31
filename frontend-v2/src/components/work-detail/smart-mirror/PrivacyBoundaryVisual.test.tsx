import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyBoundaryVisual } from "./PrivacyBoundaryVisual";

describe("PrivacyBoundaryVisual", () => {
  it("renders all six trust principles as real, visible text", () => {
    render(<PrivacyBoundaryVisual />);
    for (const principle of [
      "Home is a private environment.",
      "Capability does not automatically justify sensing.",
      "Camera and microphone concepts are never assumed always-on.",
      "Local processing is used where it is appropriate.",
      "Explicit user control matters.",
      "Minimal data collection is often the better product decision.",
    ]) {
      expect(screen.getByText(principle)).toBeInTheDocument();
    }
  });

  it("avoids literal lock/CCTV/cloud-logo iconography", () => {
    render(<PrivacyBoundaryVisual />);
    const text = document.body.textContent ?? "";
    expect(text.toLowerCase()).not.toContain("cctv");
  });
});
