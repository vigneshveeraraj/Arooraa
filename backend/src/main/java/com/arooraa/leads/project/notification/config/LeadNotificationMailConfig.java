package com.arooraa.leads.project.notification.config;

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
 * Wires the real SMTP-backed {@link MailGateway} only when notifications are enabled — and
 * fails startup clearly (W3.2C §46) rather than silently claiming email capability, if enabled
 * without the mail infrastructure it needs. {@code @ConditionalOnMissingBean} lets a test
 * register its own fake {@link MailGateway} and have it take over without ever touching
 * {@link JavaMailSender}/real SMTP (W3.2C §6).
 */
@Configuration
@EnableConfigurationProperties(LeadNotificationProperties.class)
public class LeadNotificationMailConfig {

    @Bean
    @ConditionalOnMissingBean(MailGateway.class)
    @ConditionalOnProperty(prefix = "arooraa.lead-notifications", name = "enabled", havingValue = "true")
    public MailGateway mailGateway(LeadNotificationProperties properties, ObjectProvider<JavaMailSender> javaMailSender) {
        JavaMailSender sender = javaMailSender.getIfAvailable();
        if (sender == null) {
            throw new IllegalStateException(
                    "arooraa.lead-notifications.enabled=true (AROORAA_LEAD_NOTIFICATIONS_ENABLED) but no mail "
                            + "sender is configured — set spring.mail.host (SPRING_MAIL_HOST) and related "
                            + "spring.mail.* properties, or disable lead notifications.");
        }
        if (isBlank(properties.mailFrom())) {
            throw new IllegalStateException(
                    "arooraa.lead-notifications.enabled=true but AROORAA_MAIL_FROM is not set.");
        }
        if (properties.salesNotificationTo() == null || properties.salesNotificationTo().isEmpty()) {
            throw new IllegalStateException(
                    "arooraa.lead-notifications.enabled=true but AROORAA_SALES_NOTIFICATION_TO is not set.");
        }
        return new SmtpMailGateway(sender);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
