import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductsCta } from "./ProductsCta";
import { PRODUCTS_CTA_CONTENT } from "@/lib/content/products";

describe("ProductsCta", () => {
  it("links Start a Project to /start-project", () => {
    render(<ProductsCta />);
    expect(screen.getByRole("link", { name: PRODUCTS_CTA_CONTENT.cta.label })).toHaveAttribute(
      "href",
      PRODUCTS_CTA_CONTENT.cta.href,
    );
  });
});
