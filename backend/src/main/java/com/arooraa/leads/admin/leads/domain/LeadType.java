package com.arooraa.leads.admin.leads.domain;

/**
 * Identifies which underlying domain table a lead_management/lead_notes/lead_activity
 * row (or an AdminLeadSummary) refers to. This is the admin layer's unifying concept —
 * demo_requests and project_enquiries themselves stay completely separate tables.
 */
public enum LeadType {
    PROJECT_ENQUIRY,
    MESA_DEMO
}
