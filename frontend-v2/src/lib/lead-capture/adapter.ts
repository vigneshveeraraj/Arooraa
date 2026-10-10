import type { LeadCaptureAdapter, LeadCaptureResult, LeadCaptureSubmission } from "./types";

/*
 * PRODUCTION BLOCKER — see frontend-v2/docs/lead-capture.md.
 *
 * No backend endpoint accepts a phone-only lead yet: project enquiries and contact messages
 * both require a name and email, and this form deliberately asks for neither. Rather than
 * invent values to squeeze through those contracts, this adapter targets the proposed
 * `POST /api/v1/lead-captures` contract and stays switched off until the backend ships it.
 *
 * While off, nothing is sent anywhere and the form never claims to have saved anything — it
 * offers WhatsApp and a call instead. Turn it on with NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=true
 * once the endpoint is deployed behind the existing /api/leads/ Nginx proxy.
 */
export const LEAD_CAPTURE_ENABLED = process.env.NEXT_PUBLIC_LEAD_CAPTURE_ENABLED === "true";

// Same relative-path / reverse-proxy convention as Start a Project and Contact.
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/leads";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const LEAD_CAPTURES_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1/lead-captures` : `${API_BASE_PATH}/lead-captures`;

export function toWirePayload(submission: LeadCaptureSubmission) {
  return {
    requirement: submission.requirement,
    phone: submission.phone,
    countryCode: "IN",
    consent: submission.consent,
    consentText: submission.consentText,
    sourceLocale: submission.sourceLocale,
    source: "WEBSITE",
    ...submission.attribution,
    // Honeypot — the form aborts before submitting if its hidden field is filled.
    website: "",
  };
}

/**
 * Persists first, confirms second: success is reported only for a 200/201 from the backend,
 * and the only reference ever shown is the backend's own opaque `leadReference`.
 */
export const realLeadCaptureAdapter: LeadCaptureAdapter = {
  async submit(submission, idempotencyKey): Promise<LeadCaptureResult> {
    let response: Response;
    try {
      response = await fetch(LEAD_CAPTURES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(toWirePayload(submission)),
      });
    } catch {
      return { ok: false, reason: "network" };
    }

    if (response.status === 200 || response.status === 201) {
      const body = (await response.json().catch(() => null)) as { leadReference?: unknown } | null;
      const leadReference = typeof body?.leadReference === "string" ? body.leadReference : undefined;
      return { ok: true, leadReference };
    }
    if (response.status === 429) return { ok: false, reason: "rate_limited" };
    if (response.status === 404 || response.status >= 500) return { ok: false, reason: "unavailable" };
    return { ok: false, reason: "rejected" };
  },
};
