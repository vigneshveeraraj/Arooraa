package com.arooraa.leads.project.notification.domain;

/**
 * Independent from {@link com.arooraa.leads.project.domain.EnquiryStatus} (W3.2C §12) — a lead
 * can stay NEW while its acknowledgement email is RETRY. These describe delivery of one
 * notification intent, not the sales state of the lead it belongs to.
 */
public enum NotificationOutboxStatus {
    PENDING,
    PROCESSING,
    SENT,
    RETRY,
    FAILED
}
