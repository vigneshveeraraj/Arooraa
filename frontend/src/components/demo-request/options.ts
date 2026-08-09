import type { OutletCountOption } from "./types";

export const OUTLET_COUNT_OPTIONS: { value: OutletCountOption; label: string }[] = [
  { value: "PLANNING", label: "Planning to open" },
  { value: "ONE", label: "1 outlet" },
  { value: "TWO_TO_FIVE", label: "2–5 outlets" },
  { value: "SIX_TO_TEN", label: "6–10 outlets" },
  { value: "MORE_THAN_TEN", label: "10+ outlets" },
];

/**
 * "Interested product" is the user-facing question; each option maps to the
 * backend's `primaryChallenge` enum (see backend/.../PrimaryChallenge.java).
 * The options below reuse the exact module names already shown in the
 * Platform Modules section rather than inventing new categories.
 */
export const INTERESTED_PRODUCT_OPTIONS: { value: string; label: string; primaryChallenge: string }[] = [
  { value: "digital-menu-ordering", label: "Digital Menu & QR Ordering", primaryChallenge: "SLOW_ORDERING" },
  { value: "table-session", label: "Table & Session Management", primaryChallenge: "TABLE_MANAGEMENT" },
  { value: "kitchen-display", label: "Kitchen Display System", primaryChallenge: "KITCHEN_COORDINATION" },
  { value: "billing-payments", label: "Billing & Payment Flow", primaryChallenge: "BILLING_POS" },
  { value: "owner-dashboard", label: "Owner Dashboard & Insights", primaryChallenge: "SALES_REPORTING" },
  { value: "ai-intelligence", label: "AI Restaurant Intelligence", primaryChallenge: "CUSTOMER_ENGAGEMENT" },
  { value: "multi-branch", label: "Multi-branch Readiness", primaryChallenge: "MULTI_OUTLET" },
  { value: "complete-platform", label: "Complete MESA Platform", primaryChallenge: "COMPLETE_PLATFORM" },
  { value: "something-else", label: "Something else", primaryChallenge: "OTHER" },
];

export const CONTACT_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone call" },
  { value: "email", label: "Email" },
];
