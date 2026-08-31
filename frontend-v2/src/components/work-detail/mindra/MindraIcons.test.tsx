import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  BookmarkIcon,
  ContactIcon,
  FamilyIcon,
  GroceryIcon,
  IdentityIcon,
  MealIcon,
  NoteIcon,
  PlanIcon,
  ReminderIcon,
  SearchIcon,
  SyncIcon,
  TaskIcon,
  TodayIcon,
  VoiceIcon,
} from "./MindraIcons";

const ICONS = [
  NoteIcon,
  TaskIcon,
  BookmarkIcon,
  ContactIcon,
  GroceryIcon,
  MealIcon,
  FamilyIcon,
  ReminderIcon,
  SearchIcon,
  SyncIcon,
  IdentityIcon,
  TodayIcon,
  VoiceIcon,
  PlanIcon,
];

describe("MindraIcons", () => {
  it("renders every icon as a single aria-hidden, textless svg", () => {
    for (const Icon of ICONS) {
      const { container } = render(<Icon />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(container.textContent).toBe("");
    }
  });
});
