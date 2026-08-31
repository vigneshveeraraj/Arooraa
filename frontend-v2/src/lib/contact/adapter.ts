import type { ContactMessageSubmission } from "./types";

export interface ContactAdapterSuccess {
  ok: true;
  message: string;
  contactReference?: string;
}

export interface ContactAdapterFailure {
  ok: false;
  message: string;
}

export type ContactAdapterResult = ContactAdapterSuccess | ContactAdapterFailure;

export interface ContactAdapter {
  submit(payload: ContactMessageSubmission, idempotencyKey: string): Promise<ContactAdapterResult>;
}

/** Kept for local dev/tests when no backend is reachable — never wired into the live page. */
export const notConnectedContactAdapter: ContactAdapter = {
  async submit(): Promise<ContactAdapterResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: false, message: "Contact isn't connected to a backend yet. Please try again shortly." };
  },
};

/** Used only by tests to exercise the success path without a real network call. */
export const localContactAdapter: ContactAdapter = {
  async submit(): Promise<ContactAdapterResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: true, message: "We've received your message and will get back to you.", contactReference: "CNT-2026-000001" };
  },
};

// Matches Start a Project / Careers's established relative-path/reverse-proxy convention.
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/leads";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const CONTACT_MESSAGES_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/v1/contact/messages`
  : `${API_BASE_PATH}/contact/messages`;

const RATE_LIMITED_MESSAGE = "You've sent a few requests in a short time. Please wait a few minutes and try again.";
const CONFLICT_MESSAGE = "We couldn't process this request. Please try again.";
const GENERIC_ERROR_MESSAGE = "We couldn't send your message. Please check your details and try again.";
const NETWORK_ERROR_MESSAGE = "We couldn't reach AROORAA. Please check your connection and try again.";
const DEFAULT_SUCCESS_MESSAGE = "We've received your message and will get back to you.";

interface ContactResponseBody {
  contactReference?: string;
  message?: string;
}

/**
 * Persists first, confirms second (the same governing rule as Start a Project/Careers): only
 * ever reports success after the backend has actually returned 201/200 for a real, persisted
 * row, and only ever surfaces the backend's own reference — never a fabricated one.
 */
export const realContactAdapter: ContactAdapter = {
  async submit(payload: ContactMessageSubmission, idempotencyKey: string): Promise<ContactAdapterResult> {
    let response: Response;
    try {
      response = await fetch(CONTACT_MESSAGES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }

    if (response.status === 201 || response.status === 200) {
      const body = (await response.json().catch(() => null)) as ContactResponseBody | null;
      return { ok: true, message: body?.message ?? DEFAULT_SUCCESS_MESSAGE, contactReference: body?.contactReference };
    }
    if (response.status === 409) {
      return { ok: false, message: CONFLICT_MESSAGE };
    }
    if (response.status === 429) {
      return { ok: false, message: RATE_LIMITED_MESSAGE };
    }
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  },
};
