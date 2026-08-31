import type { StartProjectFormValues } from "./types";

const DRAFT_KEY = "arooraa:start-project:draft:v1";

type DraftValues = Omit<StartProjectFormValues, "whatsappConsent" | "website">;

export interface StoredDraft {
  values: DraftValues;
  /** Which wizard step to resume into (W3.2A.1 §13: "current step / appropriate resume location"). */
  currentStep: number;
}

/**
 * Lightweight session-only draft persistence (W3.2A §44, hardened in
 * W3.2A.1 §10–17) — protects against an accidental refresh, browser Back,
 * or internal site navigation destroying a long problem description.
 * Deliberately excludes `whatsappConsent` (a consent flag shouldn't outlive
 * the tab any longer than necessary, and must always be explicitly
 * reconfirmed) and the `website` honeypot. Uses sessionStorage, not
 * localStorage, so nothing survives past the browser tab/session.
 */
export function saveDraft(values: StartProjectFormValues, currentStep: number): void {
  if (typeof window === "undefined") return;
  try {
    const draft: StoredDraft = {
      values: {
        solutionModel: values.solutionModel,
        engagementModel: values.engagementModel,
        problemStatement: values.problemStatement,
        projectStage: values.projectStage,
        productTypes: values.productTypes,
        timeline: values.timeline,
        budgetRange: values.budgetRange,
        existingSystemContext: values.existingSystemContext,
        name: values.name,
        email: values.email,
        phone: values.phone,
        country: values.country,
        company: values.company,
        role: values.role,
        preferredContactMethod: values.preferredContactMethod,
        preferredContactTime: values.preferredContactTime,
      },
      currentStep,
    };
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private-browsing contexts can throw on storage writes — draft persistence
    // is a convenience, not a requirement, so failures are silently ignored.
  }
}

export function loadDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (!parsed.values) return null;
    return { values: parsed.values, currentStep: typeof parsed.currentStep === "number" ? parsed.currentStep : 0 };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignored — see saveDraft.
  }
}

/**
 * True only when the visitor actually entered something (W3.2A.1 §16) — a
 * freshly-initialized draft (all empty strings/arrays) shouldn't trigger
 * the "restored" reassurance message.
 */
export function hasMeaningfulDraft(draft: StoredDraft | null): boolean {
  if (!draft) return false;
  const v = draft.values;
  return Boolean(
    v.solutionModel || v.engagementModel || v.problemStatement?.trim() || v.name?.trim() || v.email?.trim() || v.phone?.trim() || v.productTypes?.length > 0,
  );
}
