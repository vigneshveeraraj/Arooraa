package com.arooraa.leads.contact.notification.config;

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
 * Reuses {@link MailGateway}/{@link SmtpMailGateway} directly — same
 * {@code @ConditionalOnMissingBean(MailGateway.class)} idiom as
 * {@code LeadNotificationMailConfig}/{@code RecruitmentNotificationMailConfig}: whichever
 * enabled notification domain's config runs first creates the one shared gateway bean; the
 * others back off and reuse it (it's a stateless wrapper around one {@link JavaMailSender}).
 */
@Configuration
@EnableConfigurationProperties(ContactNotificationProperties.class)
public class ContactNotificationMailConfig {

    @Bean
    @ConditionalOnMissingBean(MailGateway.class)
    @ConditionalOnProperty(prefix = "arooraa.contact-notifications", name = "enabled", havingValue = "true")
    public MailGateway contactMailGateway(ContactNotificationProperties properties, ObjectProvider<JavaMailSender> javaMailSender) {
        JavaMailSender sender = javaMailSender.getIfAvailable();
        if (sender == null) {
            throw new IllegalStateException(
                    "arooraa.contact-notifications.enabled=true (AROORAA_CONTACT_NOTIFICATIONS_ENABLED) but no mail "
                            + "sender is configured — set spring.mail.host (SPRING_MAIL_HOST) and related spring.mail.* "
                            + "properties, or disable contact notifications.");
        }
        if (isBlank(properties.mailFrom())) {
            throw new IllegalStateException("arooraa.contact-notifications.enabled=true but AROORAA_CONTACT_MAIL_FROM is not set.");
        }
        if (properties.contactAlertTo() == null || properties.contactAlertTo().isEmpty()) {
            throw new IllegalStateException("arooraa.contact-notifications.enabled=true but AROORAA_CONTACT_ALERT_TO is not set.");
        }
        return new SmtpMailGateway(sender);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
