import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringProof } from "./EngineeringProof";
import { CAPABILITY_GROUPS, ENGINEERING_LABEL } from "@/lib/content/engineering";

describe("EngineeringProof", () => {
  it("renders exactly nine capability groups with the expected names", () => {
    render(<EngineeringProof />);
    expect(CAPABILITY_GROUPS).toHaveLength(9);
    const expectedNames = [
      "Architecture",
      "Backend",
      "Frontend",
      "Mobile",
      "Data",
      "AI",
      "Cloud",
      "Security",
      "Quality",
    ];
    expect(CAPABILITY_GROUPS.map((group) => group.name)).toEqual(expectedNames);
    for (const name of expectedNames) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('uses "Technologies we engineer with", not partnership/certification wording', () => {
    render(<EngineeringProof />);
    expect(screen.getByText(ENGINEERING_LABEL)).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\bpartners?\b/i);
    expect(text).not.toMatch(/certified/i);
    expect(text).not.toMatch(/certification/i);
  });
});
