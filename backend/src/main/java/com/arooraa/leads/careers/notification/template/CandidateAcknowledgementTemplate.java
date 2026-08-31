package com.arooraa.leads.careers.notification.template;

import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.esc;
import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.sectionHeading;
import static com.arooraa.leads.careers.notification.template.EmailHtmlChrome.wrap;

/**
 * The candidate's transactional receipt (W3.3B §14) — confirms AROORAA received the
 * application. No promised response time, no SLA language, not marketing.
 */
public final class CandidateAcknowledgementTemplate {

    private CandidateAcknowledgementTemplate() {
    }

    public static String subject(CandidateAcknowledgementView view) {
        return "Application received — " + view.reference();
    }

    public static String renderHtml(CandidateAcknowledgementView view) {
        String greetingName = view.candidateName() == null || view.candidateName().isBlank()
                ? "there" : view.candidateName();

        StringBuilder body = new StringBuilder();
        body.append("<h1 style=\"margin:0 0 16px;font-size:19px;color:#1f2430;\">We've received your application.</h1>");
        body.append("<p style=\"margin:0 0 12px;\">Hi ").append(esc(greetingName)).append(",</p>");
        body.append("<p style=\"margin:0 0 12px;\">Thank you for applying to AROORAA")
                .append(view.jobTitle() == null ? "" : " for the " + esc(view.jobTitle()) + " role")
                .append(".</p>");
        body.append("<p style=\"margin:0 0 12px;\">Your application has been recorded and our team will review it.</p>");

        body.append(sectionHeading("Reference"));
        body.append("<p style=\"margin:0 0 4px;font-size:15px;font-weight:700;\">").append(esc(view.reference())).append("</p>");

        body.append(sectionHeading("What happens next"));
        body.append("<ol style=\"margin:0;padding-left:18px;color:#1f2430;\">")
                .append("<li>We review your application.</li>")
                .append("<li>If it's a fit for what we're looking for, we'll reach out to continue the conversation.</li>")
                .append("</ol>");

        body.append("<p style=\"margin:20px 0 0;color:#5b6472;\">AROORAA will never ask you to pay money as part of the "
                + "recruitment process.</p>");
        body.append("<p style=\"margin:20px 0 0;font-weight:700;\">AROORAA<br/>"
                + "<span style=\"font-weight:400;color:#5b6472;\">Product Engineering &amp; Innovation</span></p>");

        return wrap("We've received your application — " + view.reference(), body.toString());
    }

    public static String renderText(CandidateAcknowledgementView view) {
        String greetingName = view.candidateName() == null || view.candidateName().isBlank()
                ? "there" : view.candidateName();
        StringBuilder text = new StringBuilder();
        text.append("AROORAA\n");
        text.append("We've received your application.\n\n");
        text.append("Hi ").append(greetingName).append(",\n\n");
        text.append("Thank you for applying to AROORAA")
                .append(view.jobTitle() == null ? "" : " for the " + view.jobTitle() + " role")
                .append(".\n");
        text.append("Your application has been recorded and our team will review it.\n\n");
        text.append("Reference: ").append(view.reference()).append("\n\n");
        text.append("What happens next\n");
        text.append("1. We review your application.\n");
        text.append("2. If it's a fit for what we're looking for, we'll reach out to continue the conversation.\n\n");
        text.append("AROORAA will never ask you to pay money as part of the recruitment process.\n\n");
        text.append("AROORAA\nProduct Engineering & Innovation\n");
        return text.toString();
    }
}
