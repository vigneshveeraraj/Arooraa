import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorEngineeringVisual } from "./SmartMirrorEngineeringVisual";

const HARDWARE_LABELS = [
  "Reflective acrylic surface",
  "Digital display",
  "Raspberry Pi 5 edge platform",
  "Slim frame",
  "Rear mounting system",
];

describe("SmartMirrorEngineeringVisual", () => {
  it("renders the real exploded-construction concept photograph with descriptive alt text", () => {
    render(<SmartMirrorEngineeringVisual />);
    const image = screen.getByRole("img", {
      name: "Exploded Smart Mirror concept showing reflective acrylic surface, display panel, Raspberry Pi 5 and rear mounting system.",
    });
    expect(image).toHaveAttribute("src", "/images/products/smart-mirror/smart-mirror-build-exploded.webp");
  });

  it("explains the acrylic surface and display as real, visible text", () => {
    render(<SmartMirrorEngineeringVisual />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/reflective acrylic surface/i);
    expect(text).toMatch(/digital display/i);
    expect(text).toMatch(/behaves like a mirror/i);
  });

  it("names Raspberry Pi 5 as real, visible text with prototype-only framing", () => {
    render(<SmartMirrorEngineeringVisual />);
    expect(screen.getAllByText(/Raspberry Pi 5/).length).toBeGreaterThan(0);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/prototype direction/i);
    expect(text).not.toMatch(/official raspberry pi partner/i);
    expect(text).not.toMatch(/certified/i);
    expect(text).not.toMatch(/sponsorship/i);
  });

  it("renders all five semantic hardware summary labels as real, accessible text", () => {
    render(<SmartMirrorEngineeringVisual />);
    for (const label of HARDWARE_LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("does not expose wiring, dimensions, or bill-of-materials detail", () => {
    render(<SmartMirrorEngineeringVisual />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /port \d/i,
      /protocol/i,
      /topology/i,
      /credentials/i,
      /ip address/i,
      /bill of materials/i,
      /wiring diagram/i,
      /power supply spec/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
