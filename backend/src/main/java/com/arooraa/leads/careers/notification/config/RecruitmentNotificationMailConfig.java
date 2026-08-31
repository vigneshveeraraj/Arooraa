package com.arooraa.leads.careers.notification.config;

import com.arooraa.leads.project.notification.mail.MailGateway;
import com.arooraa.leads.project.notification.mail.SmtpMailGateway;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * Reuses {@link MailGateway}/{@link SmtpMailGateway} directly from the Start Project
 * notification infrastructure (W3.3B §14 — "reuse where cleanly possible") rather than
 * duplicating SMTP-handling code; only the enable flag, recipient config and templates are
 * recruitment-specific. Mirrors {@code LeadNotificationMailConfig}'s
 * {@code @ConditionalOnMissingBean(MailGateway.class)} pattern: if lead-notifications has
 * already created the shared gateway bean, this backs off and reuses it (a {@code MailGateway}
 * is a stateless wrapper around one {@link JavaMailSender} — whichever config creates it, both
 * domains get the same working bean). If only recruitment-notifications is enabled, this
 * creates it instead, with its own fail-fast startup check.
 */
@Configuration
@EnableConfigurationProperties(RecruitmentNotificationProperties.class)
public class RecruitmentNotificationMailConfig {

    @Bean
    @ConditionalOnMissingBean(MailGateway.class)
    @ConditionalOnProperty(prefix = "arooraa.recruitment-notifications", name = "enabled", havingValue = "true")
    public MailGateway recruitmentMailGateway(RecruitmentNotificationProperties properties,
                                               ObjectProvider<JavaMailSender> javaMailSender) {
        JavaMailSender sender = javaMailSender.getIfAvailable();
        if (sender == null) {
            throw new IllegalStateException(
                    "arooraa.recruitment-notifications.enabled=true (AROORAA_RECRUITMENT_NOTIFICATIONS_ENABLED) but no "
                            + "mail sender is configured — set spring.mail.host (SPRING_MAIL_HOST) and related "
                            + "spring.mail.* properties, or disable recruitment notifications.");
        }
        if (isBlank(properties.mailFrom())) {
            throw new IllegalStateException(
                    "arooraa.recruitment-notifications.enabled=true but AROORAA_RECRUITMENT_MAIL_FROM is not set.");
        }
        if (properties.recruitmentAlertTo() == null || properties.recruitmentAlertTo().isEmpty()) {
            throw new IllegalStateException(
                    "arooraa.recruitment-notifications.enabled=true but AROORAA_RECRUITMENT_ALERT_TO is not set.");
        }
        return new SmtpMailGateway(sender);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
