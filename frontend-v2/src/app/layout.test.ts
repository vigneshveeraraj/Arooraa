import { describe, expect, it } from "vitest";
import { rootMetadata as metadata } from "./root-metadata";

describe("root metadata", () => {
  it("sets a production metadataBase, never localhost", () => {
    expect(metadata.metadataBase?.toString()).toBe("https://arooraa.com/");
  });

  it("indexes the site by default", () => {
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("declares a brand-level Open Graph and Twitter default", () => {
    expect(metadata.openGraph).toMatchObject({ siteName: "AROORAA", type: "website" });
    expect(metadata.twitter).toMatchObject({ card: "summary" });
  });

  it("has a non-empty default title and description as a fallback for any page that omits its own", () => {
    expect(typeof metadata.title).toBe("string");
    expect((metadata.title as string).length).toBeGreaterThan(0);
    expect((metadata.description as string).length).toBeGreaterThan(0);
  });
});
