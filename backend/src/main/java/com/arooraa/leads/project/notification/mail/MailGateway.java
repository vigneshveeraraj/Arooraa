package com.arooraa.leads.project.notification.mail;

/**
 * Provider-neutral send boundary (W3.2C §4). Business logic (LeadNotificationService,
 * NotificationOutboxProcessor, templates) knows nothing about SMTP/JavaMailSender or any
 * specific provider — only this interface. Swapping Hostinger/Zoho/Google Workspace/SES/etc.
 * means swapping the bean behind this interface, not touching business logic.
 */
public interface MailGateway {

    /**
     * @throws RetryableMailDeliveryException for transient failures worth retrying (timeout,
     *         temporary SMTP error, provider unavailable, rate limit).
     * @throws PermanentMailDeliveryException for failures no retry can fix (malformed
     *         recipient, invalid configuration, a clear permanent rejection).
     */
    void send(MailMessage message);
}
