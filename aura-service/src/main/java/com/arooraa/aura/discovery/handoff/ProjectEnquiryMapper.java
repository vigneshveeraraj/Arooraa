package com.arooraa.aura.discovery.handoff;

import com.arooraa.aura.discovery.domain.ProjectBriefFields;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Brief plus contact details, into the shape the Start Project workflow already accepts. Pure
 * string work — no model, no inference, nothing that could produce a field the visitor did not
 * cause.
 *
 * <h2>Why so much of it maps to "not sure"</h2>
 * The Start Project form asks a visitor to choose a solution model, an engagement model, a project
 * stage, a timeline band and a budget band. Aura asks none of those, deliberately: a conversation
 * that opens by asking a stranger what they can spend is a qualification form wearing a friendly
 * voice.
 *
 * <p>So those fields map to the workflow's own "don't know yet" values, which exist precisely for
 * this. The alternative — inferring a stage from the fact that somebody said "idea", or a platform
 * from the word "app" — would put a claim into an enquiry that the visitor never made, and a
 * person at AROORAA would read it as something they said. An honest "needs guidance" is more
 * useful than a plausible guess, because it is true.
 *
 * <p>{@code productTypes} is left empty for the sharpest version of the same reason: a keyword
 * table mapping "mobile app" to MOBILE_APPLICATION reads "we don't need a mobile app" the same way.
 * The visitor's own words go into the description instead, where nothing has to interpret them.
 */
@Component
public class ProjectEnquiryMapper {

    /** The workflow's own limit on its two long text fields. */
    private static final int MAX_TEXT = 3000;

    /**
     * Where this came from, in the workflow's own vocabulary. A person triaging enquiries should be
     * able to tell at a glance that this one arrived through a conversation rather than a form.
     */
    public static final String SOURCE = "AURA";

    public ProjectEnquirySubmission map(ProjectBriefFields brief, HandoffContact contact,
                                         UUID conversationPublicId) {
        return new ProjectEnquirySubmission(
                contact.name(),
                contact.companyName(),
                contact.businessEmail(),
                contact.phone(),
                contact.country(),
                contact.role(),
                describe(brief),
                existingSystemContext(brief),
                contact.preferredContactMethod(),
                SOURCE,
                conversationPublicId.toString());
    }

    /**
     * The brief as prose, in the order a person would want to read it, with every absent field
     * simply not mentioned. A section headed "Still to establish" is included when the brief knows
     * what it does not know — that is the most useful line in the whole enquiry for whoever picks
     * it up, and it is the opposite of a gap.
     */
    private String describe(ProjectBriefFields brief) {
        StringBuilder text = new StringBuilder();
        append(text, "Problem", brief.problemStatement());
        append(text, "Who it is for", brief.targetUsers());
        append(text, "How they do it today", brief.currentSituation());
        append(text, "What they want instead", brief.desiredOutcome());
        appendList(text, "Capabilities discussed", brief.proposedCapabilities());
        appendList(text, "Platforms", brief.platforms());
        appendList(text, "Integrations", brief.integrations());
        append(text, "AI or automation", brief.aiAutomationNeeds());
        append(text, "Existing systems", brief.existingSystems());
        append(text, "Constraints", brief.constraints());
        append(text, "Timeline", brief.timeline());
        appendList(text, "Still to establish", brief.unknowns());
        append(text, "In summary", brief.conversationSummary());

        if (text.isEmpty()) {
            // Reaching here means a visitor consented to send a brief that holds nothing, which
            // the handoff service refuses before we get here. Kept anyway so this method can never
            // return something the workflow would reject for being blank.
            return "A conversation with Aura that did not reach a project description.";
        }
        return truncate(text.toString().strip());
    }

    private String existingSystemContext(ProjectBriefFields brief) {
        StringBuilder text = new StringBuilder();
        append(text, "Existing systems", brief.existingSystems());
        append(text, "Constraints", brief.constraints());
        return text.isEmpty() ? null : truncate(text.toString().strip());
    }

    private void append(StringBuilder text, String label, String value) {
        if (value == null || value.isBlank()) return;
        text.append(label).append(": ").append(value.strip()).append("\n\n");
    }

    private void appendList(StringBuilder text, String label, List<String> values) {
        if (values.isEmpty()) return;
        text.append(label).append(": ").append(String.join("; ", values)).append("\n\n");
    }

    private String truncate(String value) {
        return value.length() <= MAX_TEXT ? value : value.substring(0, MAX_TEXT);
    }
}
