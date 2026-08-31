import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhysicalProductsTransition } from "./PhysicalProductsTransition";

describe("PhysicalProductsTransition", () => {
  it("renders the bridging heading and supporting copy in a dark section", () => {
    render(<PhysicalProductsTransition />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Some products begin on a screen. Others begin in the physical world.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Smart Mirror and Arooraa Smart Home explore/)).toBeInTheDocument();
    const section = document.getElementById("physical-transition")!;
    expect(section).toHaveAttribute("data-tone", "dark");
  });
});
