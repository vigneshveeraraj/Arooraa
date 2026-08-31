import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localProjectEnquiryAdapter, realProjectEnquiryAdapter } from "./adapter";
import { buildSubmission } from "./build-submission";
import { EMPTY_FORM_VALUES } from "./types";

const SAMPLE_PAYLOAD = buildSubmission(
  {
    ...EMPTY_FORM_VALUES,
    solutionModel: "NEW_PRODUCT",
    engagementModel: "DISCOVER_DEFINE",
    problemStatement: "A real business problem described in enough detail to be useful.",
    projectStage: "IDEA",
    timeline: "ASAP",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9876543210",
    country: "IN",
    preferredContactMethod: "EMAIL",
  },
  {},
);

describe("localProjectEnquiryAdapter", () => {
  it("resolves a successful result without fabricating a reference number", async () => {
    const result = await localProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.referenceNumber).toBeUndefined();
      expect(result.message).toMatch(/production lead workflow is connected/i);
    }
  });
});

describe("realProjectEnquiryAdapter", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the relative /api/leads path in production (NEXT_PUBLIC_API_BASE_URL unset) — the same reverse-proxy convention the old frontend uses", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ enquiryNumber: "ARO-2026-000001", message: "Received." }), { status: 201 }),
    );

    await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "key-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/leads/project-enquiries");
    expect(url).not.toMatch(/localhost|127\.0\.0\.1|:8090/);
    expect(init.method).toBe("POST");
  });

  it("sends the idempotency key as a header when one is provided", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ enquiryNumber: "ARO-2026-000001" }), { status: 201 }));

    await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "client-key-42");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("Idempotency-Key")).toBe("client-key-42");
  });

  it("omits the idempotency header entirely when no key is provided", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ enquiryNumber: "ARO-2026-000001" }), { status: 201 }));

    await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.has("Idempotency-Key")).toBe(false);
  });

  it("surfaces the backend's real enquiry number and message on 201 — never a fabricated one", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ enquiryNumber: "ARO-2026-000042", message: "Your project enquiry has been received." }),
        { status: 201 },
      ),
    );

    const result = await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "key-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.referenceNumber).toBe("ARO-2026-000042");
      expect(result.message).toBe("Your project enquiry has been received.");
    }
  });

  it("treats 200 (idempotent replay / already-received) as success too", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ enquiryNumber: "ARO-2026-000042", message: "Already received." }), {
        status: 200,
      }),
    );

    const result = await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "key-1");
    expect(result.ok).toBe(true);
  });

  it("maps 409 idempotency conflicts to a simple, non-technical message", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: "IDEMPOTENCY_CONFLICT" }), { status: 409 }),
    );

    const result = await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "key-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).not.toMatch(/idempotency|conflict/i);
    }
  });

  it("maps 429 rate limiting to a simple, non-technical message", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "RATE_LIMITED" }), { status: 429 }));

    const result = await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "key-1");
    expect(result.ok).toBe(false);
  });

  it("never leaks field-error or server-internal details from a 400/500 response", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ code: "VALIDATION_ERROR", fieldErrors: { businessEmail: "must not be blank" } }),
        { status: 400 },
      ),
    );

    const result = await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "key-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).not.toMatch(/businessEmail|VALIDATION_ERROR/);
    }
  });

  it("reports a network failure without throwing", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await realProjectEnquiryAdapter.submit(SAMPLE_PAYLOAD, "key-1");
    expect(result.ok).toBe(false);
  });
});

// W3.2B.1: local development (`next dev`) has no reverse proxy in front of it, unlike
// production's Nginx — so with NEXT_PUBLIC_API_BASE_URL set, the adapter must call the
// backend directly, using its real /api/v1 contract path rather than the production-only
// /api/leads alias a proxy would otherwise translate. The module reads this env var at load
// time (matching the pre-existing NEXT_PUBLIC_API_BASE_PATH pattern above), so exercising
// both branches means resetting modules and re-importing between them.
describe("realProjectEnquiryAdapter — NEXT_PUBLIC_API_BASE_URL set (local development)", () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_API_BASE_URL;
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8090";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("posts directly to the backend's real /api/v1 contract path, not the production /api/leads alias", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ enquiryNumber: "ARO-2026-000001", message: "Received." }), { status: 201 }),
    );
    const { realProjectEnquiryAdapter: devAdapter } = await import("./adapter");

    await devAdapter.submit(SAMPLE_PAYLOAD, "key-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8090/api/v1/project-enquiries");
    expect(url).not.toContain("/api/leads");
  });

  it("still sends the idempotency header when calling the backend directly", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ enquiryNumber: "ARO-2026-000001" }), { status: 201 }));
    const { realProjectEnquiryAdapter: devAdapter } = await import("./adapter");

    await devAdapter.submit(SAMPLE_PAYLOAD, "dev-key-1");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("Idempotency-Key")).toBe("dev-key-1");
  });

  it("sends the same wire payload shape as the production path", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ enquiryNumber: "ARO-2026-000001" }), { status: 201 }));
    const { realProjectEnquiryAdapter: devAdapter } = await import("./adapter");

    await devAdapter.submit(SAMPLE_PAYLOAD, "dev-key-1");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.submissionVersion).toBe("GUIDED");
    expect(body.solutionModel).toBe("NEW_PRODUCT");
  });
});
