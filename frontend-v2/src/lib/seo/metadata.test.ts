import { describe, expect, it } from "vitest";
import { pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  it("sets a canonical alternate from the given root-relative path", () => {
    const result = pageMetadata({ title: "MESA | AROORAA", description: "desc", path: "/products/mesa" });
    expect(result.alternates?.canonical).toBe("/products/mesa");
  });

  it("mirrors title/description into an Open Graph preview scoped to the page", () => {
    const result = pageMetadata({ title: "MESA | AROORAA", description: "desc", path: "/products/mesa" });
    expect(result.openGraph).toMatchObject({
      title: "MESA | AROORAA",
      description: "desc",
      url: "/products/mesa",
      type: "website",
    });
  });

  it("defaults type to website and allows overriding to article", () => {
    const result = pageMetadata({ title: "t", description: "d", path: "/insights/x", type: "article" });
    expect(result.openGraph).toMatchObject({ type: "article" });
  });

  it("only sets robots when explicitly provided, leaving the site-wide default otherwise", () => {
    const withoutOverride = pageMetadata({ title: "t", description: "d", path: "/about" });
    expect(withoutOverride.robots).toBeUndefined();

    const withOverride = pageMetadata({
      title: "t",
      description: "d",
      path: "/design-system",
      robots: { index: false, follow: false },
    });
    expect(withOverride.robots).toEqual({ index: false, follow: false });
  });
});
