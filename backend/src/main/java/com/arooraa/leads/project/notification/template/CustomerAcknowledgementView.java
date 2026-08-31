package com.arooraa.leads.project.notification.template;

/**
 * Everything {@link CustomerAcknowledgementTemplate} needs, and nothing internal (W3.2B/W3.2C
 * scope boundary — no DB id, idempotency key, UTM values, or other internal metadata belongs
 * here; see W3.2C §22).
 */
public record CustomerAcknowledgementView(
        String reference,
        String recipientName,
        String direction,
        String engagementHelp,
        String projectStage,
        String timeline,
        String preferredContact,
        String problemPreview
) {
}
