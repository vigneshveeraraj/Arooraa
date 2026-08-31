import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FragmentationToConnectedVisual } from "./FragmentationToConnectedVisual";

describe("FragmentationToConnectedVisual", () => {
  it("renders the same four fragments in both a scattered and a connected state, as real text", () => {
    render(<FragmentationToConnectedVisual />);
    expect(screen.getByText("Fragmented")).toBeInTheDocument();
    expect(screen.getByText("Connected around the table")).toBeInTheDocument();
    for (const fragment of ["Guest / Menu", "Waiter / Order", "Kitchen", "Billing"]) {
      expect(screen.getAllByText(fragment)).toHaveLength(2);
    }
  });
});
