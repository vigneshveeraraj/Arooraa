import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MesaMaturityProgression } from "./MesaMaturityProgression";

describe("MesaMaturityProgression", () => {
  it("shows exactly three maturity stages in order", () => {
    render(<MesaMaturityProgression />);
    const stages = screen.getAllByRole("listitem");
    expect(stages).toHaveLength(3);
    expect(screen.getByText("Core Foundation")).toBeInTheDocument();
    expect(screen.getByText("Active Development")).toBeInTheDocument();
    expect(screen.getByText("Long-Term Direction")).toBeInTheDocument();
  });

  it("does not expose internal roadmap sequencing", () => {
    render(<MesaMaturityProgression />);
    const text = document.body.textContent ?? "";
    const disallowed = [/phase 1/i, /phase 2/i, /phase 3/i, /phase 4/i, /mvp/i, /commerce core/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
