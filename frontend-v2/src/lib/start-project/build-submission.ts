import { countryNameFor } from "./countries";
import { toE164 } from "./validation";
import type {
  AttributionContext,
  EngagementModel,
  PreferredContactMethod,
  ProjectEnquirySubmission,
  ProjectStage,
  SolutionModel,
  StartProjectFormValues,
  Timeline,
} from "./types";

/**
 * Converts validated form values into the frontend-owned submission
 * payload. Only ever called after `validateAll` reports no errors, so the
 * required-enum casts below are safe — the empty-string variants have
 * already been rejected by validation. The phone number is converted to
 * its canonical E.164 form here (W3.2A.1 §7) — `values.phone` only ever
 * holds the national number the visitor typed.
 */
export function buildSubmission(values: StartProjectFormValues, attribution: AttributionContext): ProjectEnquirySubmission {
  return {
    solutionModel: values.solutionModel as SolutionModel,
    engagementModel: values.engagementModel as EngagementModel,
    problemStatement: values.problemStatement.trim(),
    projectStage: values.projectStage as ProjectStage,
    productTypes: values.productTypes,
    timeline: values.timeline as Timeline,
    budgetRange: values.budgetRange || undefined,
    existingSystemContext: values.existingSystemContext.trim() || undefined,
    contact: {
      name: values.name.trim(),
      email: values.email.trim(),
      // Falls back to the raw national number only if E.164 conversion
      // somehow fails post-validation — validation already guarantees a
      // valid, convertible number by the time this runs.
      phone: toE164(values.phone, values.country) ?? values.phone.trim(),
      country: countryNameFor(values.country) ?? (values.country.trim() || undefined),
      countryCode: values.country.trim() || undefined,
      company: values.company.trim() || undefined,
      role: values.role.trim() || undefined,
      preferredMethod: values.preferredContactMethod as PreferredContactMethod,
      whatsappConsent: values.whatsappConsent,
      preferredTime: values.preferredContactTime || undefined,
    },
    attribution,
  };
}
