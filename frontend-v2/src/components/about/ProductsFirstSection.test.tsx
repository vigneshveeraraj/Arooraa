import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductsFirstSection } from "./ProductsFirstSection";

describe("ProductsFirstSection", () => {
  it("renders the own-product heading and trade-off list", () => {
    render(<ProductsFirstSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "We do not only advise people how to build products. We build our own." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Building our own products forces us to make the same trade-offs we help clients make."),
    ).toBeInTheDocument();
    expect(screen.getByText("architecture")).toBeInTheDocument();
  });
});
