import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "./ProductList";
import { PRODUCTS } from "@/lib/content/products";

describe("ProductList", () => {
  it("renders exactly the four approved products, in order", () => {
    render(<ProductList />);
    expect(PRODUCTS).toHaveLength(4);
    expect(PRODUCTS.map((product) => product.name)).toEqual(["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]);
    for (const product of PRODUCTS) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }
  });

  it("does not include Marion or the old M² name", () => {
    render(<ProductList />);
    expect(screen.queryByText("Marion")).not.toBeInTheDocument();
    expect(screen.queryByText("M²")).not.toBeInTheDocument();
  });

  it("links each product to its approved frozen route", () => {
    render(<ProductList />);
    for (const product of PRODUCTS) {
      expect(screen.getByRole("link", { name: `Explore ${product.name}` })).toHaveAttribute("href", product.href);
    }
    expect(screen.getByRole("link", { name: "Explore Smart Mirror" })).toHaveAttribute(
      "href",
      "/products/smart-mirror",
    );
    expect(screen.getByRole("link", { name: "Explore Arooraa Smart Home" })).toHaveAttribute(
      "href",
      "/products/smart-home-eb",
    );
  });

  it("keeps Arooraa Smart Home's Products Index wording restrained", () => {
    render(<ProductList />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /\d+%/,
      /energy savings/i,
      /smart-meter/i,
      /predictive power/i,
      /now available/i,
      /commercially available/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
