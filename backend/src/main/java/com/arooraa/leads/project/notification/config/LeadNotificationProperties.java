package com.arooraa.leads.project.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * All external — never hardcoded (W3.2C §5). Backed by {@code arooraa.lead-notifications.*} in
 * application.yml, itself backed by {@code AROORAA_LEAD_NOTIFICATIONS_ENABLED}/
 * {@code AROORAA_MAIL_FROM}/{@code AROORAA_MAIL_REPLY_TO}/{@code AROORAA_SALES_NOTIFICATION_TO}
 * env vars, following this project's existing {@code arooraa.*} → {@code AROORAA_*} convention.
 * SMTP transport itself is configured through Spring Boot's own {@code spring.mail.*}
 * properties (W3.2C §4 — "the existing Spring/config mechanism"), not duplicated here, so any
 * SMTP-speaking provider (Hostinger, Zoho, Google Workspace, SES, ...) works by setting
 * {@code SPRING_MAIL_*} env vars, with zero code change.
 */
@ConfigurationProperties(prefix = "arooraa.lead-notifications")
public record LeadNotificationProperties(
        boolean enabled,
        String mailFrom,
        String mailFromDisplayName,
        String mailReplyTo,
        List<String> salesNotificationTo,
        Worker worker
) {
    public record Worker(int cadenceSeconds, int batchSize) {
    }
}
