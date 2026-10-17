import { afterEach, describe, expect, it, vi } from "vitest";
import { realLeadCaptureAdapter, toWirePayload } from "./adapter";
import { LEAD_COPY } from "./copy";
import { normalizeIndianMobile } from "./phone";
import { LEAD_REQUIREMENTS, type LeadCaptureSubmission } from "./types";
import { leadWhatsAppUrl } from "./whatsapp";

const SUBMISSION: LeadCaptureSubmission = {
  requirement: "CUSTOMER_ENQUIRIES",
  phone: "+919876543210",
  consent: true,
  consentText: LEAD_COPY.ta.consentLabel,
  sourceLocale: "ta",
  attribution: { sourcePage: "/campaign", utmSource: "meta", utmCampaign: "tn-growth" },
};

describe("normalizeIndianMobile", () => {
  it.each([
    ["9876543210", "+919876543210"],
    ["98765 43210", "+919876543210"],
    ["98765-43210", "+919876543210"],
    ["+91 98765 43210", "+919876543210"],
    ["919876543210", "+919876543210"],
    ["09876543210", "+919876543210"],
    ["6000000000", "+916000000000"],
  ])("accepts %s", (raw, expected) => {
    expect(normalizeIndianMobile(raw)).toBe(expected);
  });

  it.each(["", "5876543210", "987654321", "98765432100", "+1 9876543210", "98765abcde"])("rejects %s", (raw) => {
    expect(normalizeIndianMobile(raw)).toBeNull();
  });
});

describe("leadWhatsAppUrl", () => {
  it("opens AROORAA's chat with a message in the source language", () => {
    const url = new URL(leadWhatsAppUrl({ locale: "en", requirement: "WEBSITE", leadReference: "LC-7Q2M9X" }));
    expect(url.origin + url.pathname).toBe("https://wa.me/918220503447");
    expect(url.searchParams.get("text")).toBe(
      "Hi AROORAA, I'd like a free consultation about: A new website or a website redesign. Reference: LC-7Q2M9X",
    );
  });

  it("keeps on-page word joiners out of the chat message", () => {
    const text = new URL(leadWhatsAppUrl({ locale: "ta" })).searchParams.get("text")!;
    expect(text).toBe("வணக்கம் AROORAA, என் business-க்கு free consultation வேண்டும்.");
  });
});

describe("lead copy", () => {
  const PRICE = /₹|\bRs\.?\s*\d|\bINR\b|ரூ|\d{1,3}(,\d{2,3})+|\d\s*\/-|\b\d{4,6}\b|price|cost|விலை|கட்டணம்/i;

  function strings(value: unknown): string[] {
    if (typeof value === "string") return [value];
    if (typeof value === "function") return [String(value("X"))];
    return Object.values(value as object).flatMap(strings);
  }

  it.each(["en", "ta"] as const)("%s has a label for every requirement and never mentions a price", (locale) => {
    const copy = LEAD_COPY[locale];
    for (const requirement of LEAD_REQUIREMENTS) expect(copy.requirements[requirement]).toBeTruthy();
    for (const text of strings(copy)) expect(text).not.toMatch(PRICE);
  });
});

describe("realLeadCaptureAdapter", () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubFetch(response: Response | Error) {
    const fetchMock = vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response)));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("posts only the minimal lead to the proxied endpoint with an idempotency key", async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify({ leadReference: "LC-7Q2M9X" }), { status: 201 }));
    await expect(realLeadCaptureAdapter.submit(SUBMISSION, "key-1")).resolves.toEqual({ ok: true, leadReference: "LC-7Q2M9X" });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/lead-captures$/);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Idempotency-Key": "key-1" });
    const body = JSON.parse(String(init.body));
    expect(body).toEqual(toWirePayload(SUBMISSION));
    expect(Object.keys(body)).not.toEqual(expect.arrayContaining(["name"]));
    expect(body).toMatchObject({ phone: "+919876543210", consent: true, sourceLocale: "ta", website: "" });
  });

  it("never invents a reference the backend did not return", async () => {
    stubFetch(new Response("{}", { status: 201 }));
    await expect(realLeadCaptureAdapter.submit(SUBMISSION, "k")).resolves.toEqual({ ok: true, leadReference: undefined });
  });

  it.each([
    [404, "unavailable"],
    [503, "unavailable"],
    [429, "rate_limited"],
    [400, "rejected"],
    [409, "rejected"],
  ] as const)("maps HTTP %i to %s", async (status, reason) => {
    stubFetch(new Response("", { status }));
    await expect(realLeadCaptureAdapter.submit(SUBMISSION, "k")).resolves.toEqual({ ok: false, reason });
  });

  it("reports a network failure without throwing", async () => {
    stubFetch(new TypeError("offline"));
    await expect(realLeadCaptureAdapter.submit(SUBMISSION, "k")).resolves.toEqual({ ok: false, reason: "network" });
  });
});
