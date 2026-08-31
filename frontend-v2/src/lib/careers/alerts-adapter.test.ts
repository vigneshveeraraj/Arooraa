import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localTalentAlertAdapter, notConnectedTalentAlertAdapter, realTalentAlertAdapter } from "./alerts-adapter";
import type { TalentAlertSubscription } from "./alerts-types";

const SAMPLE_PAYLOAD: TalentAlertSubscription = {
  name: "Priya Sharma",
  email: "priya@example.com",
  areasOfInterest: ["AI_DATA", "ANY_SUITABLE"],
  consent: true,
};

describe("notConnectedTalentAlertAdapter", () => {
  it("never reports success", async () => {
    const result = await notConnectedTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);
    expect(result.ok).toBe(false);
  });
});

describe("localTalentAlertAdapter", () => {
  it("resolves a successful result for architecture testing", async () => {
    const result = await localTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);
    expect(result.ok).toBe(true);
  });
});

describe("realTalentAlertAdapter", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts JSON to the relative /api/leads path in production", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: "SUBSCRIBED", message: "You're on the list." }), { status: 201 }));

    await realTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/leads/careers/talent-community");
    expect(url).not.toMatch(/localhost|127\.0\.0\.1|:8090/);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("translates the frontend's ANY_SUITABLE value to the backend's ANY on the wire only", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: "SUBSCRIBED" }), { status: 201 }));

    await realTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { areasOfInterest: string[] };
    expect(body.areasOfInterest).toContain("ANY");
    expect(body.areasOfInterest).not.toContain("ANY_SUITABLE");
  });

  it("sends consentAccepted as the wire field name, always true (never pre-checked before submit is reachable)", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: "SUBSCRIBED" }), { status: 201 }));

    await realTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { consentAccepted: boolean };
    expect(body.consentAccepted).toBe(true);
  });

  it("only reports success after a real 201", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: "SUBSCRIBED", message: "You're on the list." }), { status: 201 }));
    const result = await realTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);
    expect(result).toEqual({ ok: true, message: "You're on the list." });
  });

  it("maps a 429 to a rate-limited message", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "RATE_LIMITED" }), { status: 429 }));
    const result = await realTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/wait a few minutes/i);
  });

  it("maps a 400 validation failure to a generic message", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "VALIDATION_ERROR" }), { status: 400 }));
    const result = await realTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);
    expect(result.ok).toBe(false);
  });

  it("maps a network failure to an honest error, never throwing", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await realTalentAlertAdapter.subscribe(SAMPLE_PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/couldn't reach/i);
  });
});
