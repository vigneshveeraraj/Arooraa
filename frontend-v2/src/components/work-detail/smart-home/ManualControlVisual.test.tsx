import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ManualControlVisual } from "./ManualControlVisual";

describe("ManualControlVisual", () => {
  it("labels the chapter as a control experience concept", () => {
    render(<ManualControlVisual />);
    expect(screen.getByText("Control experience concept")).toBeInTheDocument();
  });

  it("renders the manual-control image exactly once with concept-oriented alt text", () => {
    render(<ManualControlVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-home/story/manual-control.webp");
    expect(img.getAttribute("alt")).toMatch(/concept illustration/i);
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("states the smart-when-helpful key line and the four control principles", () => {
    render(<ManualControlVisual />);
    expect(screen.getByText("Smart when helpful. Manual when needed.")).toBeInTheDocument();
    for (const item of ["Normal physical switches remain meaningful", "Automation coexists with manual action", "User control stays obvious", "The household is never trapped inside an app"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
