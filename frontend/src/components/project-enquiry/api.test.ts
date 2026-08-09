import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitProjectEnquiry } from "./api";
import { EMPTY_FORM_VALUES, type ProjectEnquiryFormValues } from "./types";

function validValues(overrides: Partial<ProjectEnquiryFormValues> = {}): ProjectEnquiryFormValues {
  return {
    ...EMPTY_FORM_VALUES,
    serviceType: "CUSTOM_SOFTWARE",
    projectType: "NEW_PRODUCT",
    description: "We need a logistics tracking platform for our operations across five cities.",
    existingSystem: "no",
    budgetRange: "FROM_2L_TO_5L",
    timeline: "FROM_1_TO_3_MONTHS",
    name: "Arun Kumar",
    businessEmail: "arun@example.com",
    phone: "+919876543210",
    country: "India",
    preferredContactMethod: "PHONE",
    ...overrides,
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    json: async () => body,
  } as Response;
}

describe("submitProjectEnquiry", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the same-origin /api/leads/project-enquiries path", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, { enquiryId: "abc", enquiryNumber: "ARO-2026-000001", status: "RECEIVED", message: "Thanks" }),
    );

    await submitProjectEnquiry(validValues());

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leads/project-enquiries",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("maps form fields 1:1 onto the backend contract, with no reconciliation needed", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, { enquiryId: "abc", enquiryNumber: "ARO-2026-000001", status: "RECEIVED", message: "Thanks" }),
    );

    await submitProjectEnquiry(validValues());

    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const [, init] = call as [string, { body: string }];
    const body = JSON.parse(init.body);

    expect(body.name).toBe("Arun Kumar");
    expect(body.businessEmail).toBe("arun@example.com");
    expect(body.phone).toBe("+919876543210");
    expect(body.country).toBe("India");
    expect(body.serviceType).toBe("CUSTOM_SOFTWARE");
    expect(body.projectType).toBe("NEW_PRODUCT");
    expect(body.description).toContain("logistics tracking platform");
    expect(body.existingSystem).toBe(false);
    expect(body.budgetRange).toBe("FROM_2L_TO_5L");
    expect(body.timeline).toBe("FROM_1_TO_3_MONTHS");
    expect(body.preferredContactMethod).toBe("PHONE");
    expect(body.source).toBe("WEBSITE");
    expect(body.website).toBe("");
  });

  it("sends existingSystem as a real boolean", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, { enquiryId: "abc", enquiryNumber: "ARO-2026-000001", status: "RECEIVED", message: "Thanks" }),
    );

    await submitProjectEnquiry(validValues({ existingSystem: "yes" }));

    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(JSON.parse(init.body).existingSystem).toBe(true);
  });

  it("returns a RECEIVED success result with the enquiry number for 201", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, {
        enquiryId: "abc",
        enquiryNumber: "ARO-2026-000042",
        status: "RECEIVED",
        message: "Thank you.",
      }),
    );

    const result = await submitProjectEnquiry(validValues());

    expect(result).toEqual({
      status: "success",
      kind: "RECEIVED",
      message: "Thank you.",
      enquiryNumber: "ARO-2026-000042",
    });
  });

  it("returns an ALREADY_RECEIVED success result for 200", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        enquiryId: "abc",
        enquiryNumber: "ARO-2026-000042",
        status: "ALREADY_RECEIVED",
        message: "Already have it.",
      }),
    );

    const result = await submitProjectEnquiry(validValues());

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.kind).toBe("ALREADY_RECEIVED");
      expect(result.enquiryNumber).toBe("ARO-2026-000042");
    }
  });

  it("passes backend field errors straight through for 400 (field names already match)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: { businessEmail: "must be a well-formed email address" },
      }),
    );

    const result = await submitProjectEnquiry(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("VALIDATION");
      expect(result.fieldErrors?.businessEmail).toBe("must be a well-formed email address");
    }
  });

  it("returns a RATE_LIMITED error for 429", async () => {
    fetchMock.mockResolvedValue(jsonResponse(429, { code: "RATE_LIMITED", message: "Slow down." }));

    const result = await submitProjectEnquiry(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("RATE_LIMITED");
    }
  });

  it("returns a generic SERVER error without leaking backend details on 500", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(500, { code: "INTERNAL_ERROR", message: "jdbc:postgresql://internal-host failed" }),
    );

    const result = await submitProjectEnquiry(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("SERVER");
      expect(result.message).not.toContain("jdbc:postgresql");
    }
  });

  it("returns a NETWORK error when fetch throws", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await submitProjectEnquiry(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("NETWORK");
    }
  });
});
