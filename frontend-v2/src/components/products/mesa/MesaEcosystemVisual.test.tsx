import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MesaEcosystemVisual } from "./MesaEcosystemVisual";

describe("MesaEcosystemVisual", () => {
  it("stays hidden from assistive tech — purely decorative, no unique information", () => {
    const { container } = render(<MesaEcosystemVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
