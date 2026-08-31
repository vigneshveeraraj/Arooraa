import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localContactAdapter, notConnectedContactAdapter, realContactAdapter } from "./adapter";
import type { ContactMessageSubmission } from "./types";

const SAMPLE_PAYLOAD: ContactMessageSubmission = {
  name: "Priya Sharma",
  email: "priya@example.com",
  reason: "PARTNERSHIP",
  message: "We'd like to explore a partnership with AROORAA.",
};

describe("notConnectedContactAdapter", () => {
  it("never reports success", async () => {
    const result = await notConnectedContactAdapter.submit(SAMPLE_PAYLOAD, "key-1");
    expect(result.ok).toBe(false);
  });
});

describe("localContactAdapter", () => {
  it("resolves a successful result for architecture testing", async () => {
    const result = await localContactAdapter.submit(SAMPLE_PAYLOAD, "key-1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.contactReference).toBeTruthy();
  });
});

describe("realContactAdapter", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts JSON to the relative /api/leads path in production", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ contactReference: "CNT-2026-000001", status: "NEW", message: "Received." }), { status: 201 }),
    );

    await realContactAdapter.submit(SAMPLE_PAYLOAD, "idempotency-key-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/leads/contact/messages");
    expect(url).not.toMatch(/localhost|127\.0\.0\.1|:8090/);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe("idempotency-key-1");
  });

  it("only reports success after a real 201, and surfaces the backend's own reference — never a fabricated one", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ contactReference: "CNT-2026-000004", message: "We've received your message." }), { status: 201 }),
    );

    const result = await realContactAdapter.submit(SAMPLE_PAYLOAD, "key");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.contactReference).toBe("CNT-2026-000004");
  });

  it("maps a 409 idempotency conflict to an honest retry message", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "IDEMPOTENCY_CONFLICT" }), { status: 409 }));
    const result = await realContactAdapter.submit(SAMPLE_PAYLOAD, "key");
    expect(result.ok).toBe(false);
  });

  it("maps a 429 to a rate-limited message", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "RATE_LIMITED" }), { status: 429 }));
    const result = await realContactAdapter.submit(SAMPLE_PAYLOAD, "key");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/wait a few minutes/i);
  });

  it("maps a network failure to an honest error, never throwing", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await realContactAdapter.submit(SAMPLE_PAYLOAD, "key");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/couldn't reach/i);
  });
});
