package com.arooraa.leads.capture.domain;

/** Same lifecycle vocabulary as EnquiryStatus/LeadStatus, so the shared admin workflow applies unchanged. */
public enum LeadCaptureStatus {
    NEW,
    CONTACTED,
    QUALIFIED,
    PROPOSAL_SENT,
    NEGOTIATION,
    WON,
    LOST
}
