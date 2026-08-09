import type { FormFieldErrors, ProjectEnquiryFormValues, SubmissionState } from "./types";

/**
 * Same-origin relative base path — never a hard-coded host/port. In local dev,
 * next.config.ts rewrites this to the backend; in production, Nginx maps
 * /api/leads/project-enquiries -> http://127.0.0.1:8090/api/v1/project-enquiries.
 */
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/leads";

function readUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const mapping: Record<string, string> = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
  };
  const out: Record<string, string> = {};
  for (const [queryKey, payloadKey] of Object.entries(mapping)) {
    const value = params.get(queryKey);
    if (value) out[payloadKey] = value;
  }
  return out;
}

/**
 * Unlike the demo-request payload, this maps 1:1 onto the backend's
 * ProjectEnquiryCreateRequest contract — no field reconciliation needed, since the
 * project-enquiry domain was designed from this same form's field set.
 */
function buildPayload(values: ProjectEnquiryFormValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    companyName: values.companyName.trim() || undefined,
    businessEmail: values.businessEmail.trim(),
    phone: values.phone.trim(),
    country: values.country.trim(),
    serviceType: values.serviceType,
    projectType: values.projectType,
    description: values.description.trim(),
    existingSystem: values.existingSystem === "yes",
    budgetRange: values.budgetRange,
    timeline: values.timeline,
    preferredContactMethod: values.preferredContactMethod,
    source: "WEBSITE",
    sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" && document.referrer ? document.referrer : undefined,
    ...readUtmParams(),
    website: values.website,
  };
}

interface BackendSuccessBody {
  enquiryId: string;
  enquiryNumber: string;
  status: string;
  message: string;
}

interface BackendErrorBody {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export async function submitProjectEnquiry(values: ProjectEnquiryFormValues): Promise<SubmissionState> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_PATH}/project-enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(values)),
    });
  } catch {
    return {
      status: "error",
      kind: "NETWORK",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }

  if (response.status === 201) {
    const body = (await safeJson(response)) as BackendSuccessBody | null;
    return {
      status: "success",
      kind: "RECEIVED",
      message: body?.message ?? "Your project enquiry has been received.",
      enquiryNumber: body?.enquiryNumber ?? "",
    };
  }

  if (response.status === 200) {
    const body = (await safeJson(response)) as BackendSuccessBody | null;
    return {
      status: "success",
      kind: "ALREADY_RECEIVED",
      message: body?.message ?? "We already received this enquiry.",
      enquiryNumber: body?.enquiryNumber ?? "",
    };
  }

  if (response.status === 400) {
    const body = (await safeJson(response)) as BackendErrorBody | null;
    return {
      status: "error",
      kind: "VALIDATION",
      message: body?.message ?? "Please correct the highlighted fields.",
      fieldErrors: (body?.fieldErrors as FormFieldErrors | undefined) ?? {},
    };
  }

  if (response.status === 429) {
    return {
      status: "error",
      kind: "RATE_LIMITED",
      message: "Too many requests. Please wait a few minutes and try again.",
    };
  }

  return {
    status: "error",
    kind: "SERVER",
    message: "Something went wrong on our end. Please try again shortly.",
  };
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
