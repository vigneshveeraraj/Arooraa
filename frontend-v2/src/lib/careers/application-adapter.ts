import type { JobApplicationSubmission } from "./application-types";

/**
 * Job-application submission boundary (W3.3A §15, connected to the real backend in W3.3B §15).
 * `realJobApplicationAdapter` is what the live page uses: it posts multipart/form-data to the
 * real `/api/v1/careers/applications` endpoint (via the same same-origin/CORS-in-dev pattern
 * Start a Project already established — see lib/start-project/adapter.ts), and only ever
 * reports success after the backend has actually returned 201/200 for a real, persisted
 * application. It never fabricates an application reference — a success result without one
 * (which shouldn't happen in practice) simply omits that line from the UI rather than making one
 * up.
 */
export interface ApplicationAdapterSuccess {
  ok: true;
  message: string;
  applicationReference?: string;
  jobSlug?: string;
}

export interface ApplicationAdapterFailure {
  ok: false;
  message: string;
}

export type ApplicationAdapterResult = ApplicationAdapterSuccess | ApplicationAdapterFailure;

export interface JobApplicationAdapter {
  submitApplication(
    payload: JobApplicationSubmission,
    resumeFile: File | null,
    idempotencyKey: string,
  ): Promise<ApplicationAdapterResult>;
}

const NOT_CONNECTED_MESSAGE =
  "Online applications aren't connected to a hiring workflow yet. Join Job Alerts and we'll notify you as soon as this is available.";

/** Kept for local dev/tests when no backend is reachable — never wired into the live page. */
export const notConnectedJobApplicationAdapter: JobApplicationAdapter = {
  async submitApplication(): Promise<ApplicationAdapterResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: false, message: NOT_CONNECTED_MESSAGE };
  },
};

/** Used only by tests to exercise the success path without a real network call. */
export const localJobApplicationAdapter: JobApplicationAdapter = {
  async submitApplication(): Promise<ApplicationAdapterResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: true, message: "Your application has been received.", applicationReference: "JOB-2026-000001" };
  },
};

// Matches Start a Project's established relative-path/reverse-proxy convention (nginx maps
// /api/leads/careers/applications -> the backend's /api/v1/careers/applications).
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/leads";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const APPLICATIONS_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/v1/careers/applications`
  : `${API_BASE_PATH}/careers/applications`;

const RATE_LIMITED_MESSAGE = "You've sent a few requests in a short time. Please wait a few minutes and try again.";
const CONFLICT_MESSAGE = "We couldn't process this request. Please try again.";
const GENERIC_ERROR_MESSAGE = "We couldn't submit your application. Please check your details and try again.";
const NETWORK_ERROR_MESSAGE = "We couldn't reach AROORAA. Please check your connection and try again.";
const DEFAULT_SUCCESS_MESSAGE = "We've received your application.";

interface ApplicationResponseBody {
  applicationReference?: string;
  jobSlug?: string;
  message?: string;
}

export const realJobApplicationAdapter: JobApplicationAdapter = {
  async submitApplication(payload, resumeFile, idempotencyKey): Promise<ApplicationAdapterResult> {
    const formData = new FormData();
    formData.set("jobSlug", payload.jobSlug);
    formData.set("fullName", payload.fullName);
    formData.set("email", payload.email);
    formData.set("phone", payload.phone);
    if (payload.currentLocation) formData.set("currentLocation", payload.currentLocation);
    if (payload.experience) formData.set("experience", payload.experience);
    if (payload.linkedInUrl) formData.set("linkedinUrl", payload.linkedInUrl);
    if (payload.portfolioUrl) formData.set("portfolioUrl", payload.portfolioUrl);
    if (payload.note) formData.set("note", payload.note);
    formData.set("recruitmentConsent", "true");
    if (resumeFile) formData.set("resume", resumeFile, resumeFile.name);

    let response: Response;
    try {
      response = await fetch(APPLICATIONS_URL, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: formData,
      });
    } catch {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }

    if (response.status === 201 || response.status === 200) {
      const body = (await response.json().catch(() => null)) as ApplicationResponseBody | null;
      return {
        ok: true,
        message: body?.message ?? DEFAULT_SUCCESS_MESSAGE,
        applicationReference: body?.applicationReference,
        jobSlug: body?.jobSlug,
      };
    }
    if (response.status === 409) {
      return { ok: false, message: CONFLICT_MESSAGE };
    }
    if (response.status === 429) {
      return { ok: false, message: RATE_LIMITED_MESSAGE };
    }
    // 400 validation errors and 5xx failures both collapse to the same generic, non-technical
    // message — the frontend's own validation already prevents most 400s; never surface
    // field-level backend detail or server internals.
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  },
};
