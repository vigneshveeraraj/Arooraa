package com.arooraa.leads.careers.notification.template;

/** Only fields already safe to show back to the candidate — never internal ids or metadata. */
public record CandidateAcknowledgementView(
        String reference,
        String candidateName,
        String jobTitle
) {
}
