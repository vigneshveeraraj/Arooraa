import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  ACIcon,
  BikeIcon,
  CarIcon,
  CheckIcon,
  CloudIcon,
  EnergyIcon,
  GatewayIcon,
  GroomingIcon,
  HouseIcon,
  LightbulbIcon,
  NailCareIcon,
  ObservationIcon,
  RoomIcon,
  RoutineIcon,
  SafetyIcon,
  SwitchIcon,
  WaterDropIcon,
  WrenchIcon,
} from "./SmartHomeIcons";

const ICONS = [
  LightbulbIcon,
  ACIcon,
  EnergyIcon,
  WaterDropIcon,
  WrenchIcon,
  SafetyIcon,
  RoutineIcon,
  RoomIcon,
  SwitchIcon,
  GatewayIcon,
  HouseIcon,
  CloudIcon,
  BikeIcon,
  CarIcon,
  GroomingIcon,
  NailCareIcon,
  ObservationIcon,
  CheckIcon,
];

describe("SmartHomeIcons", () => {
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
