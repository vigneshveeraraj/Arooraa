import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("web app manifest", () => {
  it("declares the 192 and 512 icon sizes from the approved symbol", () => {
    const result = manifest();
    const sizes = result.icons?.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    for (const icon of result.icons ?? []) {
      expect(icon.src.startsWith("/images/brand/icon-")).toBe(true);
    }
  });

  it("uses the AROORAA name", () => {
    const result = manifest();
    expect(result.name).toBe("AROORAA");
  });
});
