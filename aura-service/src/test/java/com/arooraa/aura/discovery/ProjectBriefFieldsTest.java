package com.arooraa.aura.discovery;

import com.arooraa.aura.discovery.domain.ProjectBriefFields;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectBriefFieldsTest {

    private static ProjectBriefFields with(String problem, String users, List<String> platforms) {
        return new ProjectBriefFields(problem, users, null, null, List.of(), platforms, List.of(),
                null, null, null, null, List.of(), null);
    }

    @Test
    void knowsNothingUntilItIsTold() {
        ProjectBriefFields empty = ProjectBriefFields.empty();

        assertThat(empty.completeness()).isZero();
        assertThat(empty.worthSummarising()).isFalse();
        // Absence is a first-class answer here, so the collections are empty rather than null.
        assertThat(empty.proposedCapabilities()).isEmpty();
        assertThat(empty.unknowns()).isEmpty();
    }

    @Test
    void isNotWorthSummarisingWithoutAProblemToSolve() {
        // Everything else is detail about a project; without the problem there is no project.
        assertThat(with(null, "Parents", List.of("phones")).worthSummarising()).isFalse();
    }

    @Test
    void isNotWorthSummarisingFromAProblemAlone() {
        assertThat(with("Parents miss school notices", null, List.of()).worthSummarising()).isFalse();
    }

    @Test
    void isWorthSummarisingOnceThereIsAProblemAndSomethingBeyondIt() {
        assertThat(with("Parents miss school notices", "Parents and the school office", List.of())
                .worthSummarising()).isTrue();
    }

    @Test
    void countsWhatItKnowsWithoutClaimingConfidenceAboutIt() {
        assertThat(with("A problem", "Some users", List.of("phones")).completeness())
                .isGreaterThan(0.0)
                .isLessThan(1.0);
    }

    @Test
    void toleratesNullCollectionsFromDeserialization() {
        ProjectBriefFields fields = new ProjectBriefFields("p", null, null, null,
                null, null, null, null, null, null, null, null, null);

        assertThat(fields.proposedCapabilities()).isEmpty();
        assertThat(fields.platforms()).isEmpty();
        assertThat(fields.integrations()).isEmpty();
        assertThat(fields.unknowns()).isEmpty();
    }
}
