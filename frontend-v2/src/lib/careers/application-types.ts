/**
 * Job-application form contract (W3.3A §15, wired to the real backend in W3.3B). The résumé
 * travels as an actual `File`, kept out of `JobApplicationFormValues` (unlike every other
 * field) since it isn't a simple, comparable form value — `useJobApplicationForm` tracks it as
 * its own piece of state and passes it to the adapter alongside the rest of the payload.
 */

export interface JobApplicationFormValues {
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  experience: string;
  linkedInUrl: string;
  portfolioUrl: string;
  note: string;
  /** Explicit recruitment-data consent — must never be preset to true. */
  consent: boolean;
}

export const EMPTY_JOB_APPLICATION_VALUES: JobApplicationFormValues = {
  fullName: "",
  email: "",
  phone: "",
  currentLocation: "",
  experience: "",
  linkedInUrl: "",
  portfolioUrl: "",
  note: "",
  consent: false,
};

export type JobApplicationFieldErrors = Partial<Record<keyof JobApplicationFormValues | "resume", string>>;

export interface JobApplicationSubmission {
  jobSlug: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation?: string;
  experience?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  note?: string;
  consent: true;
}

/** Only what the backend actually returns — never an internal id, never a storage path. */
export interface JobApplicationSuccess {
  applicationReference?: string;
  jobSlug?: string;
  message: string;
}

export type JobApplicationSubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: JobApplicationSuccess }
  | { status: "error"; message: string };
