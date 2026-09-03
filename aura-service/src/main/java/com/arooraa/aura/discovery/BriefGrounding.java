package com.arooraa.aura.discovery;

import com.arooraa.aura.discovery.domain.ProjectBriefFields;
import com.arooraa.aura.retrieval.QueryTermCoverage;

import java.util.List;

/**
 * The deterministic half of "no fabricated details".
 *
 * <p>An extraction model is given only the visitor's own words and told to invent nothing, and it
 * mostly obeys. Mostly is not a guarantee, and the thing being built here ends up in an enquiry a
 * person at AROORAA will read as a description of somebody's business — so every field it produces
 * is checked, in code, against what the visitor actually said, and anything that cannot be found
 * there is dropped rather than corrected.
 *
 * <p>The check reuses {@link QueryTermCoverage}, which already answers exactly this question for
 * the evidence gate: what fraction of a piece of text's meaningful words appear in another piece
 * of text. Here the candidate is the extracted value and the corpus is the visitor's transcript.
 * Function words are ignored, matching is prefix-based, and accents are stripped, so a
 * legitimate rephrasing survives while an invention does not:
 *
 * <ul>
 *   <li>the visitor says "it helps parents manage school schedules"; the model writes "Parents
 *       struggle to manage school schedules for their children" — four of its six meaningful words
 *       are in the transcript, so it is kept;</li>
 *   <li>the model adds "must integrate with PowerSchool and Blackbaud", which the visitor never
 *       mentioned — almost none of its words are there, and it is dropped.</li>
 * </ul>
 *
 * <p>Coverage has one blind spot, and it is not a small one: it cannot tell an assertion from its
 * negation. Every word of "a mobile app" is present in "we do not need a mobile app", so a model
 * that lists it under platforms produces a value this filter is perfectly happy with and a person
 * at AROORAA would read as a requirement. {@link NegationScope} closes that, for the fields where
 * a negated mention is the failure — the ones asserting the project will contain something — and
 * deliberately not for the fields where a negative sentence is usually the truest one there.
 *
 * <p>Dropping rather than flagging is the right failure: an absent field is honest, and the brief
 * is designed so that absence is a first-class answer.
 */
public final class BriefGrounding {

    /**
     * How much of an extracted value has to be traceable to the visitor's words.
     *
     * <p>Placed to accept rephrasing and reject invention, with the two errors weighed as
     * unequal: dropping a real detail costs a follow-up question, while keeping an invented one
     * puts a claim about somebody's business into an enquiry nobody made.
     */
    private static final double MIN_COVERAGE = 0.6;

    private BriefGrounding() {
    }

    /**
     * @param visitorTranscript everything the visitor said, and nothing Aura said — Aura's own
     *        suggestions must not be able to become the visitor's requirements
     */
    public static ProjectBriefFields filter(ProjectBriefFields fields, String visitorTranscript) {
        return new ProjectBriefFields(
                keep(fields.problemStatement(), visitorTranscript),
                keep(fields.targetUsers(), visitorTranscript),
                keep(fields.currentSituation(), visitorTranscript),
                keep(fields.desiredOutcome(), visitorTranscript),
                // Guarded against negation as well as invention: these five say the project will
                // contain something, so a value the visitor only ever ruled out is the opposite
                // of what they asked for.
                keepAllWanted(fields.proposedCapabilities(), visitorTranscript),
                keepAllWanted(fields.platforms(), visitorTranscript),
                keepAllWanted(fields.integrations(), visitorTranscript),
                keepWanted(fields.aiAutomationNeeds(), visitorTranscript),
                keepWanted(fields.existingSystems(), visitorTranscript),
                // Not guarded. "There is no system today" is a true constraint, and a problem
                // statement is very often a negative sentence — checking these for negation would
                // delete the truest lines in the brief.
                keep(fields.constraints(), visitorTranscript),
                keep(fields.timeline(), visitorTranscript),
                // Not filtered: `unknowns` is a list of what the visitor did *not* say, so testing
                // it against what they did say would reject exactly the entries that are correct.
                fields.unknowns(),
                keep(fields.conversationSummary(), visitorTranscript));
    }

    private static String keep(String value, String transcript) {
        if (value == null || value.isBlank()) return null;
        return QueryTermCoverage.of(value, transcript) >= MIN_COVERAGE ? value.strip() : null;
    }

    /** Grounded, and not something the visitor only ever mentioned in order to rule it out. */
    private static String keepWanted(String value, String transcript) {
        String kept = keep(value, transcript);
        return kept != null && NegationScope.rejects(kept, transcript) ? null : kept;
    }

    private static List<String> keepAllWanted(List<String> values, String transcript) {
        return values.stream().map(value -> keepWanted(value, transcript))
                .filter(value -> value != null).toList();
    }
}
