package com.arooraa.aura.discovery.handoff;

import com.arooraa.aura.discovery.domain.ProjectBriefFields;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The mapping is pure string work, and the tests here are mostly about what it refuses to do:
 * invent a field the visitor never answered, or interpret their words into an enum.
 */
class ProjectEnquiryMapperTest {

    private final ProjectEnquiryMapper mapper = new ProjectEnquiryMapper();
    private static final UUID CONVERSATION = UUID.randomUUID();

    private static final HandoffContact CONTACT = new HandoffContact(
            "Priya Sharma", "Sharma Foods", "priya@example.com", "+91 98765 43210", "India",
            "Operations lead", "EMAIL");

    private static ProjectBriefFields brief() {
        return new ProjectBriefFields(
                "Parents miss school notices sent over WhatsApp.",
                "Parents, and the school office",
                "WhatsApp groups and a paper diary",
                "One place where every schedule change reaches the right parent",
                List.of("shared calendar", "notifications"),
                List.of("phones", "laptop"),
                List.of("the school's existing student records"),
                null,
                "A student records system the office already uses",
                "The office has one part-time administrator",
                "Before the next school year",
                List.of("How many schools", "Whether payments are involved"),
                "A parent app for school schedules, replacing WhatsApp groups.");
    }

    @Test
    void carriesTheContactDetailsThroughUnchanged() {
        ProjectEnquirySubmission submission = mapper.map(brief(), CONTACT, CONVERSATION);

        assertThat(submission.name()).isEqualTo("Priya Sharma");
        assertThat(submission.businessEmail()).isEqualTo("priya@example.com");
        assertThat(submission.phone()).isEqualTo("+91 98765 43210");
        assertThat(submission.country()).isEqualTo("India");
        assertThat(submission.preferredContactMethod()).isEqualTo("EMAIL");
    }

    @Test
    void writesTheBriefAsSomethingAPersonCanRead() {
        String description = mapper.map(brief(), CONTACT, CONVERSATION).problemStatement();

        assertThat(description)
                .contains("Problem: Parents miss school notices")
                .contains("Who it is for: Parents, and the school office")
                .contains("How they do it today: WhatsApp groups and a paper diary")
                .contains("Capabilities discussed: shared calendar; notifications")
                .contains("Timeline: Before the next school year");
    }

    @Test
    void saysWhatItDoesNotKnowRatherThanLeavingAGap() {
        // The most useful line in the whole enquiry for whoever picks it up.
        assertThat(mapper.map(brief(), CONTACT, CONVERSATION).problemStatement())
                .contains("Still to establish: How many schools; Whether payments are involved");
    }

    @Test
    void mentionsNothingTheBriefDoesNotKnow() {
        ProjectBriefFields sparse = new ProjectBriefFields("Parents miss school notices.",
                "Parents", null, null, List.of(), List.of(), List.of(), null, null, null, null,
                List.of(), null);

        String description = mapper.map(sparse, CONTACT, CONVERSATION).problemStatement();

        assertThat(description).contains("Problem:").contains("Who it is for:");
        assertThat(description)
                .doesNotContain("How they do it today")
                .doesNotContain("Timeline")
                .doesNotContain("Platforms")
                .doesNotContain("null");
    }

    @Test
    void carriesTheConversationSoSomebodyCanFindItLater() {
        ProjectEnquirySubmission submission = mapper.map(brief(), CONTACT, CONVERSATION);

        assertThat(submission.source()).isEqualTo("AURA");
        assertThat(submission.sourceContext()).isEqualTo(CONVERSATION.toString());
    }

    @Test
    void leavesTheExistingSystemContextAbsentWhenThereIsNone() {
        ProjectBriefFields sparse = new ProjectBriefFields("A problem.", "Someone", null, null,
                List.of(), List.of(), List.of(), null, null, null, null, List.of(), null);

        assertThat(mapper.map(sparse, CONTACT, CONVERSATION).existingSystemContext()).isNull();
    }

    @Test
    void staysInsideTheWorkflowsOwnTextLimit() {
        String long_ = "A very long sentence about the project. ".repeat(300);
        ProjectBriefFields huge = new ProjectBriefFields(long_, long_, long_, long_,
                List.of(), List.of(), List.of(), null, null, null, null, List.of(), null);

        assertThat(mapper.map(huge, CONTACT, CONVERSATION).problemStatement().length())
                .isLessThanOrEqualTo(3000);
    }
}
