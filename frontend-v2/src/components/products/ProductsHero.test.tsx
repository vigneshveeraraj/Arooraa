import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductsHero } from "./ProductsHero";
import { PRODUCTS_INDEX_HEADING } from "@/lib/content/products";

describe("ProductsHero", () => {
  it("renders the frozen products-index headline as the page h1", () => {
    render(<ProductsHero />);
    expect(screen.getByRole("heading", { level: 1, name: PRODUCTS_INDEX_HEADING.title })).toBeInTheDocument();
  });
});
