import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  ArriveIcon,
  BillIcon,
  CallWaiterIcon,
  KitchenIcon,
  MenuIcon,
  OrderIcon,
  PhoneIcon,
  PlayIcon,
  QrIcon,
  ServiceIcon,
} from "./JourneyIcons";

const ICONS = [ArriveIcon, QrIcon, PhoneIcon, MenuIcon, OrderIcon, CallWaiterIcon, PlayIcon, ServiceIcon, KitchenIcon, BillIcon];

describe("JourneyIcons", () => {
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
