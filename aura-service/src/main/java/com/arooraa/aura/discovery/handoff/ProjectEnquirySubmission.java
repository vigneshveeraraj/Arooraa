package com.arooraa.aura.discovery.handoff;

/**
 * Exactly what Aura sends to the Start Project workflow, and nothing else.
 *
 * <p>A narrow record rather than the full enquiry contract on purpose: aura-service should not be
 * able to express a request the mapper was not designed to produce. Every field here is either
 * something the visitor typed into the contact step or something
 * {@link ProjectEnquiryMapper} derived deterministically from the stored brief — there is no field
 * a model could fill.
 *
 * @param sourceContext carries the conversation's public id, so a person following up on the
 *        enquiry can find the conversation it came from
 */
public record ProjectEnquirySubmission(
        String name,
        String companyName,
        String businessEmail,
        String phone,
        String country,
        String role,
        String problemStatement,
        String existingSystemContext,
        String preferredContactMethod,
        String source,
        String sourceContext) {
}
