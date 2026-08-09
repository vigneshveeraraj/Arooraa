export type ServiceTypeOption =
  | "IDEA_PRODUCT_CONSULTING"
  | "WEBSITE_DIGITAL_PLATFORM"
  | "CUSTOM_SOFTWARE"
  | "SAAS_PRODUCT"
  | "MOBILE_APPLICATION"
  | "AI_AUTOMATION"
  | "APPLICATION_MODERNIZATION"
  | "CLOUD_DEVOPS"
  | "NOT_SURE";

export type ProjectTypeOption =
  | "NEW_PRODUCT"
  | "EXISTING_SYSTEM_ENHANCEMENT"
  | "MODERNIZATION"
  | "INTEGRATION"
  | "AUTOMATION"
  | "CONSULTING"
  | "OTHER";

export type BudgetRangeOption =
  | "UNDER_50K"
  | "FROM_50K_TO_2L"
  | "FROM_2L_TO_5L"
  | "FROM_5L_TO_10L"
  | "ABOVE_10L"
  | "NEED_GUIDANCE";

export type TimelineOption =
  | "ASAP"
  | "WITHIN_1_MONTH"
  | "FROM_1_TO_3_MONTHS"
  | "FROM_3_TO_6_MONTHS"
  | "ABOVE_6_MONTHS"
  | "FLEXIBLE";

export type ContactMethodOption = "EMAIL" | "PHONE" | "WHATSAPP" | "VIDEO_CALL";

export interface ProjectEnquiryFormValues {
  serviceType: ServiceTypeOption | "";
  projectType: ProjectTypeOption | "";
  companyName: string;
  description: string;
  /** Tri-state so the user must make an explicit choice rather than defaulting to false. */
  existingSystem: "" | "yes" | "no";
  budgetRange: BudgetRangeOption | "";
  timeline: TimelineOption | "";
  name: string;
  businessEmail: string;
  phone: string;
  country: string;
  preferredContactMethod: ContactMethodOption | "";
  /** Honeypot — must stay empty. Hidden from real users via CSS + aria-hidden. */
  website: string;
}

export const EMPTY_FORM_VALUES: ProjectEnquiryFormValues = {
  serviceType: "",
  projectType: "",
  companyName: "",
  description: "",
  existingSystem: "",
  budgetRange: "",
  timeline: "",
  name: "",
  businessEmail: "",
  phone: "",
  country: "",
  preferredContactMethod: "",
  website: "",
};

export type FormFieldErrors = Partial<Record<keyof ProjectEnquiryFormValues, string>>;

export type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; kind: "RECEIVED" | "ALREADY_RECEIVED"; message: string; enquiryNumber: string }
  | {
      status: "error";
      kind: "VALIDATION" | "RATE_LIMITED" | "NETWORK" | "SERVER";
      message: string;
      fieldErrors?: FormFieldErrors;
    };
