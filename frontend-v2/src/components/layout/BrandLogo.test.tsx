import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { BrandLogo } from "./BrandLogo";

describe("BrandLogo", () => {
  it("renders both the symbol and wordmark images, decoratively", () => {
    const { container } = render(<BrandLogo />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    for (const img of images) {
      expect(img).toHaveAttribute("alt", "");
    }
  });

  it("points at the production brand asset paths", () => {
    const { container } = render(<BrandLogo />);
    const srcs = Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/images/brand/arooraa-symbol.webp");
    expect(srcs).toContain("/images/brand/arooraa-wordmark.webp");
  });

  it("carries explicit width/height to avoid layout shift", () => {
    const { container } = render(<BrandLogo />);
    for (const img of container.querySelectorAll("img")) {
      expect(img.getAttribute("width")).not.toBeNull();
      expect(img.getAttribute("height")).not.toBeNull();
    }
  });

  it("supports a larger footer sizing variant without changing the assets used", () => {
    const header = render(<BrandLogo size="header" />);
    const footer = render(<BrandLogo size="footer" />);
    const headerSrcs = Array.from(header.container.querySelectorAll("img")).map((i) => i.getAttribute("src"));
    const footerSrcs = Array.from(footer.container.querySelectorAll("img")).map((i) => i.getAttribute("src"));
    expect(headerSrcs).toEqual(footerSrcs);
  });
});
