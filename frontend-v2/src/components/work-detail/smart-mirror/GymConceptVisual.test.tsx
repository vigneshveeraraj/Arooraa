import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GymConceptVisual } from "./GymConceptVisual";

describe("GymConceptVisual", () => {
  it("labels the chapter as a fitness experience concept", () => {
    render(<GymConceptVisual />);
    expect(screen.getByText("Fitness experience concept")).toBeInTheDocument();
  });

  it("renders the gym image exactly once with concept-oriented alt text", () => {
    render(<GymConceptVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-mirror/story/gym-fitness.webp");
    expect(img.getAttribute("alt")).toMatch(/concept illustration/i);
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("never claims medical assessment, diagnosis or clinically validated measurement", () => {
    render(<GymConceptVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/provides? a (medical assessment|diagnosis)/i);
    expect(text).toMatch(/not a medical assessment, a diagnosis/i);
    expect(text).toMatch(/illustrative mock data/i);
  });
});
