package com.arooraa.leads.project.notification.mail;

import java.util.List;

/**
 * Provider-neutral email to send — everything a {@link MailGateway} needs and nothing about
 * how it gets delivered. {@code textBody} is required, not optional (W3.2C §40 — always send a
 * plain-text alternative alongside the HTML).
 */
public record MailMessage(
        List<String> to,
        String from,
        String replyTo,
        String subject,
        String htmlBody,
        String textBody
) {
}
