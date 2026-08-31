package com.arooraa.leads.project.notification.domain;

/** W3.2C §8 — deliberately just these two; do not add SMS/WhatsApp/push/Slack/marketing here. */
public enum NotificationType {
    CUSTOMER_ACKNOWLEDGEMENT,
    INTERNAL_SALES_ALERT
}
