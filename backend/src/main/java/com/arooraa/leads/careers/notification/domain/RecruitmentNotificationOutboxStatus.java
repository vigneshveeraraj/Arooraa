package com.arooraa.leads.careers.notification.domain;

/**
 * Independent from {@link com.arooraa.leads.careers.domain.ApplicationStatus} — an application
 * can stay RECEIVED while its acknowledgement email is RETRY. These describe delivery of one
 * notification intent, not the recruitment state of the application it belongs to.
 */
public enum RecruitmentNotificationOutboxStatus {
    PENDING,
    PROCESSING,
    SENT,
    RETRY,
    FAILED
}
