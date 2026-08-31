import type { ProjectEnquirySubmission } from "./types";

/**
 * Maps the frontend-owned {@link ProjectEnquirySubmission} onto the backend's real
 * `POST /api/v1/project-enquiries` wire contract (W3.2B). Guided-flow field names are
 * deliberately distinct from the legacy contract's `timeline`/`budgetRange` on the wire
 * (`guidedTimeline`/`guidedBudgetRange`) — the two eras' value sets don't line up, so the
 * backend keeps them as separate fields rather than forcing a shared name onto two
 * different enums. `website` is always sent empty: the honeypot is already checked (and
 * the submit aborted) before this function is ever called — see useStartProjectForm's
 * `submit()`.
 */
export function toWirePayload(submission: ProjectEnquirySubmission) {
  return {
    submissionVersion: "GUIDED",

    name: submission.contact.name,
    companyName: submission.contact.company,
    businessEmail: submission.contact.email,
    phone: submission.contact.phone,
    country: submission.contact.country,
    countryCode: submission.contact.countryCode,
    role: submission.contact.role,

    solutionModel: submission.solutionModel,
    engagementModel: submission.engagementModel,
    problemStatement: submission.problemStatement,
    projectStage: submission.projectStage,
    productTypes: submission.productTypes,
    guidedTimeline: submission.timeline,
    guidedBudgetRange: submission.budgetRange,
    existingSystemContext: submission.existingSystemContext,

    preferredContactMethod: submission.contact.preferredMethod,
    preferredContactTime: submission.contact.preferredTime,
    whatsappConsent: submission.contact.whatsappConsent,

    source: "WEBSITE",
    sourcePage: typeof window === "undefined" ? undefined : window.location.pathname,
    referrer: submission.attribution.referrer,
    utmSource: submission.attribution.utmSource,
    utmMedium: submission.attribution.utmMedium,
    utmCampaign: submission.attribution.utmCampaign,
    utmContent: submission.attribution.utmContent,
    sourceContext: submission.attribution.sourceContext,
    entryRoute: submission.attribution.entryRoute,

    website: "",
  };
}
