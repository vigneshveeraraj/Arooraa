import { toWirePayload } from "./to-wire-payload";
import type { ProjectEnquirySubmission } from "./types";

export interface AdapterSuccess {
  ok: true;
  message: string;
  referenceNumber?: string;
}

export interface AdapterFailure {
  ok: false;
  message: string;
}

export type AdapterResult = AdapterSuccess | AdapterFailure;

/**
 * The submission boundary (W3.2A §27, §39–40; wired to the real backend in
 * W3.2B). `idempotencyKey` is optional so the local test/dev adapter below
 * can ignore it — see lib/start-project/idempotency.ts for how the real
 * page obtains one.
 */
export interface ProjectEnquiryAdapter {
  submit(payload: ProjectEnquirySubmission, idempotencyKey?: string): Promise<AdapterResult>;
}

const RECEIVED_MESSAGE =
  "AROORAA now has the context you shared. Once the production lead workflow is connected, this request will be reviewed and the conversation can continue using your preferred contact method.";

/**
 * The adapter used by tests and local dev fixtures. It does not call any
 * backend, and deliberately never fabricates a reference number (W3.2A §25:
 * "Do not create fake production reference IDs in actual public
 * behavior"). The success UI is reference-ready (renders one when
 * `referenceNumber` is present) purely so the real adapter's reference
 * number renders with no UI change.
 */
export const localProjectEnquiryAdapter: ProjectEnquiryAdapter = {
  async submit(): Promise<AdapterResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true, message: RECEIVED_MESSAGE };
  },
};

// Matches the old frontend's established relative-path/reverse-proxy convention
// (nginx maps /api/leads/project-enquiries -> the backend's /api/v1/project-enquiries) —
// never a hardcoded host/port (W3.2B §34).
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/leads";

// Unset (the production default) -> same-origin relative path above, proxied by Nginx.
// Set (local development only, e.g. NEXT_PUBLIC_API_BASE_URL=http://localhost:8090 in
// .env.local) -> call the Spring Boot backend directly, since no reverse proxy exists in
// `next dev`; that means talking to its real contract path, not the production-only
// /api/leads alias a proxy would otherwise translate (W3.2B.1 — see .env.example).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const PROJECT_ENQUIRIES_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/v1/project-enquiries`
  : `${API_BASE_PATH}/project-enquiries`;

const RATE_LIMITED_MESSAGE = "You've sent a few requests in a short time. Please wait a few minutes and try again.";
// Reached only if a retry's idempotency key was reused with a changed payload (edited an
// answer after a failed attempt, then retried) — deliberately doesn't claim "already
// submitted", since the original attempt may well have failed. "Start a New Enquiry" always
// issues a fresh key, so it's offered as the clear way out.
const CONFLICT_MESSAGE =
  "We couldn't process this request. Please try again, or use “Start a New Enquiry” if you changed your answers since the last attempt.";
const GENERIC_ERROR_MESSAGE = "We couldn't send your enquiry. Please check your details and try again.";
const NETWORK_ERROR_MESSAGE = "We couldn't reach AROORAA. Please check your connection and try again.";

/**
 * Persists first, confirms second (W3.2B's governing rule) — this only ever reports
 * success after the backend has actually returned 201/200 for a real database row, and
 * only ever surfaces the backend's own `enquiryNumber`/`message`, never a fabricated one.
 * Every non-2xx outcome maps to a simple, non-technical message; no response body,
 * field-error detail, or stack trace is ever surfaced to the visitor.
 */
export const realProjectEnquiryAdapter: ProjectEnquiryAdapter = {
  async submit(payload: ProjectEnquirySubmission, idempotencyKey?: string): Promise<AdapterResult> {
    let response: Response;
    try {
      response = await fetch(PROJECT_ENQUIRIES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body: JSON.stringify(toWirePayload(payload)),
      });
    } catch {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }

    if (response.status === 201 || response.status === 200) {
      const body = (await response.json().catch(() => null)) as
        | { enquiryNumber?: string; message?: string }
        | null;
      return {
        ok: true,
        message: body?.message ?? RECEIVED_MESSAGE,
        referenceNumber: body?.enquiryNumber,
      };
    }
    if (response.status === 409) {
      return { ok: false, message: CONFLICT_MESSAGE };
    }
    if (response.status === 429) {
      return { ok: false, message: RATE_LIMITED_MESSAGE };
    }
    // 400 validation errors and 5xx failures both collapse to the same generic,
    // non-technical message — never surface field-level detail or server internals.
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  },
};
