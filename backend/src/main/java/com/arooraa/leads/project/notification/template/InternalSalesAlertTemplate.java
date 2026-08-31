package com.arooraa.leads.project.notification.template;

import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.detailsTable;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.esc;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.row;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.sectionHeading;
import static com.arooraa.leads.project.notification.template.EmailHtmlChrome.wrap;

/**
 * The internal AROORAA lead alert (W3.2C §25-29) — designed for fast human action, not
 * marketing. No invented lead score or "HOT"/"High value" labels (§27); attribution metadata
 * stays in a restrained secondary section below the lead itself (§26).
 */
public final class InternalSalesAlertTemplate {

    private InternalSalesAlertTemplate() {
    }

    public static String subject(InternalSalesAlertView view) {
        String direction = view.direction() == null ? "" : " — " + view.direction();
        return "New project enquiry — " + view.reference() + direction;
    }

    public static String renderHtml(InternalSalesAlertView view) {
        StringBuilder body = new StringBuilder();
        body.append("<h1 style=\"margin:0 0 4px;font-size:19px;color:#1f2430;\">New project enquiry</h1>");
        body.append("<p style=\"margin:0 0 16px;font-size:15px;font-weight:700;\">").append(esc(view.reference())).append("</p>");

        String receivedRow = row("Received", view.receivedAt());
        body.append(detailsTable(receivedRow));

        body.append(sectionHeading("Contact"));
        String contactRows = row("Name", view.name())
                + row("Email", view.email())
                + row("Phone", view.phone())
                + row("Country", view.country())
                + row("Company", view.company())
                + row("Role", view.role())
                + preferredContactRow(view)
                + row("Preferred time", view.preferredContactTime());
        if (view.preferredIsWhatsapp() && view.whatsappConsent() != null) {
            contactRows += row("WhatsApp consent", view.whatsappConsent() ? "Yes" : "No");
        }
        body.append(detailsTable(contactRows));

        body.append(sectionHeading("Project direction"));
        String directionRows = row("Solution model", view.direction())
                + row("Engagement model", view.engagement())
                + row("Project stage", view.projectStage())
                + row("Product/platform types", view.productTypes())
                + row("Timeline", view.timeline())
                + row("Budget readiness", view.budget());
        body.append(detailsTable(directionRows));

        if (view.problemStatement() != null && !view.problemStatement().isBlank()) {
            body.append(sectionHeading("Problem"));
            body.append("<p style=\"margin:0;white-space:pre-wrap;color:#1f2430;\">")
                    .append(esc(view.problemStatement())).append("</p>");
        }

        if (view.existingSystemNote() != null && !view.existingSystemNote().isBlank()) {
            body.append(sectionHeading("Existing system"));
            body.append("<p style=\"margin:0;white-space:pre-wrap;color:#1f2430;\">")
                    .append(esc(view.existingSystemNote())).append("</p>");
        }

        String attributionRows = row("Source context", view.sourceContext())
                + row("Source page", view.sourcePage())
                + row("UTM source", view.utmSource())
                + row("UTM campaign", view.utmCampaign());
        String attributionTable = detailsTable(attributionRows);
        if (!attributionTable.isEmpty()) {
            body.append(sectionHeading("Attribution"));
            body.append(attributionTable);
        }

        return wrap("New project enquiry — " + view.reference(), body.toString());
    }

    public static String renderText(InternalSalesAlertView view) {
        StringBuilder text = new StringBuilder();
        text.append("New project enquiry\n");
        text.append("Reference: ").append(view.reference()).append("\n");
        appendTextLine(text, "Received", view.receivedAt());

        text.append("\nContact\n");
        appendTextLine(text, "Name", view.name());
        appendTextLine(text, "Email", view.email());
        appendTextLine(text, "Phone", view.phone());
        appendTextLine(text, "Country", view.country());
        appendTextLine(text, "Company", view.company());
        appendTextLine(text, "Role", view.role());
        String preferredContact = view.preferredContact();
        if (view.preferredIsPhone() || view.preferredIsWhatsapp()) {
            preferredContact = preferredContact + " ***";
        }
        appendTextLine(text, "Preferred contact", preferredContact);
        appendTextLine(text, "Preferred time", view.preferredContactTime());
        if (view.preferredIsWhatsapp() && view.whatsappConsent() != null) {
            appendTextLine(text, "WhatsApp consent", view.whatsappConsent() ? "Yes" : "No");
        }

        text.append("\nProject direction\n");
        appendTextLine(text, "Solution model", view.direction());
        appendTextLine(text, "Engagement model", view.engagement());
        appendTextLine(text, "Project stage", view.projectStage());
        appendTextLine(text, "Product/platform types", view.productTypes());
        appendTextLine(text, "Timeline", view.timeline());
        appendTextLine(text, "Budget readiness", view.budget());

        if (view.problemStatement() != null && !view.problemStatement().isBlank()) {
            text.append("\nProblem\n").append(view.problemStatement()).append('\n');
        }
        if (view.existingSystemNote() != null && !view.existingSystemNote().isBlank()) {
            text.append("\nExisting system\n").append(view.existingSystemNote()).append('\n');
        }

        StringBuilder attribution = new StringBuilder();
        appendTextLine(attribution, "Source context", view.sourceContext());
        appendTextLine(attribution, "Source page", view.sourcePage());
        appendTextLine(attribution, "UTM source", view.utmSource());
        appendTextLine(attribution, "UTM campaign", view.utmCampaign());
        if (!attribution.isEmpty()) {
            text.append("\nAttribution\n").append(attribution);
        }

        return text.toString();
    }

    private static String preferredContactRow(InternalSalesAlertView view) {
        String value = view.preferredContact();
        if ((view.preferredIsPhone() || view.preferredIsWhatsapp()) && value != null) {
            value = value + " ★"; // visually flag Phone/WhatsApp preference for fast human scanning (W3.2C §28)
        }
        return row("Preferred contact", value);
    }

    private static void appendTextLine(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(label).append(": ").append(value).append('\n');
        }
    }
}
