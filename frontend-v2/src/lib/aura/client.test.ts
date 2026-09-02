import { afterEach, describe, expect, it, vi } from "vitest";
import { auraConversationsUrl, createAuraApiClient, safeSourceUrl } from "./client";

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    json: async () => body,
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Aura API client", () => {
  it("uses the same-origin path the dev proxy and the future reverse proxy both serve", () => {
    // No component contains a URL, and nothing hard-codes localhost: the browser asks its own
    // origin, and next.config.ts (locally) or Nginx (later) decides where that goes.
    expect(auraConversationsUrl()).toBe("/api/aura/conversations");
  });

  it("creates a conversation and returns its public id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(201, { conversationId: "c-1", assistantProfile: "AROORAA_WEBSITE", channel: "PUBLIC_WEB" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createAuraApiClient().createConversation();

    expect(result).toEqual({
      ok: true,
      value: { conversationId: "c-1", assistantProfile: "AROORAA_WEBSITE", channel: "PUBLIC_WEB" },
    });
  });

  it("sends the message and the current pathname", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { answer: "Hello.", sources: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await createAuraApiClient().sendMessage("c-1", "What is MESA?", "/products/mesa");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/aura/conversations/c-1/messages");
    expect(JSON.parse(String(init.body))).toEqual({ message: "What is MESA?", currentPath: "/products/mesa" });
  });

  it("keeps only the three fields a citation may have", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(200, {
          answer: "MESA is our flagship product.",
          sources: [
            {
              title: "MESA — Restaurant Technology Ecosystem",
              section: "What MESA does today",
              sourceUrl: "https://arooraa.com/products/mesa",
              // Nothing downstream has a field for these, and they are dropped here as well.
              similarity: 0.71,
              chunkId: "abc",
              knowledgeSpace: "AROORAA_PUBLIC",
            },
          ],
        }),
      ),
    );

    const result = await createAuraApiClient().sendMessage("c-1", "What is MESA?", null);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sources).toEqual([
      {
        title: "MESA — Restaurant Technology Ecosystem",
        section: "What MESA does today",
        sourceUrl: "https://arooraa.com/products/mesa",
      },
    ]);
  });

  it.each([
    [404, "CONVERSATION_NOT_FOUND"],
    [400, "INVALID_INPUT"],
    [429, "RATE_LIMITED"],
    [403, "UNAVAILABLE"],
    [503, "UNAVAILABLE"],
    [500, "SERVER"],
  ])("classifies HTTP %i as %s", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(status, {})));

    const result = await createAuraApiClient().sendMessage("c-1", "Hi", null);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe(kind);
    expect(result.message).not.toMatch(/\d{3}|Error|Exception|stack/i);
  });

  it("reports a refused connection as a network failure the visitor can retry", async () => {
    // The most likely local failure by far: aura-service simply is not running yet.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await createAuraApiClient().createConversation();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe("NETWORK");
    expect(result.retryable).toBe(true);
  });

  it("reports its own abort as a timeout rather than a network fault", async () => {
    const abortError = Object.assign(new Error("aborted"), { name: "AbortError" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    const result = await createAuraApiClient().sendMessage("c-1", "Hi", null);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe("TIMEOUT");
  });

  it("treats an empty answer as a server failure rather than rendering nothing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { answer: "   " })));

    const result = await createAuraApiClient().sendMessage("c-1", "Hi", null);

    expect(result.ok).toBe(false);
  });

  it("accepts only http(s) links as citation URLs", () => {
    expect(safeSourceUrl("https://arooraa.com/products/mesa")).toBe("https://arooraa.com/products/mesa");
    expect(safeSourceUrl("http://localhost:3000/x")).toBe("http://localhost:3000/x");
    expect(safeSourceUrl("javascript:alert(1)")).toBeNull();
    expect(safeSourceUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeSourceUrl("frontend-v2/src/lib/content/products.ts")).toBeNull();
    expect(safeSourceUrl(null)).toBeNull();
  });
});
