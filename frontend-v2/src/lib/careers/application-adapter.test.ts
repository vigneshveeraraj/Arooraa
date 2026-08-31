import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localJobApplicationAdapter, notConnectedJobApplicationAdapter, realJobApplicationAdapter } from "./application-adapter";
import type { JobApplicationSubmission } from "./application-types";

const SAMPLE_PAYLOAD: JobApplicationSubmission = {
  jobSlug: "ai-engineer",
  jobTitle: "AI Engineer",
  fullName: "Priya Sharma",
  email: "priya@example.com",
  phone: "+919876543210",
  currentLocation: "Chennai",
  experience: "3 years",
  linkedInUrl: "https://linkedin.com/in/priya",
  consent: true,
};

describe("notConnectedJobApplicationAdapter", () => {
  it("never reports success", async () => {
    const result = await notConnectedJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "key-1");
    expect(result.ok).toBe(false);
  });
});

describe("localJobApplicationAdapter", () => {
  it("resolves a successful result with a reference for architecture testing", async () => {
    const result = await localJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "key-1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.applicationReference).toBeTruthy();
  });
});

describe("realJobApplicationAdapter", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts multipart/form-data to the relative /api/leads path in production", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ applicationReference: "JOB-2026-000001", status: "RECEIVED", jobSlug: "ai-engineer", message: "Received." }),
        { status: 201 },
      ),
    );

    await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "idempotency-key-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/leads/careers/applications");
    expect(url).not.toMatch(/localhost|127\.0\.0\.1|:8090/);
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    const body = init.body as FormData;
    expect(body.get("jobSlug")).toBe("ai-engineer");
    expect(body.get("fullName")).toBe("Priya Sharma");
    expect(body.get("recruitmentConsent")).toBe("true");
    expect(body.has("resume")).toBe(false);
  });

  it("sends the idempotency key as a header", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ applicationReference: "JOB-2026-000002" }), { status: 201 }));

    await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "idempotency-key-2");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe("idempotency-key-2");
  });

  it("attaches the résumé file under the resume field when provided", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ applicationReference: "JOB-2026-000003" }), { status: 201 }));
    const file = new File(["%PDF-1.4"], "resume.pdf", { type: "application/pdf" });

    await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, file, "idempotency-key-3");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = init.body as FormData;
    expect(body.get("resume")).toBeInstanceOf(File);
    expect((body.get("resume") as File).name).toBe("resume.pdf");
  });

  it("only reports success after a real 201, and surfaces the backend's own reference — never a fabricated one", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ applicationReference: "JOB-2026-000004", jobSlug: "ai-engineer", message: "We've received your application." }), {
        status: 201,
      }),
    );

    const result = await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "key");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.applicationReference).toBe("JOB-2026-000004");
      expect(result.jobSlug).toBe("ai-engineer");
    }
  });

  it("maps a 409 idempotency conflict to an honest retry message", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "IDEMPOTENCY_CONFLICT" }), { status: 409 }));
    const result = await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "key");
    expect(result.ok).toBe(false);
  });

  it("maps a 429 to a rate-limited message", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "RATE_LIMITED" }), { status: 429 }));
    const result = await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "key");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/wait a few minutes/i);
  });

  it("maps a 400 validation failure to a generic, non-technical message — never surfacing field detail", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: "VALIDATION_ERROR", fieldErrors: { email: "Enter a valid email address." } }), { status: 400 }),
    );
    const result = await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "key");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).not.toMatch(/email/i);
  });

  it("maps a network failure to an honest error, never throwing", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await realJobApplicationAdapter.submitApplication(SAMPLE_PAYLOAD, null, "key");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/couldn't reach/i);
  });
});
