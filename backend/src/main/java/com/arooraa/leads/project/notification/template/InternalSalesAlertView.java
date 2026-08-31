package com.arooraa.leads.project.notification.template;

/** Everything {@link InternalSalesAlertTemplate} needs (W3.2C §26). */
public record InternalSalesAlertView(
        String reference,
        String receivedAt,
        String direction,
        String name,
        String email,
        String phone,
        String country,
        String company,
        String role,
        String preferredContact,
        String preferredContactTime,
        boolean preferredIsPhone,
        boolean preferredIsWhatsapp,
        Boolean whatsappConsent,
        String engagement,
        String projectStage,
        String productTypes,
        String timeline,
        String budget,
        String problemStatement,
        String existingSystemNote,
        String sourceContext,
        String sourcePage,
        String utmSource,
        String utmCampaign
) {
}
