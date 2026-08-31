import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RolePerspectiveStoryboard } from "./RolePerspectiveStoryboard";

describe("RolePerspectiveStoryboard", () => {
  it("renders all four roles, each with their own concept photo, heading and quote", () => {
    render(<RolePerspectiveStoryboard />);
    for (const role of ["Guest", "Waiter / Service Team", "Kitchen", "Restaurant Owner / Manager"]) {
      expect(screen.getByRole("heading", { level: 3, name: role })).toBeInTheDocument();
    }
    expect(screen.getByText(/What do I want to eat/)).toBeInTheDocument();
    expect(screen.getByText(/Is the operation moving clearly/)).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  it("loads the four panel photos from the optimized story assets, lazily", () => {
    render(<RolePerspectiveStoryboard />);
    const images = screen.getAllByRole("img");
    for (const image of images) {
      expect(image.getAttribute("src")).toMatch(/^\/images\/work\/mesa\/story\/role-/);
      expect(image).toHaveAttribute("loading", "lazy");
    }
  });

  it("masks the generated business metrics baked into the owner/manager photo only", () => {
    const { container } = render(<RolePerspectiveStoryboard />);
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).not.toMatch(/96%/);
    expect(container.textContent).not.toMatch(/4\.8/);
  });

  it("W2.1.2B: gives the guest panel a real-HTML mobile-first journey cue rather than relying on the physical menu in the photo", () => {
    render(<RolePerspectiveStoryboard />);
    for (const step of ["Scan", "Browse", "Order", "Wait / Play"]) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });

  it("W2.1.2B: gives the waiter panel a conceptual table-request status chip, not a fake production UI", () => {
    render(<RolePerspectiveStoryboard />);
    expect(screen.getByText("Table Request")).toBeInTheDocument();
  });
});
