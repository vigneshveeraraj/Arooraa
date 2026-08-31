package com.arooraa.leads.contact.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Backed by {@code arooraa.contact-notifications.*} — an independent enable flag from both
 * lead-notifications and recruitment-notifications, so Contact email can be turned on/off
 * without affecting either. Shares the same underlying SMTP ({@code spring.mail.*}) transport.
 */
@ConfigurationProperties(prefix = "arooraa.contact-notifications")
public record ContactNotificationProperties(
        boolean enabled,
        String mailFrom,
        String mailFromDisplayName,
        List<String> contactAlertTo,
        Worker worker
) {
    public record Worker(int cadenceSeconds, int batchSize) {
    }
}
