import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhyAroora } from "./WhyAroora";
import { DIFFERENTIATORS } from "@/lib/content/why-arooraa";

describe("WhyAroora", () => {
  it("renders all six approved differentiators", () => {
    render(<WhyAroora />);
    expect(DIFFERENTIATORS).toHaveLength(6);
    for (const item of DIFFERENTIATORS) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it("does not use generic forbidden values language as a differentiator heading", () => {
    render(<WhyAroora />);
    const forbidden = [/^excellence$/i, /^innovation$/i, /^passion$/i, /^customer-first$/i];
    for (const item of DIFFERENTIATORS) {
      for (const pattern of forbidden) {
        expect(item.title).not.toMatch(pattern);
      }
    }
  });
});
