import type {
  AdminLeadDetail,
  AdminSession,
  AdminUserSummary,
  DashboardSummary,
  LeadType,
  NoteEntry,
  PagedResponse,
  AdminLeadSummary,
} from "./types";

/**
 * Deliberately separate from the public demo-request/project-enquiry API clients —
 * this one is cookie/session-authenticated and CSRF-protected, theirs are anonymous.
 * Same-origin relative base path, same pattern as /api/leads: in dev, next.config.ts
 * rewrites this to the backend; in production, Nginx maps
 * /api/admin/** -> http://127.0.0.1:8090/api/v1/admin/**.
 */
const ADMIN_API_BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_API_BASE_PATH ?? "/api/admin";

export type AdminApiErrorKind =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NETWORK"
  | "SERVER";

export interface AdminApiError {
  kind: AdminApiErrorKind;
  message: string;
}

export type AdminApiResult<T> = { ok: true; data: T } | { ok: false; error: AdminApiError };

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  const value = match?.[1];
  return value !== undefined ? decodeURIComponent(value) : null;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<AdminApiResult<T>> {
  let response: Response;
  try {
    const csrfToken = readCookie("XSRF-TOKEN");
    response = await fetch(`${ADMIN_API_BASE_PATH}${path}`, {
      ...init,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
        ...init?.headers,
      },
    });
  } catch {
    return {
      ok: false,
      error: { kind: "NETWORK", message: "We couldn't reach the server. Check your connection and try again." },
    };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  if (response.ok) {
    return { ok: true, data: (await safeJson(response)) as T };
  }

  const body = (await safeJson(response)) as { message?: string } | null;

  switch (response.status) {
    case 401:
      // The backend already tailors this message per context: "Invalid email or
      // password." for a failed login attempt, "Authentication required." for a
      // lapsed/missing session — both are safe, generic, backend-controlled strings.
      return { ok: false, error: { kind: "UNAUTHENTICATED", message: body?.message ?? "Please log in again." } };
    case 403:
      return { ok: false, error: { kind: "FORBIDDEN", message: body?.message ?? "You do not have access to this." } };
    case 400:
      return { ok: false, error: { kind: "VALIDATION", message: body?.message ?? "Please correct the highlighted fields." } };
    case 404:
      return { ok: false, error: { kind: "NOT_FOUND", message: body?.message ?? "Not found." } };
    case 409:
      return {
        ok: false,
        error: { kind: "CONFLICT", message: "This lead was changed by someone else. Reload and try again." },
      };
    case 429:
      return {
        ok: false,
        error: { kind: "RATE_LIMITED", message: "Too many attempts. Please wait a few minutes and try again." },
      };
    default:
      return { ok: false, error: { kind: "SERVER", message: "Something went wrong on our end. Please try again shortly." } };
  }
}

// ---- Auth ----

export function login(email: string, password: string): Promise<AdminApiResult<AdminSession>> {
  return adminFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout(): Promise<AdminApiResult<void>> {
  return adminFetch("/auth/logout", { method: "POST" });
}

export function fetchSession(): Promise<AdminApiResult<AdminSession>> {
  return adminFetch("/auth/session", { method: "GET" });
}

// ---- Dashboard ----

export function fetchDashboard(timezone: string): Promise<AdminApiResult<DashboardSummary>> {
  return adminFetch(`/dashboard?timezone=${encodeURIComponent(timezone)}`);
}

// ---- Admin users (assignment dropdown) ----

export function fetchActiveAdmins(): Promise<AdminApiResult<AdminUserSummary[]>> {
  return adminFetch("/users");
}

// ---- Leads ----

export interface LeadListParams {
  leadType?: LeadType;
  status?: string;
  search?: string;
  followUp?: "DUE_TODAY" | "OVERDUE" | "ANY_SET";
  timezone?: string;
  page?: number;
  size?: number;
}

export function fetchLeads(params: LeadListParams): Promise<AdminApiResult<PagedResponse<AdminLeadSummary>>> {
  const query = new URLSearchParams();
  if (params.leadType) query.set("leadType", params.leadType);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.followUp) query.set("followUp", params.followUp);
  if (params.timezone) query.set("timezone", params.timezone);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return adminFetch(`/leads?${query.toString()}`);
}

export function fetchLeadDetail(leadType: LeadType, id: string): Promise<AdminApiResult<AdminLeadDetail>> {
  return adminFetch(`/leads/${leadType}/${id}`);
}

export function updateStatus(
  leadType: LeadType,
  id: string,
  status: string,
  lostReason: string | undefined,
  expectedVersion: number,
): Promise<AdminApiResult<void>> {
  return adminFetch(`/leads/${leadType}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, lostReason, expectedVersion }),
  });
}

export function updateFollowUp(
  leadType: LeadType,
  id: string,
  followUpAt: string | null,
  expectedVersion: number,
): Promise<AdminApiResult<void>> {
  return adminFetch(`/leads/${leadType}/${id}/follow-up`, {
    method: "PATCH",
    body: JSON.stringify({ followUpAt, expectedVersion }),
  });
}

export function updateAssignment(
  leadType: LeadType,
  id: string,
  assignedAdminId: string | null,
  expectedVersion: number,
): Promise<AdminApiResult<void>> {
  return adminFetch(`/leads/${leadType}/${id}/assignment`, {
    method: "PATCH",
    body: JSON.stringify({ assignedAdminId, expectedVersion }),
  });
}

export function updateEstimatedValue(
  leadType: LeadType,
  id: string,
  estimatedValue: number | null,
  currency: string | undefined,
  expectedVersion: number,
): Promise<AdminApiResult<void>> {
  return adminFetch(`/leads/${leadType}/${id}/estimated-value`, {
    method: "PATCH",
    body: JSON.stringify({ estimatedValue, currency, expectedVersion }),
  });
}

export function addNote(leadType: LeadType, id: string, note: string): Promise<AdminApiResult<NoteEntry>> {
  return adminFetch(`/leads/${leadType}/${id}/notes`, { method: "POST", body: JSON.stringify({ note }) });
}
