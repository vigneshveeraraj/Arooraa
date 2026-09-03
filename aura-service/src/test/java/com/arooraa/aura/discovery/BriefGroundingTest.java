package com.arooraa.aura.discovery;

import com.arooraa.aura.discovery.domain.ProjectBriefFields;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The deterministic half of "no fabricated details". Every case here is a thing a real extraction
 * model does: rephrase what it was told, and occasionally supply a detail nobody mentioned.
 */
class BriefGroundingTest {

    private static final String TRANSCRIPT = """
            1. "I have an app idea. It helps parents manage school schedules."
            2. "Right now they use WhatsApp groups and a paper diary, and things get missed."
            3. "We would want parents on their phones, and the school office on a laptop."
            """;

    private static ProjectBriefFields onlyProblem(String problem) {
        return new ProjectBriefFields(problem, null, null, null, List.of(), List.of(), List.of(),
                null, null, null, null, List.of(), null);
    }

    @Test
    void keepsARephrasingOfWhatTheVisitorActuallySaid() {
        ProjectBriefFields filtered = BriefGrounding.filter(
                onlyProblem("Parents struggle to manage school schedules for their children."), TRANSCRIPT);

        assertThat(filtered.problemStatement())
                .isEqualTo("Parents struggle to manage school schedules for their children.");
    }

    @Test
    void dropsADetailNobodyMentioned() {
        // The exact failure this class exists for: a plausible integration the visitor never named,
        // which would arrive in an enquiry looking like something they told us.
        ProjectBriefFields filtered = BriefGrounding.filter(
                onlyProblem("The system must integrate with PowerSchool and Blackbaud."), TRANSCRIPT);

        assertThat(filtered.problemStatement()).isNull();
    }

    @Test
    void dropsInventedListEntriesButKeepsTheOnesTheVisitorGave() {
        ProjectBriefFields fields = new ProjectBriefFields(null, null, null, null,
                List.of(), List.of("phones", "laptop", "smart television set top boxes"), List.of(),
                null, null, null, null, List.of(), null);

        ProjectBriefFields filtered = BriefGrounding.filter(fields, TRANSCRIPT);

        assertThat(filtered.platforms()).containsExactly("phones", "laptop");
    }

    @Test
    void keepsWhatAuraNoticedItDoesNotKnow() {
        // "unknowns" is a list of things the visitor did NOT say, so testing it against what they
        // did say would reject exactly the entries that are correct.
        ProjectBriefFields fields = new ProjectBriefFields(null, null, null, null,
                List.of(), List.of(), List.of(), null, null, null, null,
                List.of("How many schools", "Whether payments are involved"), null);

        ProjectBriefFields filtered = BriefGrounding.filter(fields, TRANSCRIPT);

        assertThat(filtered.unknowns()).containsExactly("How many schools", "Whether payments are involved");
    }

    @Test
    void keepsASummaryBuiltFromTheirWords() {
        ProjectBriefFields fields = new ProjectBriefFields(null, null, null, null,
                List.of(), List.of(), List.of(), null, null, null, null, List.of(),
                "A parent app for school schedules, replacing WhatsApp groups and a paper diary.");

        assertThat(BriefGrounding.filter(fields, TRANSCRIPT).conversationSummary()).isNotNull();
    }

    @Test
    void dropsASummaryAboutADifferentProject() {
        ProjectBriefFields fields = new ProjectBriefFields(null, null, null, null,
                List.of(), List.of(), List.of(), null, null, null, null, List.of(),
                "A logistics platform for freight forwarders with customs clearance workflows.");

        assertThat(BriefGrounding.filter(fields, TRANSCRIPT).conversationSummary()).isNull();
    }

    // --- what the visitor ruled out ------------------------------------------------------------

    private static final String RULED_OUT = """
            1. "I have an app idea. It helps parents manage school schedules."
            2. "We do not need a mobile app — everything should be on the web."
            3. "Parents on their phones, and the school office on a laptop."
            """;

    @Test
    void dropsAPlatformTheVisitorSaidTheyDidNotNeed() {
        // Coverage cannot see this on its own: every word of "mobile app" really is in the
        // transcript. It would arrive in an enquiry as a requirement, and it is the opposite of one.
        ProjectBriefFields fields = new ProjectBriefFields(null, null, null, null,
                List.of(), List.of("mobile app", "phones", "laptop"), List.of(),
                null, null, null, null, List.of(), null);

        assertThat(BriefGrounding.filter(fields, RULED_OUT).platforms())
                .containsExactly("phones", "laptop");
    }

    @Test
    void dropsACapabilityAndAnIntegrationTheVisitorRuledOut() {
        String said = """
                1. "It helps parents manage school schedules."
                2. "We do not want payments in it, and no integration with the school website."
                """;
        ProjectBriefFields fields = new ProjectBriefFields(null, null, null, null,
                List.of("payments"), List.of(), List.of("school website"),
                null, null, null, null, List.of(), null);

        ProjectBriefFields filtered = BriefGrounding.filter(fields, said);

        assertThat(filtered.proposedCapabilities()).isEmpty();
        assertThat(filtered.integrations()).isEmpty();
    }

    @Test
    void keepsTheSameWordsAsAConstraintThatItDropsAsAPlatform() {
        // The other half of the rule, and the reason this is not applied to every field. The
        // exclusion is a true thing the visitor said and the brief should carry it — as the
        // exclusion it is, not as a thing to build.
        ProjectBriefFields fields = new ProjectBriefFields(null, null, null, null,
                List.of(), List.of("mobile app"), List.of(), null, null,
                "No mobile app", null, List.of(), null);

        ProjectBriefFields filtered = BriefGrounding.filter(fields, RULED_OUT);

        assertThat(filtered.platforms()).isEmpty();
        assertThat(filtered.constraints()).isEqualTo("No mobile app");
    }

    @Test
    void keepsAProblemStatementThatHappensToBeANegativeSentence() {
        // Problems are very often stated as absences. Running the negation guard over this field
        // would delete the truest line in the brief.
        String said = """
                1. "Parents are not told when a schedule changes, and things get missed."
                """;
        assertThat(BriefGrounding.filter(
                onlyProblem("Parents are not told when a schedule changes"), said).problemStatement())
                .isEqualTo("Parents are not told when a schedule changes");
    }

    @Test
    void treatsBlankAsAbsent() {
        assertThat(BriefGrounding.filter(onlyProblem("   "), TRANSCRIPT).problemStatement()).isNull();
        assertThat(BriefGrounding.filter(onlyProblem(null), TRANSCRIPT).problemStatement()).isNull();
    }

    @Test
    void keepsNothingWhenTheVisitorSaidNothing() {
        ProjectBriefFields filtered = BriefGrounding.filter(
                onlyProblem("Parents struggle to manage school schedules."), "");

        assertThat(filtered.problemStatement()).isNull();
    }
}
