package com.arooraa.leads.contact.notification.template;

import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.esc;
import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.sectionHeading;
import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.wrap;

/** The sender's transactional receipt (W3.4 §13) — no promised response time, not marketing. */
public final class CustomerAcknowledgementTemplate {

    private CustomerAcknowledgementTemplate() {
    }

    public static String subject(CustomerAcknowledgementView view) {
        return "We received your message — " + view.reference();
    }

    public static String renderHtml(CustomerAcknowledgementView view) {
        String greetingName = view.recipientName() == null || view.recipientName().isBlank() ? "there" : view.recipientName();

        StringBuilder body = new StringBuilder();
        body.append("<h1 style=\"margin:0 0 16px;font-size:19px;color:#1f2430;\">We've received your message.</h1>");
        body.append("<p style=\"margin:0 0 12px;\">Hi ").append(esc(greetingName)).append(",</p>");
        body.append("<p style=\"margin:0 0 12px;\">Thank you for getting in touch with AROORAA");
        if (view.reasonLabel() != null && !view.reasonLabel().isBlank()) {
            body.append(" about ").append(esc(view.reasonLabel()));
        }
        body.append(".</p>");

        body.append(sectionHeading("Reference"));
        body.append("<p style=\"margin:0 0 4px;font-size:15px;font-weight:700;\">").append(esc(view.reference())).append("</p>");

        body.append(sectionHeading("What happens next"));
        body.append("<p style=\"margin:0;color:#1f2430;\">Our team will review your message and get back to you.</p>");

        body.append("<p style=\"margin:20px 0 0;font-weight:700;\">AROORAA<br/>"
                + "<span style=\"font-weight:400;color:#5b6472;\">Product Engineering &amp; Innovation</span></p>");

        return wrap("We've received your message — " + view.reference(), body.toString());
    }

    public static String renderText(CustomerAcknowledgementView view) {
        String greetingName = view.recipientName() == null || view.recipientName().isBlank() ? "there" : view.recipientName();
        StringBuilder text = new StringBuilder();
        text.append("AROORAA\nWe've received your message.\n\n");
        text.append("Hi ").append(greetingName).append(",\n\n");
        text.append("Thank you for getting in touch with AROORAA");
        if (view.reasonLabel() != null && !view.reasonLabel().isBlank()) {
            text.append(" about ").append(view.reasonLabel());
        }
        text.append(".\n\n");
        text.append("Reference: ").append(view.reference()).append("\n\n");
        text.append("What happens next\nOur team will review your message and get back to you.\n\n");
        text.append("AROORAA\nProduct Engineering & Innovation\n");
        return text.toString();
    }
}
