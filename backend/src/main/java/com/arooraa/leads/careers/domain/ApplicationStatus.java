package com.arooraa.leads.careers.domain;

/**
 * Deliberately its own enum, never the sales {@code EnquiryStatus} (W3.3B §2) — a job
 * application and a sales lead are different kinds of record with different lifecycles.
 * Every application starts at {@link #RECEIVED} in this milestone; nothing sets any other
 * value yet (no recruitment admin workflow exists — W3.3B §22). The later values exist so a
 * future recruitment-admin milestone can add a status change without a schema change.
 */
public enum ApplicationStatus {
    RECEIVED,
    UNDER_REVIEW,
    SHORTLISTED,
    INTERVIEW,
    OFFER,
    HIRED,
    REJECTED,
    WITHDRAWN
}
