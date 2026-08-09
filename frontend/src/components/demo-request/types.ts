export type OutletCountOption = "PLANNING" | "ONE" | "TWO_TO_FIVE" | "SIX_TO_TEN" | "MORE_THAN_TEN";

export interface DemoRequestFormValues {
  fullName: string;
  whatsappNumber: string;
  businessEmail: string;
  restaurantName: string;
  city: string;
  outletCount: OutletCountOption | "";
  interestedProduct: string;
  preferredContactMethod: string;
  message: string;
  /** Honeypot — must stay empty. Hidden from real users via CSS + aria-hidden. */
  website: string;
}

export const EMPTY_FORM_VALUES: DemoRequestFormValues = {
  fullName: "",
  whatsappNumber: "",
  businessEmail: "",
  restaurantName: "",
  city: "",
  outletCount: "",
  interestedProduct: "",
  preferredContactMethod: "",
  message: "",
  website: "",
};

export type FormFieldErrors = Partial<Record<keyof DemoRequestFormValues, string>>;

export type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; kind: "RECEIVED" | "ALREADY_RECEIVED"; message: string }
  | { status: "error"; kind: "VALIDATION" | "RATE_LIMITED" | "NETWORK" | "SERVER"; message: string; fieldErrors?: FormFieldErrors };
