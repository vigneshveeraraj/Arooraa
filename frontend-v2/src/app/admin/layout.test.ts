import { describe, expect, it } from "vitest";
import { metadata } from "./layout";

describe("admin metadata", () => {
  it("is never indexed or followed", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
