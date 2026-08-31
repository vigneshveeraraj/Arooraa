import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SERVICE_LINKS,
  START_PROJECT_LINK,
} from "@/lib/content/navigation";

describe("SiteFooter", () => {
  it("renders the real logo images as the footer brand mark, accessibly linked home", () => {
    render(<SiteFooter />);
    const brand = screen.getByRole("link", { name: "AROORAA — home" });
    expect(brand).toHaveAttribute("href", "/");
    const images = brand.querySelectorAll("img");
    expect(images).toHaveLength(2);
    for (const img of images) {
      expect(img).toHaveAttribute("alt", "");
    }
  });

  it("keeps the existing footer description line — no duplicated tagline", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText("AROORAA turns ideas and business problems into production-ready digital products."),
    ).toBeInTheDocument();
  });

  it("renders every product, service, and company link with the correct href", () => {
    render(<SiteFooter />);
    for (const link of [...FOOTER_PRODUCT_LINKS, ...FOOTER_SERVICE_LINKS, ...FOOTER_COMPANY_LINKS]) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute("href", link.href);
    }
  });

  it("renders the Start a Project CTA", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: START_PROJECT_LINK.label })).toHaveAttribute(
      "href",
      START_PROJECT_LINK.href,
    );
  });

  it("removes Marion and the old M² route from the footer product list", () => {
    render(<SiteFooter />);
    expect(FOOTER_PRODUCT_LINKS.map((link) => link.label)).toEqual([
      "MESA",
      "Mindra",
      "Smart Mirror",
      "Arooraa Smart Home",
    ]);
    expect(screen.queryByText("Marion")).not.toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.some((link) => link.getAttribute("href") === "/products/m2")).toBe(false);
    expect(links.some((link) => link.getAttribute("href") === "/products/marion")).toBe(false);
  });

  it("uses Arooraa Smart Home, not the old Smart Home EB label, in the footer", () => {
    render(<SiteFooter />);
    expect(screen.getByText("Arooraa Smart Home")).toBeInTheDocument();
    expect(screen.queryByText("Smart Home EB")).not.toBeInTheDocument();
  });

  it("does not render any fabricated social or legal links", () => {
    render(<SiteFooter />);
    const disallowed = [/linkedin/i, /instagram/i, /youtube/i, /privacy/i, /terms/i, /twitter/i, /facebook/i];
    for (const pattern of disallowed) {
      expect(screen.queryByText(pattern)).not.toBeInTheDocument();
    }
  });
});
