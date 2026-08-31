import type { AreaOfInterest, TalentAlertSubscription } from "./alerts-types";

export interface AdapterSuccess {
  ok: true;
  message: string;
}

export interface AdapterFailure {
  ok: false;
  message: string;
}

export type AdapterResult = AdapterSuccess | AdapterFailure;

/**
 * The talent-community submission boundary (W3.3A §27, connected to the real backend in
 * W3.3B §17). `realTalentAlertAdapter` is what the live page uses: it posts JSON to the real
 * `/api/v1/careers/talent-community` endpoint and only ever reports success after the backend
 * has actually persisted the subscription.
 */
export interface TalentAlertAdapter {
  subscribe(payload: TalentAlertSubscription): Promise<AdapterResult>;
}

const NOT_CONNECTED_MESSAGE =
  "The talent community system isn't connected yet, so this signup can't be saved right now. Please check back soon.";

/** Kept for local dev/tests when no backend is reachable — never wired into the live page. */
export const notConnectedTalentAlertAdapter: TalentAlertAdapter = {
  async subscribe(): Promise<AdapterResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ok: false, message: NOT_CONNECTED_MESSAGE };
  },
};

/** Used only by tests to exercise the success path without a real network call. */
export const localTalentAlertAdapter: TalentAlertAdapter = {
  async subscribe(): Promise<AdapterResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ok: true, message: "We'll contact you when AROORAA opens roles that match the career interests you selected." };
  },
};

// Matches Start a Project's established relative-path/reverse-proxy convention.
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/leads";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const TALENT_COMMUNITY_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/v1/careers/talent-community`
  : `${API_BASE_PATH}/careers/talent-community`;

const RATE_LIMITED_MESSAGE = "You've sent a few requests in a short time. Please wait a few minutes and try again.";
const GENERIC_ERROR_MESSAGE = "We couldn't save this signup. Please check your details and try again.";
const NETWORK_ERROR_MESSAGE = "We couldn't reach AROORAA. Please check your connection and try again.";
const DEFAULT_SUCCESS_MESSAGE = "You're on the list.";

/**
 * The frontend's own `AreaOfInterest` keeps `ANY_SUITABLE` (its established, already-approved
 * value — see lib/careers/alerts-types.ts) rather than being renamed to match the backend's
 * `ANY` exactly; this map is the one place that translation happens, on the wire only, so no
 * visible UI text or internal type needed to change to integrate with the real endpoint.
 */
function toWireArea(area: AreaOfInterest): string {
  return area === "ANY_SUITABLE" ? "ANY" : area;
}

interface TalentSubscriptionResponseBody {
  message?: string;
}

export const realTalentAlertAdapter: TalentAlertAdapter = {
  async subscribe(payload: TalentAlertSubscription): Promise<AdapterResult> {
    let response: Response;
    try {
      response = await fetch(TALENT_COMMUNITY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          areasOfInterest: payload.areasOfInterest.map(toWireArea),
          experienceLevel: payload.experienceLevel,
          consentAccepted: payload.consent,
        }),
      });
    } catch {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }

    if (response.status === 201 || response.status === 200) {
      const body = (await response.json().catch(() => null)) as TalentSubscriptionResponseBody | null;
      return { ok: true, message: body?.message ?? DEFAULT_SUCCESS_MESSAGE };
    }
    if (response.status === 429) {
      return { ok: false, message: RATE_LIMITED_MESSAGE };
    }
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  },
};
