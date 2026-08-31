import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HospitalityConceptVisual } from "./HospitalityConceptVisual";

describe("HospitalityConceptVisual", () => {
  it("labels the chapter as a hospitality experience concept", () => {
    render(<HospitalityConceptVisual />);
    expect(screen.getByText("Hospitality experience concept")).toBeInTheDocument();
  });

  it("renders the hospitality image exactly once with concept-oriented alt text", () => {
    render(<HospitalityConceptVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-mirror/story/hospitality.webp");
    expect(img.getAttribute("alt")).toMatch(/concept illustration/i);
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("never implies guest recognition, deployment or a live MESA integration", () => {
    render(<HospitalityConceptVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/uses guest facial recognition/i);
    expect(text).not.toMatch(/is (a )?deployed connection to MESA/i);
    expect(text).toMatch(/would not imply guest facial recognition/i);
    expect(text).toMatch(/deployed connection to MESA/i);
  });

  it("does not publish an indicative price", () => {
    render(<HospitalityConceptVisual />);
    expect(document.body.textContent ?? "").not.toMatch(/₹/);
  });
});
