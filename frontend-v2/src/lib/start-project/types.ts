/**
 * W3.2A — Start Project conversion experience. Enum-style string literal
 * unions follow the existing backend's SCREAMING_SNAKE_CASE wire-value
 * convention (see backend/src/main/java/com/arooraa/leads/project/domain)
 * so W3.2B's contract evolution has a straightforward mapping, even though
 * this milestone's richer field set does not (yet) map 1:1 onto the
 * existing ProjectEnquiryCreateRequest.
 */

export type SolutionModel =
  | "NEW_PRODUCT"
  | "EXISTING_PRODUCT"
  | "AI_DATA_AUTOMATION"
  | "APPLICATION_MODERNIZATION"
  | "CLOUD_PLATFORM"
  | "CONTINUOUS_ENGINEERING"
  | "CONNECTED_PRODUCT"
  | "NEEDS_GUIDANCE";

export type EngagementModel =
  | "DISCOVER_DEFINE"
  | "DESIGN_BUILD"
  | "IMPROVE_MODERNIZE"
  | "ADD_AI_AUTOMATION"
  | "ENGINEERING_COLLABORATION"
  | "CONTINUOUS_PRODUCT_PARTNER"
  | "NEEDS_RECOMMENDATION";

export type ProjectStage =
  | "IDEA"
  | "EXPLORING"
  | "REQUIREMENTS_TAKING_SHAPE"
  | "PROTOTYPE_MVP"
  | "EXISTING_PRODUCT"
  | "PRODUCTION_SYSTEM"
  | "NOT_SURE";

export type ProductType =
  | "WEB_APPLICATION"
  | "MOBILE_APPLICATION"
  | "SAAS_PLATFORM"
  | "BACKEND_APIS"
  | "AI_DATA"
  | "CLOUD_INFRASTRUCTURE"
  | "CONNECTED_IOT"
  | "EXISTING_ENTERPRISE_APPLICATION"
  | "NOT_SURE";

export type Timeline =
  | "ASAP"
  | "WITHIN_1_TO_3_MONTHS"
  | "WITHIN_3_TO_6_MONTHS"
  | "SIX_MONTHS_PLUS"
  | "STILL_EXPLORING";

export type BudgetRange =
  | "STILL_DEFINING"
  | "UNDER_5L"
  | "FROM_5L_TO_15L"
  | "FROM_15L_TO_50L"
  | "ABOVE_50L"
  | "PREFER_TO_DISCUSS"
  | "NOT_SURE_YET";

export type PreferredContactMethod = "EMAIL" | "PHONE" | "WHATSAPP";

export type PreferredContactTime = "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";

/**
 * Solution models that make an existing product/system worth asking about
 * (W3.2A §15) — drives StepContext's conditional "existing system" field.
 */
export const SOLUTION_MODELS_WITH_EXISTING_SYSTEM: SolutionModel[] = [
  "EXISTING_PRODUCT",
  "APPLICATION_MODERNIZATION",
  "CLOUD_PLATFORM",
  "CONTINUOUS_ENGINEERING",
];

export interface StartProjectFormValues {
  solutionModel: SolutionModel | "";
  engagementModel: EngagementModel | "";
  problemStatement: string;
  projectStage: ProjectStage | "";
  productTypes: ProductType[];
  timeline: Timeline | "";
  budgetRange: BudgetRange | "";
  existingSystemContext: string;

  name: string;
  email: string;
  /** The national number only, as the visitor typed it — never includes the
   * country calling code (W3.2A.1 §2). The selected `country` supplies the
   * prefix; see lib/start-project/validation.ts#toE164 for the canonical
   * E.164 value used at submission time. */
  phone: string;
  /** ISO 3166-1 alpha-2 country code (e.g. "IN"), not a display name — see
   * lib/start-project/countries.ts#countryNameFor for the human-readable
   * name used in the submission payload (W3.2A.1 §3). */
  country: string;
  company: string;
  role: string;
  preferredContactMethod: PreferredContactMethod | "";
  whatsappConsent: boolean;
  preferredContactTime: PreferredContactTime | "";

  /** Honeypot — must stay empty. Hidden from real users via CSS + aria-hidden. */
  website: string;
}

export const EMPTY_FORM_VALUES: StartProjectFormValues = {
  solutionModel: "",
  engagementModel: "",
  problemStatement: "",
  projectStage: "",
  productTypes: [],
  timeline: "",
  budgetRange: "",
  existingSystemContext: "",
  name: "",
  email: "",
  phone: "",
  country: "",
  company: "",
  role: "",
  preferredContactMethod: "",
  whatsappConsent: false,
  preferredContactTime: "",
  website: "",
};

export type FormFieldErrors = Partial<Record<keyof StartProjectFormValues, string>>;

export type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string; referenceNumber?: string }
  | { status: "error"; message: string };

/**
 * Marketing/source attribution (W3.2A §28) — kept structurally separate
 * from the visitor's own free-text answers so nothing gets injected into
 * the problem statement.
 */
export interface AttributionContext {
  sourceContext?: string;
  entryRoute?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

/**
 * The frontend-owned submission payload (W3.2A §27) — deliberately not a
 * backend DTO. W3.2B evolves the real API contract to match this shape (or
 * maps it) after the frontend fields are frozen.
 */
export interface ProjectEnquirySubmission {
  solutionModel: SolutionModel;
  engagementModel: EngagementModel;
  problemStatement: string;
  projectStage: ProjectStage;
  productTypes: ProductType[];
  timeline: Timeline;
  budgetRange?: BudgetRange;
  existingSystemContext?: string;

  contact: {
    name: string;
    email: string;
    phone: string;
    country?: string;
    /** ISO 3166-1 alpha-2 country code (e.g. "IN") alongside the display name above —
     * the backend contract's countryCode field (W3.2B §13). */
    countryCode?: string;
    company?: string;
    role?: string;
    preferredMethod: PreferredContactMethod;
    whatsappConsent: boolean;
    preferredTime?: PreferredContactTime;
  };

  attribution: AttributionContext;
}
