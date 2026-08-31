package com.arooraa.leads.careers.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Backed by {@code arooraa.recruitment-notifications.*}, itself backed by
 * {@code AROORAA_RECRUITMENT_NOTIFICATIONS_ENABLED}/{@code AROORAA_RECRUITMENT_MAIL_FROM}/
 * {@code AROORAA_RECRUITMENT_ALERT_TO} env vars — an independent enable flag and recipient list
 * from lead-notifications, so recruitment email can be turned on/off without affecting sales
 * lead email and vice versa. SMTP transport is the same shared {@code spring.mail.*}
 * configuration lead-notifications already uses (one mail account, two notification domains).
 */
@ConfigurationProperties(prefix = "arooraa.recruitment-notifications")
public record RecruitmentNotificationProperties(
        boolean enabled,
        String mailFrom,
        List<String> recruitmentAlertTo,
        Worker worker
) {
    public record Worker(int cadenceSeconds, int batchSize) {
    }
}
