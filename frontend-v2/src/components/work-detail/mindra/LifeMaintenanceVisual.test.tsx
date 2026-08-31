import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LifeMaintenanceVisual } from "./LifeMaintenanceVisual";

describe("LifeMaintenanceVisual", () => {
  it("renders the life-maintenance concept image, lazily loaded, labeled as concept direction", () => {
    render(<LifeMaintenanceVisual />);
    const img = screen.getByRole("img", { name: /insurance renewal, vehicle service/i });
    expect(img).toHaveAttribute("src", "/images/work/mindra/story/life-maintenance.webp");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(screen.getByText("Concept direction")).toBeInTheDocument();
  });

  it("renders all four maintenance groups with their items as real text", () => {
    render(<LifeMaintenanceVisual />);
    for (const group of ["Vehicle", "Home", "Personal", "Renewals"]) {
      expect(screen.getByText(group)).toBeInTheDocument();
    }
    expect(screen.getByText("Bike/car insurance renewal")).toBeInTheDocument();
    expect(screen.getByText("AC service")).toBeInTheDocument();
    expect(screen.getByText("Haircut")).toBeInTheDocument();
    expect(screen.getByText("Policies")).toBeInTheDocument();
  });

  it("states the guiding principle and careful future-direction wording for insurance and service contacts", () => {
    render(<LifeMaintenanceVisual />);
    expect(screen.getByText("You live your life. Mindra quietly remembers the cycles around it.")).toBeInTheDocument();
    expect(screen.getByText(/could eventually help prepare a renewal decision/)).toBeInTheDocument();
    expect(screen.getByText(/would not automatically buy insurance/)).toBeInTheDocument();
    expect(screen.getByText(/can retain a preferred service provider/)).toBeInTheDocument();
  });

  it("does not present automated insurance purchase or guaranteed comparison as current capability", () => {
    render(<LifeMaintenanceVisual />);
    const text = screen.getByText(/could eventually help prepare a renewal decision/).textContent ?? "";
    expect(text).toMatch(/would not automatically buy insurance/);
    expect(text).toMatch(/would not.*automatically choose the best policy/);
  });
});
