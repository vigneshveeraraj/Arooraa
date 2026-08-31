package com.arooraa.leads.project.notification.template;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InternalSalesAlertTemplateTest {

    private static InternalSalesAlertView sampleView() {
        return new InternalSalesAlertView(
                "ARO-2026-000123", "29 Aug 2026, 10:15 UTC", "Build a New Product",
                "Priya Nair", "priya@example.com", "+919876500200", "India", "Nair Foods", "Founder",
                "WhatsApp", "Morning", false, true, true,
                "Discover & Define", "Exploring", "Mobile Application, Backend APIs",
                "Within 1-3 months", "Under 5L",
                "We want to launch a <b>new</b> ordering app for our restaurant chain.",
                "We currently use a manual spreadsheet-based process.",
                "Referral", "/start-project", "google", "spring-launch");
    }

    @Test
    void subjectIncludesReferenceAndDirection() {
        assertEquals("New project enquiry — ARO-2026-000123 — Build a New Product",
                InternalSalesAlertTemplate.subject(sampleView()));
    }

    @Test
    void htmlContainsAllRequiredSalesFacingContent() {
        String html = InternalSalesAlertTemplate.renderHtml(sampleView());

        assertTrue(html.contains("ARO-2026-000123"));
        assertTrue(html.contains("29 Aug 2026, 10:15 UTC"));
        assertTrue(html.contains("Priya Nair"));
        assertTrue(html.contains("priya@example.com"));
        assertTrue(html.contains("+919876500200"));
        assertTrue(html.contains("India"));
        assertTrue(html.contains("Nair Foods"));
        assertTrue(html.contains("Founder"));
        assertTrue(html.contains("WhatsApp"));
        assertTrue(html.contains("Morning"));
        assertTrue(html.contains("WhatsApp consent"));
        assertTrue(html.contains("Discover &amp; Define"));
        assertTrue(html.contains("Exploring"));
        assertTrue(html.contains("Mobile Application, Backend APIs"));
        assertTrue(html.contains("Within 1-3 months"));
        assertTrue(html.contains("Under 5L"));
        assertTrue(html.contains("We currently use a manual spreadsheet-based process."));
        assertTrue(html.contains("Referral"));
        assertTrue(html.contains("/start-project"));
        assertTrue(html.contains("google"));
        assertTrue(html.contains("spring-launch"));
    }

    @Test
    void whatsappPreferenceIsVisuallyFlagged() {
        String html = InternalSalesAlertTemplate.renderHtml(sampleView());
        assertTrue(html.contains("WhatsApp ★"));
    }

    @Test
    void phonePreferenceIsAlsoVisuallyFlagged() {
        InternalSalesAlertView phonePreferred = new InternalSalesAlertView(
                "ARO-2026-000126", "29 Aug 2026, 10:15 UTC", "Build a New Product",
                "Arun Kumar", "arun@example.com", "+919876543210", "India", null, null,
                "Phone", null, true, false, null,
                "New Product", null, null, "From 1 to 3 months", "From 2L to 5L",
                "We need a logistics tracking platform.", null, null, null, null, null);

        String html = InternalSalesAlertTemplate.renderHtml(phonePreferred);
        assertTrue(html.contains("Phone ★"));
    }

    @Test
    void whatsappConsentLineOmittedWhenPreferredContactIsNotWhatsapp() {
        InternalSalesAlertView emailPreferred = new InternalSalesAlertView(
                "ARO-2026-000127", "29 Aug 2026, 10:15 UTC", "Build a New Product",
                "Arun Kumar", "arun@example.com", "+919876543210", "India", null, null,
                "Email", null, false, false, null,
                "New Product", null, null, "From 1 to 3 months", "From 2L to 5L",
                "We need a logistics tracking platform.", null, null, null, null, null);

        String html = InternalSalesAlertTemplate.renderHtml(emailPreferred);
        assertFalse(html.contains("WhatsApp consent"));
    }

    @Test
    void doesNotInventANumericalLeadScoreOrUrgencyLabel() {
        String html = InternalSalesAlertTemplate.renderHtml(sampleView());
        String lower = html.toLowerCase();

        assertFalse(lower.contains("hot lead"));
        assertFalse(lower.contains("high value"));
        assertFalse(lower.contains("likely to convert"));
        assertFalse(lower.contains("score:"));
    }

    @Test
    void problemStatementIsHtmlEscapedNotExecutedOrRenderedAsMarkup() {
        String html = InternalSalesAlertTemplate.renderHtml(sampleView());

        assertFalse(html.contains("<b>new</b>"));
        assertTrue(html.contains("&lt;b&gt;new&lt;/b&gt;"));
    }

    @Test
    void textAlternativeContainsCoreFields() {
        String text = InternalSalesAlertTemplate.renderText(sampleView());

        assertTrue(text.contains("Reference: ARO-2026-000123"));
        assertTrue(text.contains("Name: Priya Nair"));
        assertTrue(text.contains("Preferred contact: WhatsApp ***"));
        assertTrue(text.contains("WhatsApp consent: Yes"));
    }
}
