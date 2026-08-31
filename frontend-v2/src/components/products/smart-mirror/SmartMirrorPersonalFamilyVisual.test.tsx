import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorPersonalFamilyVisual } from "./SmartMirrorPersonalFamilyVisual";

describe("SmartMirrorPersonalFamilyVisual", () => {
  it("explains My Space and Family Space as real, accessible text", () => {
    render(<SmartMirrorPersonalFamilyVisual />);
    expect(screen.getByText("My Space")).toBeInTheDocument();
    expect(screen.getByText("Private reminders, notes and personal information.")).toBeInTheDocument();
    expect(screen.getByText("Family Space")).toBeInTheDocument();
    expect(screen.getByText("Shared tasks, groceries, calendar items and household information.")).toBeInTheDocument();
  });

  it("does not expose identity or access-control internals", () => {
    render(<SmartMirrorPersonalFamilyVisual />);
    const text = document.body.textContent ?? "";
    const disallowed = [/user id/i, /household id/i, /access[- ]control implementation/i, /face[- ]recognition internals/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
