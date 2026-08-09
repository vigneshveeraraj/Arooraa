import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitDemoRequest } from "./api";
import { EMPTY_FORM_VALUES, type DemoRequestFormValues } from "./types";

function validValues(overrides: Partial<DemoRequestFormValues> = {}): DemoRequestFormValues {
  return {
    ...EMPTY_FORM_VALUES,
    fullName: "Priya Sharma",
    whatsappNumber: "9876543210",
    businessEmail: "priya@spiceroute.example",
    restaurantName: "Spice Route",
    city: "Chennai",
    outletCount: "ONE",
    interestedProduct: "kitchen-display",
    preferredContactMethod: "whatsapp",
    message: "Looking to switch from paper KOTs.",
    ...overrides,
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    json: async () => body,
  } as Response;
}

describe("submitDemoRequest", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to the same-origin /api/leads/demo-requests path", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, { requestId: "abc", status: "RECEIVED", message: "Thanks" }),
    );

    await submitDemoRequest(validValues());

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leads/demo-requests",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("maps frontend fields onto the backend's exact contract", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, { requestId: "abc", status: "RECEIVED", message: "Thanks" }),
    );

    await submitDemoRequest(validValues());

    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const [, init] = call as [string, { body: string }];
    const body = JSON.parse(init.body);

    expect(body.contactName).toBe("Priya Sharma");
    expect(body.restaurantName).toBe("Spice Route");
    expect(body.whatsappNumber).toBe("9876543210");
    expect(body.city).toBe("Chennai");
    expect(body.outletCount).toBe("ONE");
    expect(body.restaurantType).toBe("OTHER");
    expect(body.primaryChallenge).toBe("KITCHEN_COORDINATION");
    expect(body.businessEmail).toBe("priya@spiceroute.example");
    expect(body.additionalMessage).toContain("Preferred contact method: WhatsApp");
    expect(body.additionalMessage).toContain("Looking to switch from paper KOTs.");
    expect(body.website).toBe("");
  });

  it("returns a RECEIVED success result for 201", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, { requestId: "abc", status: "RECEIVED", message: "Thank you." }),
    );

    const result = await submitDemoRequest(validValues());

    expect(result).toEqual({ status: "success", kind: "RECEIVED", message: "Thank you." });
  });

  it("returns an ALREADY_RECEIVED success result for 200", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { requestId: "abc", status: "ALREADY_RECEIVED", message: "Already have it." }),
    );

    const result = await submitDemoRequest(validValues());

    expect(result).toEqual({ status: "success", kind: "ALREADY_RECEIVED", message: "Already have it." });
  });

  it("maps backend field errors back onto frontend field names for 400", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: { whatsappNumber: "Enter a valid Indian mobile number." },
      }),
    );

    const result = await submitDemoRequest(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("VALIDATION");
      expect(result.fieldErrors?.whatsappNumber).toBe("Enter a valid Indian mobile number.");
    }
  });

  it("returns a RATE_LIMITED error for 429", async () => {
    fetchMock.mockResolvedValue(jsonResponse(429, { code: "RATE_LIMITED", message: "Slow down." }));

    const result = await submitDemoRequest(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("RATE_LIMITED");
    }
  });

  it("returns a generic SERVER error without leaking backend details on 500", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(500, { code: "INTERNAL_ERROR", message: "jdbc:postgresql://internal-host failed" }),
    );

    const result = await submitDemoRequest(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("SERVER");
      expect(result.message).not.toContain("jdbc:postgresql");
    }
  });

  it("returns a NETWORK error when fetch throws", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await submitDemoRequest(validValues());

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.kind).toBe("NETWORK");
    }
  });
});
