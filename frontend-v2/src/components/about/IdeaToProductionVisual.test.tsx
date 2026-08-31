import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IdeaToProductionVisual } from "./IdeaToProductionVisual";

describe("IdeaToProductionVisual", () => {
  it("renders all nine journey stages as real text, in order", () => {
    render(<IdeaToProductionVisual />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(9);
    expect(items[0]).toHaveTextContent("Discovery");
    expect(items[8]).toHaveTextContent("Continuous Support");
  });
});
