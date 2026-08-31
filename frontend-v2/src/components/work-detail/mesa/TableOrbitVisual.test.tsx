import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableOrbitVisual } from "./TableOrbitVisual";

describe("TableOrbitVisual", () => {
  it("renders the table-story concept photo with descriptive alt text and a concept-visualization caption", () => {
    render(<TableOrbitVisual />);
    const img = screen.getByRole("img", { name: /guest, table, service, kitchen and billing/i });
    expect(img).toHaveAttribute("src", "/images/work/mesa/story/table-story.webp");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(screen.getByText(/Concept visualization — the table as the shared context/)).toBeInTheDocument();
  });

  it("W2.1.2B: groups the guest's phone-side actions under 'At the Table' and the restaurant's side under 'Around the Table'", () => {
    render(<TableOrbitVisual />);
    expect(screen.getByText("At the Table")).toBeInTheDocument();
    expect(screen.getByText("Around the Table")).toBeInTheDocument();
    for (const label of ["Scan the table QR", "Mobile Menu", "Order", "Play While Waiting"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    for (const label of ["Call Waiter", "Service", "Kitchen", "Billing"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("states the digital-versus-human product principle exactly once", () => {
    render(<TableOrbitVisual />);
    expect(screen.getAllByText("Digital when convenient. Human when needed.")).toHaveLength(1);
  });

  it("renders exactly one decorative mask, covering the generated billing amount baked into the photo", () => {
    const { container } = render(<TableOrbitVisual />);
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).not.toMatch(/64\.80/);
  });
});
