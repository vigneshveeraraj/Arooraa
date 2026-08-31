import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MealTimelineVisual } from "./MealTimelineVisual";

describe("MealTimelineVisual", () => {
  it("W2.1.2C: renders eight individually cropped storyboard photos, lazily loaded, from the cleaned meal-* assets", () => {
    render(<MealTimelineVisual />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(8);
    for (let i = 0; i < 8; i++) {
      const image = images[i]!;
      expect(image).toHaveAttribute("src", `/images/work/mesa/story/meal-${String(i + 1).padStart(2, "0")}.webp`);
      expect(image).toHaveAttribute("loading", "lazy");
    }
  });

  it("renders the corrected eight-stage mobile-first timeline as real text, including the new Scan stage", () => {
    render(<MealTimelineVisual />);
    for (const label of ["Arrive", "Scan", "Discover", "Order", "Prepare", "Wait & Engage", "Serve & Continue", "Bill & Complete"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("Scan the table QR.")).toBeInTheDocument();
    expect(screen.getByText("Place the order from the phone.")).toBeInTheDocument();
    expect(screen.getByText(/play a lightweight game, or call the waiter/)).toBeInTheDocument();
  });

  it("renders the eight stages as an ordered, labelled list, each pairing one photo with one stage", () => {
    const { container } = render(<MealTimelineVisual />);
    const list = container.querySelector("ol")!;
    expect(list).toHaveAttribute("aria-label", "The eight stages of a MESA-supported meal");
    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(8);
    items.forEach((item) => {
      expect(item.querySelectorAll("img")).toHaveLength(1);
    });
  });

  it("does not duplicate a wide composite image alongside the eight-frame storyboard", () => {
    const { container } = render(<MealTimelineVisual />);
    const sources = Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    expect(sources.every((src) => src?.match(/meal-0[1-8]\.webp$/))).toBe(true);
    expect(sources).not.toContain("/images/work/mesa/story/meal-timeline.webp");
  });
});
