export const LEAD_TYPES = ["PROJECT_ENQUIRY", "MESA_DEMO", "LEAD_CAPTURE"] as const;

/**
 * LEAD_CAPTURE is the low-friction consultation form (requirement + phone + consent). It never
 * has a name, email, company or city — those fields arrive as null and must not be filled in.
 */
export type LeadType = (typeof LEAD_TYPES)[number];

export function isLeadType(value: string | null): value is LeadType {
  return value !== null && (LEAD_TYPES as readonly string[]).includes(value);
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  PROJECT_ENQUIRY: "Project Enquiry",
  MESA_DEMO: "MESA Demo",
  LEAD_CAPTURE: "Lead Capture",
};

export interface AdminSession {
  id: string;
  email: string;
  displayName: string;
}

export interface AdminLeadSummary {
  id: string;
  leadType: LeadType;
  referenceNumber: string;
  /** Null for LEAD_CAPTURE rows. */
  customerName: string | null;
  companyOrRestaurant: string | null;
  email: string | null;
  phone: string | null;
  cityOrCountry: string | null;
  status: string;
  createdAt: string;
  followUpAt: string | null;
  assignedTo: string | null;
  estimatedValue: number | null;
  estimatedValueCurrency: string | null;
  /** W3.2D list fields, null for MESA_DEMO rows. LEAD_CAPTURE rows use direction for the requirement. */
  maskedPhone: string | null;
  direction: string | null;
  preferredContactMethod: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ManagementInfo {
  assignedAdminId: string | null;
  assignedAdminName: string | null;
  followUpAt: string | null;
  estimatedValue: number | null;
  estimatedValueCurrency: string | null;
  lostReason: string | null;
  internalSummary: string | null;
  lastContactedAt: string | null;
  version: number;
}

export interface NoteEntry {
  id: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  actorName: string;
  activityType: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface AdminLeadDetail {
  id: string;
  leadType: LeadType;
  referenceNumber: string;
  status: string;
  leadVersion: number;
  createdAt: string;
  /** Null for LEAD_CAPTURE leads. */
  customerName: string | null;
  companyOrRestaurant: string | null;
  email: string | null;
  phone: string | null;
  cityOrCountry: string | null;
  submittedFields: Record<string, string>;
  managementInfo: ManagementInfo;
  notes: NoteEntry[];
  activity: ActivityEntry[];
}

export interface DashboardSummary {
  totalNewLeads: number;
  newProjectEnquiries: number;
  newMesaDemoRequests: number;
  followUpsDueToday: number;
  overdueFollowUps: number;
  qualified: number;
  proposalSent: number;
  negotiation: number;
  won: number;
  lost: number;
  /** Included in totalNewLeads. Optional so an older backend without it still renders. */
  newLeadCaptures?: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string;
}

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export const LOST_REASONS = [
  "BUDGET",
  "TIMELINE",
  "NO_RESPONSE",
  "CHOSE_COMPETITOR",
  "REQUIREMENT_NOT_FIT",
  "CANCELLED",
  "OTHER",
] as const;
