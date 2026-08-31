import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FutureDirectionSection } from "./FutureDirectionSection";

describe("FutureDirectionSection", () => {
  it("renders the future-direction heading and compounding-capability message", () => {
    render(<FutureDirectionSection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "The goal is not to build one successful product. It is to build the ability to keep creating them.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/capability we want to compound/i)).toBeInTheDocument();
  });

  it("does not publish revenue, funding, or team-size targets", () => {
    render(<FutureDirectionSection />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹|\$\d/);
    expect(text).not.toMatch(/\d+\s*(employees|people|team members)/i);
    expect(text).not.toMatch(/funding|series [ab]/i);
  });
});
