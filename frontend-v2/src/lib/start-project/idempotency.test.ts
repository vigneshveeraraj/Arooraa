import { beforeEach, describe, expect, it } from "vitest";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "./idempotency";

describe("idempotency key lifecycle", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("creates a key on first call", () => {
    const key = getOrCreateIdempotencyKey();
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns the same key on repeated calls, so a retry of a failed submission reuses it", () => {
    const first = getOrCreateIdempotencyKey();
    const second = getOrCreateIdempotencyKey();
    expect(second).toBe(first);
  });

  it("issues a new key after clearIdempotencyKey (real success, or Start New Enquiry)", () => {
    const first = getOrCreateIdempotencyKey();
    clearIdempotencyKey();
    const second = getOrCreateIdempotencyKey();
    expect(second).not.toBe(first);
  });
});
