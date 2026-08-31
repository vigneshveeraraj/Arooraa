import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductsSnapshot } from "./ProductsSnapshot";
import { PRODUCTS_SNAPSHOT } from "@/lib/content/home";

describe("ProductsSnapshot", () => {
  it('uses "Our Products" as the section heading, not "Built by AROORAA"', () => {
    render(<ProductsSnapshot />);
    expect(screen.getByRole("heading", { name: "Our Products" })).toBeInTheDocument();
    expect(screen.queryByText(/built by aroora/i)).not.toBeInTheDocument();
  });

  it("shows exactly the four approved products, in order, with no Marion card", () => {
    render(<ProductsSnapshot />);
    expect(PRODUCTS_SNAPSHOT).toHaveLength(4);
    expect(PRODUCTS_SNAPSHOT.map((product) => product.name)).toEqual([
      "MESA",
      "Mindra",
      "Smart Mirror",
      "Arooraa Smart Home",
    ]);
    for (const product of PRODUCTS_SNAPSHOT) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    }
    expect(screen.queryByText("Marion")).not.toBeInTheDocument();
    expect(screen.queryByText("M²")).not.toBeInTheDocument();
    expect(screen.queryByText("Smart Home EB")).not.toBeInTheDocument();
  });

  it("renders a working Explore link with the correct frozen route for every product", () => {
    render(<ProductsSnapshot />);
    for (const product of PRODUCTS_SNAPSHOT) {
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
    const links = screen.getAllByRole("link");
    expect(links.some((link) => link.getAttribute("href") === "/products/m2")).toBe(false);
    expect(links.some((link) => link.getAttribute("href") === "/products/marion")).toBe(false);
  });

  it("keeps Arooraa Smart Home's homepage wording restrained — no invented metrics or commercial claims", () => {
    render(<ProductsSnapshot />);
    const text = document.body.textContent ?? "";
    const disallowedClaims = [
      /\d+%/,
      /energy savings/i,
      /smart-meter/i,
      /predictive power/i,
      /now available/i,
      /commercially available/i,
    ];
    for (const pattern of disallowedClaims) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not render legacy AI-first or MESA-only company positioning", () => {
    render(<ProductsSnapshot />);
    expect(screen.queryByText(/AI-first/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MESA is our flagship/i)).not.toBeInTheDocument();
  });
});
