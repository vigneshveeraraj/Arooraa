package com.arooraa.leads.project.notification.mail;

import java.util.List;

/**
 * Provider-neutral email to send — everything a {@link MailGateway} needs and nothing about
 * how it gets delivered. {@code textBody} is required, not optional (W3.2C §40 — always send a
 * plain-text alternative alongside the HTML).
 *
 * <p>{@code fromDisplayName} (W4.7) is the RFC 5322 "personal" name shown alongside {@code from}
 * in the recipient's inbox (e.g. an inbox showing "AROORAA" instead of the bare mailbox
 * "hello@arooraa.com") — null/blank means no personal name, just the bare address.
 */
public record MailMessage(
        List<String> to,
        String from,
        String fromDisplayName,
        String replyTo,
        String subject,
        String htmlBody,
        String textBody
) {
}
