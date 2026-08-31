/**
 * Contact form contract (W3.4 §4, §9). Kept intentionally small — no budget/timeline/project-
 * stage/engagement-model fields, unlike Start a Project. Mirrors the backend's
 * ContactMessageCreateRequest field-for-field.
 */

export type ContactReason =
  | "GENERAL"
  | "PARTNERSHIP"
  | "PRODUCT_QUESTION"
  | "BUSINESS_ENQUIRY"
  | "MEDIA"
  | "CAREERS"
  | "OTHER";

export const CONTACT_REASON_OPTIONS: { value: ContactReason; label: string }[] = [
  { value: "GENERAL", label: "General enquiry" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "PRODUCT_QUESTION", label: "Product question" },
  { value: "BUSINESS_ENQUIRY", label: "Business enquiry" },
  { value: "MEDIA", label: "Media" },
  { value: "CAREERS", label: "Careers" },
  { value: "OTHER", label: "Other" },
];

export type ContactProduct = "MESA" | "MINDRA" | "SMART_MIRROR" | "SMART_HOME" | "OTHER_NOT_SURE";

export const CONTACT_PRODUCT_OPTIONS: { value: ContactProduct; label: string }[] = [
  { value: "MESA", label: "MESA" },
  { value: "MINDRA", label: "Mindra" },
  { value: "SMART_MIRROR", label: "Smart Mirror" },
  { value: "SMART_HOME", label: "Arooraa Smart Home" },
  { value: "OTHER_NOT_SURE", label: "Other / Not sure" },
];

export const MESSAGE_MAX_LENGTH = 2000;

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  reason: ContactReason | "";
  product: ContactProduct | "";
  message: string;
}

export const EMPTY_CONTACT_FORM_VALUES: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  reason: "",
  product: "",
  message: "",
};

export type ContactFieldErrors = Partial<Record<keyof ContactFormValues, string>>;

export interface ContactMessageSubmission {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  reason: ContactReason;
  product?: ContactProduct;
  message: string;
}

/** Only what the backend actually returns — never an internal id. */
export interface ContactSubmissionSuccess {
  contactReference?: string;
  message: string;
}

export type ContactSubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: ContactSubmissionSuccess }
  | { status: "error"; message: string };
