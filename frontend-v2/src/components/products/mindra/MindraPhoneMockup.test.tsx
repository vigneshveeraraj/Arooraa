import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraPhoneMockup } from "./MindraPhoneMockup";

describe("MindraPhoneMockup", () => {
  it("renders its label and children", () => {
    render(
      <MindraPhoneMockup label="Today">
        <p>Buy vegetables</p>
      </MindraPhoneMockup>,
    );
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Buy vegetables")).toBeInTheDocument();
  });

  it("does not simulate a real device status bar", () => {
    render(
      <MindraPhoneMockup label="Today">
        <p>Buy vegetables</p>
      </MindraPhoneMockup>,
    );
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/9:41/);
    expect(text).not.toMatch(/battery/i);
    expect(text).not.toMatch(/signal/i);
  });
});
