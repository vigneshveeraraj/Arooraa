import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  CalendarIcon,
  ChipIcon,
  ClockIcon,
  DisplayIcon,
  DoorIcon,
  DumbbellIcon,
  EyeIcon,
  FamilyIcon,
  FrameIcon,
  LockIcon,
  MirrorIcon,
  MoonIcon,
  PhoneIcon,
  ScissorsIcon,
  SunIcon,
  WelcomeIcon,
} from "./SmartMirrorIcons";

const ICONS = [
  MirrorIcon,
  ClockIcon,
  CalendarIcon,
  FamilyIcon,
  DumbbellIcon,
  ScissorsIcon,
  WelcomeIcon,
  SunIcon,
  MoonIcon,
  DoorIcon,
  ChipIcon,
  DisplayIcon,
  FrameIcon,
  LockIcon,
  PhoneIcon,
  EyeIcon,
];

describe("SmartMirrorIcons", () => {
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
