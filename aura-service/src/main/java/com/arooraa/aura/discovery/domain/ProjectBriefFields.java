package com.arooraa.aura.discovery.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * What Aura understood about a visitor's project. Every field is nullable or empty on purpose:
 * absence is a first-class answer here, and the one thing this record must never do is imply we
 * know something a visitor did not tell us.
 *
 * <p>There is deliberately no budget field. Asking a stranger what they can spend before
 * understanding what they want is the behaviour that makes a conversation feel like a
 * qualification form, and the Start Project workflow has its own "still defining" value for
 * exactly this case.
 *
 * @param unknowns what Aura noticed it does not know. Written down rather than inferred, so a
 *        summary can say "I don't know yet" instead of quietly leaving a gap
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProjectBriefFields(
        String problemStatement,
        String targetUsers,
        String currentSituation,
        String desiredOutcome,
        List<String> proposedCapabilities,
        List<String> platforms,
        List<String> integrations,
        String aiAutomationNeeds,
        String existingSystems,
        String constraints,
        String timeline,
        List<String> unknowns,
        String conversationSummary) {

    public static ProjectBriefFields empty() {
        return new ProjectBriefFields(null, null, null, null, List.of(), List.of(), List.of(),
                null, null, null, null, List.of(), null);
    }

    /** Normalises nulls in the collection fields so no caller has to. */
    public ProjectBriefFields {
        proposedCapabilities = copy(proposedCapabilities);
        platforms = copy(platforms);
        integrations = copy(integrations);
        unknowns = copy(unknowns);
    }

    private static List<String> copy(List<String> values) {
        return values == null ? List.of() : List.copyOf(values);
    }

    /**
     * How much of the picture Aura actually has, 0 to 1, counted over the fields that describe the
     * project itself. Deliberately not a confidence score: it says how many things the visitor has
     * told us, and claims nothing about how well any of them was understood.
     */
    public double completeness() {
        int known = 0;
        for (Object value : new Object[]{problemStatement, targetUsers, currentSituation, desiredOutcome,
                aiAutomationNeeds, existingSystems, constraints, timeline}) {
            if (value != null) known++;
        }
        for (List<String> value : List.of(proposedCapabilities, platforms, integrations)) {
            if (!value.isEmpty()) known++;
        }
        return known / 11.0;
    }

    /** True once there is enough to be worth showing someone — a problem, and something beyond it. */
    public boolean worthSummarising() {
        return problemStatement != null && completeness() >= 2 / 11.0;
    }
}
