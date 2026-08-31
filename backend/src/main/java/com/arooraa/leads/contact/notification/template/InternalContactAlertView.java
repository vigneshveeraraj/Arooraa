package com.arooraa.leads.contact.notification.template;

/** Internal-only — never sent to the sender. */
public record InternalContactAlertView(
        String reference,
        String receivedAt,
        String reasonLabel,
        String productLabel,
        String name,
        String email,
        String phone,
        String company,
        String messagePreview
) {
}
