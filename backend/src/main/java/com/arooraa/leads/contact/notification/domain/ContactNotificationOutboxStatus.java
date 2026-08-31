package com.arooraa.leads.contact.notification.domain;

/** Independent from {@link com.arooraa.leads.contact.domain.ContactMessageStatus} — describes delivery of one notification intent, not the message's own state. */
public enum ContactNotificationOutboxStatus {
    PENDING,
    PROCESSING,
    SENT,
    RETRY,
    FAILED
}
