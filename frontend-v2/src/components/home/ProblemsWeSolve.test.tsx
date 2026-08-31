import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProblemsWeSolve } from "./ProblemsWeSolve";
import { PROBLEM_STATEMENTS, getServiceGroup } from "@/lib/content/services";

describe("ProblemsWeSolve", () => {
  it("shows all five approved problem scenarios", () => {
    render(<ProblemsWeSolve />);
    expect(PROBLEM_STATEMENTS).toHaveLength(5);
    for (const item of PROBLEM_STATEMENTS) {
      expect(screen.getByText(item.problem)).toBeInTheDocument();
    }
  });

  it("links each problem to its expected service destination(s)", () => {
    render(<ProblemsWeSolve />);
    const links = screen.getAllByRole("link");
    for (const item of PROBLEM_STATEMENTS) {
      for (const serviceId of item.serviceIds) {
        const service = getServiceGroup(serviceId);
        const match = links.find(
          (link) => link.getAttribute("href") === service.href && link.textContent?.includes(service.name),
        );
        expect(match).toBeTruthy();
      }
    }
  });

  it("does not use generic agency or buzzword language", () => {
    render(<ProblemsWeSolve />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /digital transformation solutions/i,
      /future-ready innovation/i,
      /synergistic cloud transformation/i,
      /accelerate your digital journey/i,
      /unlock exponential value/i,
      /ai-first/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
