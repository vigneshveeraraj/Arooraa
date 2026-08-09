import { CONTACT_METHOD_OPTIONS, INTERESTED_PRODUCT_OPTIONS } from "./options";
import type { DemoRequestFormValues, FormFieldErrors, SubmissionState } from "./types";

/**
 * Same-origin relative base path — never a hard-coded host/port. In local
 * dev, next.config.ts rewrites this to the backend; in production, Nginx
 * maps /api/leads/demo-requests -> http://127.0.0.1:8090/api/v1/demo-requests.
 */
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/leads";

/**
 * The frontend's field set (fullName, interestedProduct, preferredContactMethod, ...)
 * does not line up 1:1 with the backend's already-implemented contract
 * (contactName, restaurantType, primaryChallenge, ...). This function is the
 * single place that reconciles the two:
 *  - fullName -> contactName
 *  - interestedProduct -> primaryChallenge (via INTERESTED_PRODUCT_OPTIONS)
 *  - restaurantType has no frontend field yet, so it is sent as "OTHER"
 *    (the enum's designated catch-all, not fabricated data)
 *  - preferredContactMethod + message are folded into additionalMessage,
 *    since the backend has no dedicated fields for either
 *  - sourcePage / referrer / utm_* are populated automatically from the
 *    browser when available
 */
function buildAdditionalMessage(values: DemoRequestFormValues): string | undefined {
  const methodLabel =
    CONTACT_METHOD_OPTIONS.find((o) => o.value === values.preferredContactMethod)?.label ??
    values.preferredContactMethod;

  const lines: string[] = [];
  if (methodLabel) {
    lines.push(`Preferred contact method: ${methodLabel}`);
  }
  if (values.message.trim()) {
    lines.push(`Message: ${values.message.trim()}`);
  }
  return lines.length > 0 ? lines.join("\n") : undefined;
}

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

function buildPayload(values: DemoRequestFormValues): Record<string, unknown> {
  const product = INTERESTED_PRODUCT_OPTIONS.find((o) => o.value === values.interestedProduct);

  return {
    contactName: values.fullName.trim(),
    restaurantName: values.restaurantName.trim(),
    whatsappNumber: values.whatsappNumber.trim(),
    city: values.city.trim(),
    outletCount: values.outletCount,
    restaurantType: "OTHER",
    primaryChallenge: product?.primaryChallenge ?? "OTHER",
    businessEmail: values.businessEmail.trim() || undefined,
    additionalMessage: buildAdditionalMessage(values),
    sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" && document.referrer ? document.referrer : undefined,
    ...readUtmParams(),
    website: values.website,
  };
}

const BACKEND_TO_FRONTEND_FIELD: Record<string, keyof DemoRequestFormValues> = {
  contactName: "fullName",
  whatsappNumber: "whatsappNumber",
  restaurantName: "restaurantName",
  city: "city",
  outletCount: "outletCount",
  businessEmail: "businessEmail",
  website: "website",
  primaryChallenge: "interestedProduct",
  additionalMessage: "message",
};

function mapBackendFieldErrors(fieldErrors: Record<string, string> | undefined): FormFieldErrors {
  if (!fieldErrors) return {};
  const out: FormFieldErrors = {};
  for (const [backendField, message] of Object.entries(fieldErrors)) {
    const frontendField = BACKEND_TO_FRONTEND_FIELD[backendField];
    if (frontendField) out[frontendField] = message;
  }
  return out;
}

interface BackendSuccessBody {
  requestId: string;
  status: string;
  message: string;
}

interface BackendErrorBody {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export async function submitDemoRequest(values: DemoRequestFormValues): Promise<SubmissionState> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_PATH}/demo-requests`, {
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
      message: body?.message ?? "Thank you. Our team will contact you to arrange your personalised MESA demo.",
    };
  }

  if (response.status === 200) {
    const body = (await safeJson(response)) as BackendSuccessBody | null;
    return {
      status: "success",
      kind: "ALREADY_RECEIVED",
      message: body?.message ?? "We already have your recent request and our team will contact you shortly.",
    };
  }

  if (response.status === 400) {
    const body = (await safeJson(response)) as BackendErrorBody | null;
    return {
      status: "error",
      kind: "VALIDATION",
      message: body?.message ?? "Please correct the highlighted fields.",
      fieldErrors: mapBackendFieldErrors(body?.fieldErrors),
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
