import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraLifeDashboard } from "./MindraLifeDashboard";

describe("MindraLifeDashboard", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<MindraLifeDashboard />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the six conceptual dashboard areas with safe example content", () => {
    render(<MindraLifeDashboard />);
    expect(screen.getByText("Mindra Today")).toBeInTheDocument();
    expect(screen.getByText("Today's Plan")).toBeInTheDocument();
    expect(screen.getByText("Family Tasks")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Meal Plan")).toBeInTheDocument();
    expect(screen.getByText("My Space")).toBeInTheDocument();
    expect(screen.getByText("3 of 6")).toBeInTheDocument();
  });

  it("uses restrained status tags, not gamified badges", () => {
    render(<MindraLifeDashboard />);
    expect(screen.getAllByText("Today").length).toBeGreaterThan(0);
    for (const tag of ["Due", "Shared", "Family"]) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
  });

  it("does not publish fake usage or adoption metrics", () => {
    render(<MindraLifeDashboard />);
    const text = document.body.textContent ?? "";
    const disallowed = [/%/, /\d+\+? families/i, /\d+\+? users/i, /streak/i, /points/i, /level \d/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not present itself as a real production screenshot", () => {
    render(<MindraLifeDashboard />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/9:41 am/i);
    expect(text).not.toMatch(/battery/i);
    expect(text).not.toMatch(/version \d/i);
  });

  it("does not expose internal implementation detail", () => {
    render(<MindraLifeDashboard />);
    const text = document.body.textContent ?? "";
    const disallowed = [/database/i, /household id/i, /user id/i, /jwt/i, /authorization/i, /conflict resolution/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
