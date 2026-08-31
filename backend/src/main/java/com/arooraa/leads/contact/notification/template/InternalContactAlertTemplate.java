package com.arooraa.leads.contact.notification.template;

import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.detailsTable;
import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.esc;
import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.row;
import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.sectionHeading;
import static com.arooraa.leads.contact.notification.template.EmailHtmlChrome.wrap;

/** The internal AROORAA contact alert (W3.4 §13) — kept concise. */
public final class InternalContactAlertTemplate {

    private InternalContactAlertTemplate() {
    }

    public static String subject(InternalContactAlertView view) {
        return "New contact message — " + view.reference() + " — " + view.reasonLabel();
    }

    public static String renderHtml(InternalContactAlertView view) {
        StringBuilder body = new StringBuilder();
        body.append("<h1 style=\"margin:0 0 16px;font-size:19px;color:#1f2430;\">New contact message</h1>");
        body.append("<p style=\"margin:0 0 4px;font-size:15px;font-weight:700;\">").append(esc(view.reference())).append("</p>");
        body.append("<p style=\"margin:0 0 16px;color:#5b6472;\">").append(esc(view.reasonLabel())).append("</p>");

        String rows = row("Name", view.name())
                + row("Email", view.email())
                + row("Phone", view.phone())
                + row("Company", view.company())
                + row("Product", view.productLabel())
                + row("Received", view.receivedAt());
        body.append(sectionHeading("Sender"));
        body.append(detailsTable(rows));

        if (view.messagePreview() != null && !view.messagePreview().isBlank()) {
            body.append(sectionHeading("Message"));
            body.append("<p style=\"margin:0;color:#1f2430;\">").append(esc(view.messagePreview())).append("</p>");
        }

        return wrap("New contact message — " + view.reference(), body.toString());
    }

    public static String renderText(InternalContactAlertView view) {
        StringBuilder text = new StringBuilder();
        text.append("New contact message\n").append(view.reference()).append(" — ").append(view.reasonLabel()).append("\n\n");
        appendLine(text, "Name", view.name());
        appendLine(text, "Email", view.email());
        appendLine(text, "Phone", view.phone());
        appendLine(text, "Company", view.company());
        appendLine(text, "Product", view.productLabel());
        appendLine(text, "Received", view.receivedAt());
        if (view.messagePreview() != null && !view.messagePreview().isBlank()) {
            text.append("\nMessage\n").append(view.messagePreview()).append('\n');
        }
        return text.toString();
    }

    private static void appendLine(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(label).append(": ").append(value).append('\n');
        }
    }
}
