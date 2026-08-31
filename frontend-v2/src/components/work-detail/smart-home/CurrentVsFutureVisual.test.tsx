import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CurrentVsFutureVisual } from "./CurrentVsFutureVisual";

describe("CurrentVsFutureVisual", () => {
  it("labels both columns distinctly as real text", () => {
    render(<CurrentVsFutureVisual />);
    expect(screen.getByText("Prototype / Current Exploration")).toBeInTheDocument();
    expect(screen.getByText("Future Direction")).toBeInTheDocument();
  });

  it("keeps Raspberry Pi 5 / ESP32 experimentation in current, and AI assistance in future", () => {
    render(<CurrentVsFutureVisual />);
    const current = within(screen.getByText("Prototype / Current Exploration").parentElement!);
    expect(current.getByText("Raspberry Pi 5 gateway experimentation")).toBeInTheDocument();
    expect(current.getByText("ESP32 low-voltage experimentation")).toBeInTheDocument();

    const future = within(screen.getByText("Future Direction").parentElement!);
    expect(future.getByText("Carefully bounded AI assistance")).toBeInTheDocument();
    expect(future.queryByText("Raspberry Pi 5 gateway experimentation")).not.toBeInTheDocument();
  });
});
