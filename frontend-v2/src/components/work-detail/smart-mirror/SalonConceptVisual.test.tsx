import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SalonConceptVisual } from "./SalonConceptVisual";

describe("SalonConceptVisual", () => {
  it("labels the chapter as a salon experience concept", () => {
    render(<SalonConceptVisual />);
    expect(screen.getByText("Salon experience concept")).toBeInTheDocument();
  });

  it("renders the salon image exactly once with concept-oriented alt text", () => {
    render(<SalonConceptVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-mirror/story/salon-preview.webp");
    expect(img.getAttribute("alt")).toMatch(/concept illustration/i);
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("keeps the stylist and customer in control — no guaranteed-match or biometric claims", () => {
    render(<SalonConceptVisual />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/would not guarantee style suitability, perform biometric face analysis/i);
    expect(text).toMatch(/stylist remain in control/i);
  });
});
