package com.arooraa.leads.admin.leads.domain;

/**
 * Identifies which underlying domain table a lead_management/lead_notes/lead_activity
 * row (or an AdminLeadSummary) refers to. This is the admin layer's unifying concept —
 * demo_requests, project_enquiries and lead_captures themselves stay completely separate tables.
 *
 * <p>LEAD_CAPTURE (lead_captures, frontend-v2/docs/lead-capture.md) has no name or email by
 * design; admin views leave those fields null rather than inventing an identity. The value fits
 * the existing VARCHAR(20) lead_type columns (V4), which carry no CHECK constraint, so no
 * migration was needed to add it.
 */
public enum LeadType {
    PROJECT_ENQUIRY,
    MESA_DEMO,
    LEAD_CAPTURE
}
