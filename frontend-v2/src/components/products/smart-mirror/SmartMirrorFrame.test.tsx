import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorFrame } from "./SmartMirrorFrame";

describe("SmartMirrorFrame", () => {
  it("renders its children inside the mirror glass", () => {
    render(
      <SmartMirrorFrame>
        <p>8:12 AM</p>
      </SmartMirrorFrame>,
    );
    expect(screen.getByText("8:12 AM")).toBeInTheDocument();
  });

  it("does not simulate a real device status bar", () => {
    render(
      <SmartMirrorFrame>
        <p>8:12 AM</p>
      </SmartMirrorFrame>,
    );
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/battery/i);
    expect(text).not.toMatch(/wifi/i);
  });
});
