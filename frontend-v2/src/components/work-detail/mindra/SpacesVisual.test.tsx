import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpacesVisual } from "./SpacesVisual";

describe("SpacesVisual", () => {
  it("renders the Private/Today/Family concept image, lazily loaded, with descriptive alt text", () => {
    render(<SpacesVisual />);
    const img = screen.getByRole("img", { name: /Private, Today and Family/i });
    expect(img).toHaveAttribute("src", "/images/work/mindra/story/private-today-family.webp");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("pairs the image with real text explaining My Space and Family Space, plus the sharing principle", () => {
    render(<SpacesVisual />);
    expect(screen.getByText("My Space")).toBeInTheDocument();
    expect(screen.getByText("Family Space")).toBeInTheDocument();
    expect(screen.getByText(/Private personal memory, personal work/)).toBeInTheDocument();
    expect(screen.getByText(/Selected information intentionally shared/)).toBeInTheDocument();
    expect(screen.getByText("Sharing should be deliberate, not the automatic consequence of using the same application.")).toBeInTheDocument();
  });

  it("does not surface the fabricated contact name or phone number from the source image", () => {
    const { container } = render(<SpacesVisual />);
    expect(container.textContent).not.toMatch(/Sarah/);
    expect(container.textContent).not.toMatch(/555-0178/);
  });
});
