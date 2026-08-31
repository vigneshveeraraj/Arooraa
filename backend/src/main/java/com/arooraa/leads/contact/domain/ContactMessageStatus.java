package com.arooraa.leads.contact.domain;

/**
 * Deliberately its own enum, never the sales EnquiryStatus, recruitment ApplicationStatus, or
 * demo-request status. Every message starts at {@link #NEW} in this milestone; nothing sets any
 * other value yet — no Contact-admin workflow exists (W3.4 §9). Later values exist so a future
 * milestone can add a status change without a schema change.
 */
public enum ContactMessageStatus {
    NEW,
    UNDER_REVIEW,
    RESPONDED,
    CLOSED
}
