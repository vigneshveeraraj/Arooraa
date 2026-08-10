package com.arooraa.leads.domain;

/**
 * Widened in Milestone 2C from a single NEW value so MESA demo requests can go through
 * the same internal triage pipeline as project enquiries (see
 * com.arooraa.leads.project.domain.EnquiryStatus). This does not change any existing
 * behaviour: public submissions still always start at NEW; only admin-only status
 * transitions (Milestone 2C) can move a lead beyond it.
 */
public enum LeadStatus {
    NEW,
    CONTACTED,
    QUALIFIED,
    PROPOSAL_SENT,
    NEGOTIATION,
    WON,
    LOST
}
