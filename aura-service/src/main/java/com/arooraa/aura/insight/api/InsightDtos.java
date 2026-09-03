package com.arooraa.aura.insight.api;

import com.arooraa.aura.insight.InsightQueryService;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * The insight subsystem's wire contract — one shape a visitor may send, and one an operator may
 * read. As everywhere else in this service, safety is by omission: neither shape has a field for a
 * prompt, an answer, a provider, a model, a score or anything identifying a person.
 */
public final class InsightDtos {

    private InsightDtos() {
    }

    /**
     * @param rating constrained to the two values rather than bound straight to the enum, so a
     *        third one is a 400 with a sentence rather than a deserialization failure
     * @param reason optional, and bounded again in the service — the edge should not be the only
     *        thing standing between a paste and a column
     */
    public record FeedbackRequest(
            @NotBlank @Pattern(regexp = "HELPFUL|NOT_HELPFUL",
                    message = "Tell me whether that was helpful or not.") String rating,
            @Size(max = 300) String reason) {
    }

    /**
     * What an operator sees. Note what is absent: no conversation ids, no message text, no per-event
     * rows — this is counts and open questions, which is what the numbers are for.
     */
    public record InsightsResponse(
            Instant since,
            long conversations,
            List<Turn> turns,
            List<Failure> failures,
            Voice voice,
            Handoff handoff,
            Feedback feedback,
            long openGaps,
            List<Gap> topGaps) {

        static InsightsResponse from(InsightQueryService.Insights insights) {
            return new InsightsResponse(
                    insights.since(),
                    insights.conversations(),
                    insights.turns().stream()
                            .map(turn -> new Turn(turn.mode(), turn.evidenceLevel(), turn.count(),
                                    turn.averageLatencyMs()))
                            .toList(),
                    insights.failures().stream()
                            .map(failure -> new Failure(failure.event(), failure.detail(), failure.count()))
                            .toList(),
                    new Voice(insights.voice().transcribed(), insights.voice().transcriptionFailures(),
                            insights.voice().spoken(), insights.voice().synthesisFailures()),
                    new Handoff(insights.handoff().discoveryStarted(), insights.handoff().briefSummarised(),
                            insights.handoff().offered(), insights.handoff().refused(),
                            insights.handoff().created()),
                    new Feedback(insights.feedback().helpful(), insights.feedback().notHelpful()),
                    insights.openGaps(),
                    insights.topGaps().stream()
                            .map(gap -> new Gap(gap.getQuestion(), gap.getAssistantProfile(),
                                    gap.getPageSubject(), gap.getEvidenceLevel(), gap.getOccurrences(),
                                    gap.getFirstSeenAt(), gap.getLastSeenAt(), gap.getStatus().name()))
                            .toList());
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Turn(String mode, String evidenceLevel, long count, Long averageLatencyMs) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Failure(String event, String detail, long count) {
    }

    public record Voice(long transcribed, long transcriptionFailures, long spoken, long synthesisFailures) {
    }

    public record Handoff(long discoveryStarted, long briefSummarised, long offered, long refused,
                           long created) {
    }

    public record Feedback(long helpful, long notHelpful) {
    }

    /**
     * A gap, without its database identity. The question and its count are what somebody writing
     * knowledge needs; the row's id would only be useful for mutating it, which this API does not
     * offer.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Gap(String question, String assistantProfile, String pageSubject, String evidenceLevel,
                       int occurrences, Instant firstSeenAt, Instant lastSeenAt, String status) {
    }

    public record ErrorResponse(String code, String message) {
    }
}
