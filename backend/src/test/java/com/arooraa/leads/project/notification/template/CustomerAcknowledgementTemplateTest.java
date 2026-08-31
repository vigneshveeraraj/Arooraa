package com.arooraa.leads.project.notification.template;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CustomerAcknowledgementTemplateTest {

    private static CustomerAcknowledgementView sampleView() {
        return new CustomerAcknowledgementView(
                "ARO-2026-000123", "Priya Nair", "Build a New Product", "Discover & Define",
                "Exploring", "Within 1-3 months", "Phone", "We want to launch a new ordering app.");
    }

    @Test
    void subjectIncludesReference() {
        assertEquals("We received your project enquiry — ARO-2026-000123", CustomerAcknowledgementTemplate.subject(sampleView()));
    }

    @Test
    void htmlContainsExpectedCustomerFacingContent() {
        String html = CustomerAcknowledgementTemplate.renderHtml(sampleView());

        assertTrue(html.contains("AROORAA"));
        assertTrue(html.contains("Priya Nair"));
        assertTrue(html.contains("ARO-2026-000123"));
        assertTrue(html.contains("Build a New Product"));
        assertTrue(html.contains("Discover &amp; Define"));
        assertTrue(html.contains("Exploring"));
        assertTrue(html.contains("Within 1-3 months"));
        assertTrue(html.contains("Phone"));
        assertTrue(html.contains("AROORAA reaches out using your preferred contact method"));
    }

    @Test
    void htmlNeverContainsInternalOnlyMetadata() {
        String html = CustomerAcknowledgementTemplate.renderHtml(sampleView());

        assertFalse(html.toLowerCase().contains("idempotency"));
        assertFalse(html.toLowerCase().contains("utm"));
        assertFalse(html.toLowerCase().contains("ip_hash"));
        assertFalse(html.contains("within 24 hours"));
        assertFalse(html.contains("within 1 hour"));
    }

    @Test
    void textAlternativeContainsTheSameCoreContent() {
        String text = CustomerAcknowledgementTemplate.renderText(sampleView());

        assertTrue(text.contains("ARO-2026-000123"));
        assertTrue(text.contains("Priya Nair"));
        assertTrue(text.contains("Direction: Build a New Product"));
        assertTrue(text.contains("Timeline: Within 1-3 months"));
        assertTrue(text.contains("Preferred contact: Phone"));
    }

    @Test
    void customerSuppliedNameIsHtmlEscapedNotExecuted() {
        CustomerAcknowledgementView view = new CustomerAcknowledgementView(
                "ARO-2026-000124", "<script>alert('x')</script>", "Build a New Product", "Discover & Define",
                null, null, "Email", null);

        String html = CustomerAcknowledgementTemplate.renderHtml(view);

        assertFalse(html.contains("<script>alert"));
        assertTrue(html.contains("&lt;script&gt;"));
    }

    @Test
    void omitsProjectStageAndProblemPreviewLinesWhenAbsent() {
        CustomerAcknowledgementView view = new CustomerAcknowledgementView(
                "ARO-2026-000125", "Arun Kumar", "Custom Software", "New Product", null, "From 1 to 3 months",
                "Phone", null);

        String html = CustomerAcknowledgementTemplate.renderHtml(view);

        assertFalse(html.contains("What you shared"));
    }
}
