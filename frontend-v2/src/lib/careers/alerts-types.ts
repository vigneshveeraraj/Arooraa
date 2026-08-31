/**
 * Talent-community / job-alert subscription (W3.3A §24–28) — a distinct
 * recruitment-communications purpose, deliberately unrelated to the
 * project-enquiry lead model in lib/start-project (§27: never reuse that
 * endpoint or table for candidates).
 *
 * Location preference is intentionally not a field here: AROORAA has one
 * confirmed hiring location today (Chennai, Tamil Nadu, India), and §25
 * forbids inventing a city list just to make the form look more capable —
 * a single-option location picker would add a field without adding a real
 * choice. Add it back once a second hiring location is actually approved.
 */

export type AreaOfInterest =
  | "AI_DATA"
  | "BACKEND_FULL_STACK"
  | "FRONTEND"
  | "PRODUCT_DESIGN"
  | "SALES"
  | "MARKETING_GROWTH"
  | "ANY_SUITABLE";

export const AREA_OF_INTEREST_OPTIONS: { value: AreaOfInterest; label: string }[] = [
  { value: "AI_DATA", label: "AI & Data" },
  { value: "BACKEND_FULL_STACK", label: "Backend / Full Stack" },
  { value: "FRONTEND", label: "Frontend" },
  { value: "PRODUCT_DESIGN", label: "Product & Design" },
  { value: "SALES", label: "Sales" },
  { value: "MARKETING_GROWTH", label: "Marketing & Growth" },
  { value: "ANY_SUITABLE", label: "Any suitable opportunity" },
];

export type CandidateExperienceLevel = "STUDENT_EARLY_CAREER" | "EXPERIENCED" | "OPEN_TO_SUITABLE_ROLES";

export const EXPERIENCE_LEVEL_OPTIONS: { value: CandidateExperienceLevel; label: string }[] = [
  { value: "STUDENT_EARLY_CAREER", label: "Student / Early Career" },
  { value: "EXPERIENCED", label: "Experienced" },
  { value: "OPEN_TO_SUITABLE_ROLES", label: "Open to suitable roles" },
];

export interface TalentAlertFormValues {
  name: string;
  email: string;
  areasOfInterest: AreaOfInterest[];
  experienceLevel: CandidateExperienceLevel | "";
  /** Explicit recruitment-communications consent — must never be preset to true. */
  consent: boolean;
}

export const EMPTY_TALENT_ALERT_VALUES: TalentAlertFormValues = {
  name: "",
  email: "",
  areasOfInterest: [],
  experienceLevel: "",
  consent: false,
};

export type TalentAlertFieldErrors = Partial<Record<keyof TalentAlertFormValues, string>>;

export interface TalentAlertSubscription {
  name: string;
  email: string;
  areasOfInterest: AreaOfInterest[];
  experienceLevel?: CandidateExperienceLevel;
  consent: true;
}

export type TalentAlertSubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };
