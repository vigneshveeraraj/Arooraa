import { adminFetch, type AdminApiResult } from "./csrf";
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

// ---- Leads (backs both /admin/leads and, pinned to PROJECT_ENQUIRY, /admin/project-enquiries) ----

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
