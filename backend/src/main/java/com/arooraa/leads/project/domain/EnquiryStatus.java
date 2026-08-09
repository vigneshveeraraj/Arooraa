package com.arooraa.leads.project.domain;

/**
 * Distinct from com.arooraa.leads.domain.LeadStatus (MESA demo requests): project
 * enquiries go through a sales pipeline, not just a single "NEW" intake state.
 * Public submissions always start at NEW; no public API transitions this value.
 */
public enum EnquiryStatus {
    NEW,
    CONTACTED,
    QUALIFIED,
    PROPOSAL_SENT,
    NEGOTIATION,
    WON,
    LOST
}
