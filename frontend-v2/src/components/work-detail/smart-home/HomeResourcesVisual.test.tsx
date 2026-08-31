import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeResourcesVisual } from "./HomeResourcesVisual";

describe("HomeResourcesVisual", () => {
  it("labels the chapter as a household awareness concept", () => {
    render(<HomeResourcesVisual />);
    expect(screen.getByText("Household awareness concept")).toBeInTheDocument();
  });

  it("renders the maintenance-water image exactly once with concept-oriented alt text", () => {
    render(<HomeResourcesVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-home/story/maintenance-water.webp");
    expect(img.getAttribute("alt")).toMatch(/concept illustration/i);
  });

  it("renders the three grouped maintenance categories with their real items", () => {
    render(<HomeResourcesVisual />);
    for (const group of ["Vehicle", "Home", "Personal"]) {
      expect(screen.getByText(group)).toBeInTheDocument();
    }
    expect(screen.getByText("Bike insurance renewal")).toBeInTheDocument();
    expect(screen.getByText("AC servicing")).toBeInTheDocument();
    expect(screen.getByText("Haircut / grooming reminder")).toBeInTheDocument();
  });

  it("frames grooming/nail-care reminders as household awareness, not an electrical function", () => {
    render(<HomeResourcesVisual />);
    expect(screen.getByText(/not an electrical Smart Home function/i)).toBeInTheDocument();
  });

  it("keeps insurance and service-contact wording explicitly future-direction, human in control", () => {
    render(<HomeResourcesVisual />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/would not automatically purchase insurance/i);
    expect(text).toMatch(/not a guarantee that every phone number/i);
  });
});
