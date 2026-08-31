import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringFoundationVisual } from "./EngineeringFoundationVisual";

describe("EngineeringFoundationVisual", () => {
  it("renders the clean product surface and the six public-safe foundation layers", () => {
    render(<EngineeringFoundationVisual />);
    expect(screen.getByText("The calm Mindra experience")).toBeInTheDocument();
    for (const layer of ["Identity", "Personal / Shared Boundaries", "Search", "APIs", "Sync / State", "Notifications"]) {
      expect(screen.getByText(layer)).toBeInTheDocument();
    }
  });

  it("does not expose confidential implementation terminology", () => {
    render(<EngineeringFoundationVisual />);
    const text = screen.getByText("The calm Mindra experience").closest("div")?.parentElement?.textContent?.toLowerCase() ?? "";
    for (const term of ["redis", "kafka", "postgres", "spring boot", "react native", "expo", "repository", "database schema"]) {
      expect(text).not.toContain(term);
    }
  });
});
