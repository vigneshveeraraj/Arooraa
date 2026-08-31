import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringBreadth } from "./EngineeringBreadth";
import { ENGINEERING_BREADTH_CONTENT } from "@/lib/content/products";

describe("EngineeringBreadth", () => {
  it("shows all four products with a distinct engineering domain each", () => {
    render(<EngineeringBreadth />);
    expect(ENGINEERING_BREADTH_CONTENT.domains).toHaveLength(4);
    for (const item of ENGINEERING_BREADTH_CONTENT.domains) {
      expect(screen.getByText(item.product)).toBeInTheDocument();
      expect(screen.getByText(item.domain)).toBeInTheDocument();
    }
    const domains = new Set(ENGINEERING_BREADTH_CONTENT.domains.map((item) => item.domain));
    expect(domains.size).toBe(ENGINEERING_BREADTH_CONTENT.domains.length);
  });
});
