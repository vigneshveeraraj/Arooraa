/**
 * Low-friction lead capture: one requirement choice, an Indian mobile number and explicit
 * consent — nothing else is asked for (no name, email or budget). The wire values follow the
 * backend's SCREAMING_SNAKE_CASE enum convention so the future endpoint maps 1:1.
 */

/** The language of the page the visitor came from. Only a starting point — the WhatsApp
 * conversation asks the customer which language they want, and their answer wins. */
export type LeadLocale = "en" | "ta";

export type LeadRequirement =
  | "WEBSITE"
  | "CUSTOMER_ENQUIRIES"
  | "AI_AUTOMATION"
  | "MARKETING_LEADS"
  | "BUSINESS_APPLICATION"
  | "NOT_SURE";

export const LEAD_REQUIREMENTS: readonly LeadRequirement[] = [
  "WEBSITE",
  "CUSTOMER_ENQUIRIES",
  "AI_AUTOMATION",
  "MARKETING_LEADS",
  "BUSINESS_APPLICATION",
  "NOT_SURE",
];

export interface LeadAttribution {
  sourcePage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

/** What the browser sends. `phone` is already normalised to E.164 (+91XXXXXXXXXX). */
export interface LeadCaptureSubmission {
  requirement: LeadRequirement;
  phone: string;
  consent: true;
  /** The exact consent sentence the visitor ticked, in the language it was shown in. */
  consentText: string;
  sourceLocale: LeadLocale;
  attribution: LeadAttribution;
}

export type LeadCaptureResult =
  | { ok: true; leadReference?: string }
  | { ok: false; reason: "network" | "rate_limited" | "rejected" | "unavailable" };

export interface LeadCaptureAdapter {
  submit(submission: LeadCaptureSubmission, idempotencyKey: string): Promise<LeadCaptureResult>;
}
