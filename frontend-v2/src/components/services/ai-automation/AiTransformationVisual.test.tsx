import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AiTransformationVisual } from "./AiTransformationVisual";

describe("AiTransformationVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<AiTransformationVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows all six flow steps, including the emphasized Human Review step", () => {
    const { container } = render(<AiTransformationVisual />);
    const text = container.textContent ?? "";
    expect(text).toBe("Manual InputUnderstand / ExtractBusiness RulesAI Where UsefulHuman ReviewAction / Product Experience");
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(6);
    expect(items[4]?.textContent).toBe("Human Review");
  });
});
