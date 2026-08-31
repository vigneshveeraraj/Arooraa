import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorPrivacyVisual } from "./SmartMirrorPrivacyVisual";

describe("SmartMirrorPrivacyVisual", () => {
  it("shows camera, microphone and mode state as real, accessible text", () => {
    render(<SmartMirrorPrivacyVisual />);
    expect(screen.getByText("Camera")).toBeInTheDocument();
    expect(screen.getByText("Off unless in use")).toBeInTheDocument();
    expect(screen.getByText("Microphone")).toBeInTheDocument();
    expect(screen.getByText("Muted unless in use")).toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("does not expose privacy architecture or make unverified security guarantees", () => {
    render(<SmartMirrorPrivacyVisual />);
    const text = document.body.textContent ?? "";
    const disallowed = [/encryption algorithm/i, /guaranteed/i, /100% secure/i, /unhackable/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
