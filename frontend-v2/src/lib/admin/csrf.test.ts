import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminFetch } from "./csrf";

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

describe("adminFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    document.cookie = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the same-origin /api/admin path with credentials included", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { ok: true }));
    await adminFetch("/dashboard?timezone=UTC");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/dashboard?timezone=UTC",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("reads the XSRF-TOKEN cookie and echoes it as a request header", async () => {
    document.cookie = "XSRF-TOKEN=test-csrf-token";
    fetchMock.mockResolvedValueOnce(mockResponse(204, null));

    await adminFetch("/leads/PROJECT_ENQUIRY/123/status", { method: "PATCH" });

    const [, init] = fetchMock.mock.calls[0]!;
    expect((init.headers as Record<string, string>)["X-XSRF-TOKEN"]).toBe("test-csrf-token");
  });

  it("maps a 204 response to an ok result with no body", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(204, null));
    const result = await adminFetch("/leads/PROJECT_ENQUIRY/123/status", { method: "PATCH" });
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it.each([
    [401, "UNAUTHENTICATED"],
    [403, "FORBIDDEN"],
    [400, "VALIDATION"],
    [404, "NOT_FOUND"],
    [409, "CONFLICT"],
    [429, "RATE_LIMITED"],
    [500, "SERVER"],
  ] as const)("maps HTTP %i to error kind %s", async (status, kind) => {
    fetchMock.mockResolvedValueOnce(mockResponse(status, { message: "backend message" }));
    const result = await adminFetch("/leads");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe(kind);
  });

  it("maps a network failure to a NETWORK error, never throwing", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const result = await adminFetch("/leads");
    expect(result).toEqual({
      ok: false,
      error: { kind: "NETWORK", message: "We couldn't reach the server. Check your connection and try again." },
    });
  });
});
