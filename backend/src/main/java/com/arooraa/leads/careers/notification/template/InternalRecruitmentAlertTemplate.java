package com.arooraa.leads.careers.notification.template;

import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.detailsTable;
import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.esc;
import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.row;
import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.sectionHeading;
import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.wrap;

/**
 * The internal AROORAA recruitment alert (W3.3B §14). References the application record for
 * future admin use rather than attaching the résumé — no résumé is ever attached to this email
 * (deliberate: attaching PII by default to an email thread has no strong security justification
 * here and wasn't explicitly approved).
 */
public final class InternalRecruitmentAlertTemplate {

    private InternalRecruitmentAlertTemplate() {
    }

    public static String subject(InternalRecruitmentAlertView view) {
        return "New job application — " + view.reference() + " — " + view.jobTitle();
    }

    public static String renderHtml(InternalRecruitmentAlertView view) {
        StringBuilder body = new StringBuilder();
        body.append("<h1 style=\"margin:0 0 16px;font-size:19px;color:#1f2430;\">New job application</h1>");
        body.append("<p style=\"margin:0 0 4px;font-size:15px;font-weight:700;\">").append(esc(view.reference())).append("</p>");
        body.append("<p style=\"margin:0 0 16px;color:#5b6472;\">").append(esc(view.jobTitle())).append("</p>");

        String candidateRows = row("Name", view.candidateName())
                + row("Email", view.email())
                + row("Phone", view.phone())
                + row("Current location", view.currentLocation())
                + row("Experience", view.experience())
                + row("LinkedIn", view.linkedinUrl())
                + row("Portfolio / GitHub", view.portfolioUrl())
                + row("Résumé attached", view.resumeAttached() ? "Yes" : "No")
                + row("Received", view.receivedAt());
        body.append(sectionHeading("Candidate"));
        body.append(detailsTable(candidateRows));

        if (view.note() != null && !view.note().isBlank()) {
            body.append(sectionHeading("Note from candidate"));
            body.append("<p style=\"margin:0;color:#1f2430;\">").append(esc(view.note())).append("</p>");
        }

        body.append("<p style=\"margin:20px 0 0;color:#5b6472;\">Full application record, including the résumé if "
                + "attached, is available in the recruitment system.</p>");

        return wrap("New job application — " + view.reference(), body.toString());
    }

    public static String renderText(InternalRecruitmentAlertView view) {
        StringBuilder text = new StringBuilder();
        text.append("New job application\n");
        text.append(view.reference()).append(" — ").append(view.jobTitle()).append("\n\n");
        appendLine(text, "Name", view.candidateName());
        appendLine(text, "Email", view.email());
        appendLine(text, "Phone", view.phone());
        appendLine(text, "Current location", view.currentLocation());
        appendLine(text, "Experience", view.experience());
        appendLine(text, "LinkedIn", view.linkedinUrl());
        appendLine(text, "Portfolio / GitHub", view.portfolioUrl());
        text.append("Résumé attached: ").append(view.resumeAttached() ? "Yes" : "No").append('\n');
        appendLine(text, "Received", view.receivedAt());
        if (view.note() != null && !view.note().isBlank()) {
            text.append("\nNote from candidate\n").append(view.note()).append('\n');
        }
        text.append("\nFull application record, including the résumé if attached, is available in the recruitment system.\n");
        return text.toString();
    }

    private static void appendLine(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(label).append(": ").append(value).append('\n');
        }
    }
}
