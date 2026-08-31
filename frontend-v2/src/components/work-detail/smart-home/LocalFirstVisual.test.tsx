import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocalFirstVisual } from "./LocalFirstVisual";

describe("LocalFirstVisual", () => {
  it("renders the local-first stack and the secondary cloud stage as real text", () => {
    render(<LocalFirstVisual />);
    expect(screen.getByText("Rooms / Devices")).toBeInTheDocument();
    expect(screen.getByText("Local Home Layer")).toBeInTheDocument();
    expect(screen.getByText("External / Cloud Services")).toBeInTheDocument();
  });

  it("never exposes protocol/network internals", () => {
    render(<LocalFirstVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/MQTT/i);
    expect(text).not.toMatch(/\bports?\b/i);
    expect(text).not.toMatch(/topology/i);
  });
});
