package com.arooraa.leads.contact.notification.template;

public record CustomerAcknowledgementView(
        String reference,
        String recipientName,
        String reasonLabel
) {
}
