import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InteractionContrastVisual } from "./InteractionContrastVisual";

describe("InteractionContrastVisual", () => {
  it("renders the five active-screen steps and three ambient-glance steps as real text, in order", () => {
    render(<InteractionContrastVisual />);
    for (const step of ["Reach", "Unlock", "Open", "Navigate", "Consume", "Look", "Understand", "Continue"]) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });

  it("renders as an editorial flow, not a table", () => {
    const { container } = render(<InteractionContrastVisual />);
    expect(container.querySelector("table")).not.toBeInTheDocument();
  });

  it("asks the real interaction question as visible text", () => {
    render(<InteractionContrastVisual />);
    expect(screen.getByText(/can useful information appear inside a routine/i)).toBeInTheDocument();
  });

  it("labels both sides of the editorial scene as real text", () => {
    render(<InteractionContrastVisual />);
    expect(screen.getByText("Active Screen")).toBeInTheDocument();
    expect(screen.getByText("Ambient Glance")).toBeInTheDocument();
  });

  it("renders one shared scene with two editorial figures, not disconnected rows", () => {
    const { container } = render(<InteractionContrastVisual />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });
});
