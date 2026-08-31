package com.arooraa.leads.project.notification.template;

import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.detailsTable;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.esc;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.row;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.sectionHeading;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.wrap;

/**
 * The customer's transactional receipt (W3.2C §19-24) — confirms AROORAA received the enquiry.
 * Not marketing: no unsubscribe link, no promotional framing, no promised response time.
 */
public final class CustomerAcknowledgementTemplate {

    private CustomerAcknowledgementTemplate() {
    }

    public static String subject(CustomerAcknowledgementView view) {
        return "We received your project enquiry — " + view.reference();
    }

    public static String renderHtml(CustomerAcknowledgementView view) {
        String greetingName = view.recipientName() == null || view.recipientName().isBlank()
                ? "there" : view.recipientName();

        StringBuilder body = new StringBuilder();
        body.append("<h1 style=\"margin:0 0 16px;font-size:19px;color:#1f2430;\">We've received your project enquiry.</h1>");
        body.append("<p style=\"margin:0 0 12px;\">Hi ").append(esc(greetingName)).append(",</p>");
        body.append("<p style=\"margin:0 0 12px;\">Thank you for sharing what you're looking to build, improve or solve.</p>");
        body.append("<p style=\"margin:0 0 12px;\">Your enquiry has been recorded and our team will review the context you shared.</p>");

        body.append(sectionHeading("Reference"));
        body.append("<p style=\"margin:0 0 4px;font-size:15px;font-weight:700;\">").append(esc(view.reference())).append("</p>");

        String selectionRows = row("Direction", view.direction())
                + row("How you'd like us to help", view.engagementHelp())
                + row("Project stage", view.projectStage())
                + row("Timeline", view.timeline());
        String selectionTable = detailsTable(selectionRows);
        if (!selectionTable.isEmpty()) {
            body.append(sectionHeading("What you selected"));
            body.append(selectionTable);
        }

        if (view.problemPreview() != null && !view.problemPreview().isBlank()) {
            body.append(sectionHeading("What you shared"));
            body.append("<p style=\"margin:0;color:#5b6472;\">").append(esc(view.problemPreview())).append("</p>");
        }

        body.append(sectionHeading("What happens next"));
        body.append("<ol style=\"margin:0;padding-left:18px;color:#1f2430;\">")
                .append("<li>We review the context.</li>")
                .append("<li>We identify the right next conversation.</li>")
                .append("<li>AROORAA reaches out using your preferred contact method.</li>")
                .append("</ol>");

        String preferredContactRow = row("Preferred contact", view.preferredContact());
        String preferredContactTable = detailsTable(preferredContactRow);
        if (!preferredContactTable.isEmpty()) {
            body.append("<div style=\"margin-top:12px;\">").append(preferredContactTable).append("</div>");
        }

        body.append("<p style=\"margin:20px 0 0;color:#5b6472;\">You don't need to prepare a complete technical "
                + "specification before we speak. We'll start with the problem and help shape the next step.</p>");
        body.append("<p style=\"margin:20px 0 0;font-weight:700;\">AROORAA<br/>"
                + "<span style=\"font-weight:400;color:#5b6472;\">Product Engineering &amp; Innovation</span></p>");

        return wrap("We've received your project enquiry — " + view.reference(), body.toString());
    }

    public static String renderText(CustomerAcknowledgementView view) {
        String greetingName = view.recipientName() == null || view.recipientName().isBlank()
                ? "there" : view.recipientName();
        StringBuilder text = new StringBuilder();
        text.append("AROORAA\n");
        text.append("We've received your project enquiry.\n\n");
        text.append("Hi ").append(greetingName).append(",\n\n");
        text.append("Thank you for sharing what you're looking to build, improve or solve.\n");
        text.append("Your enquiry has been recorded and our team will review the context you shared.\n\n");
        text.append("Reference: ").append(view.reference()).append("\n\n");
        text.append("What you selected\n");
        appendTextLine(text, "Direction", view.direction());
        appendTextLine(text, "How you'd like us to help", view.engagementHelp());
        appendTextLine(text, "Project stage", view.projectStage());
        appendTextLine(text, "Timeline", view.timeline());
        if (view.problemPreview() != null && !view.problemPreview().isBlank()) {
            text.append("\nWhat you shared\n").append(view.problemPreview()).append('\n');
        }
        text.append("\nWhat happens next\n");
        text.append("1. We review the context.\n");
        text.append("2. We identify the right next conversation.\n");
        text.append("3. AROORAA reaches out using your preferred contact method.\n\n");
        appendTextLine(text, "Preferred contact", view.preferredContact());
        text.append("\nYou don't need to prepare a complete technical specification before we speak. "
                + "We'll start with the problem and help shape the next step.\n\n");
        text.append("AROORAA\nProduct Engineering & Innovation\n");
        return text.toString();
    }

    private static void appendTextLine(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(label).append(": ").append(value).append('\n');
        }
    }
}
