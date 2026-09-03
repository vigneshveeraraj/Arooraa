package com.arooraa.aura.insight;

import com.arooraa.aura.insight.config.InsightProperties;
import com.arooraa.aura.insight.domain.AuraEventType;
import com.arooraa.aura.insight.domain.AuraKnowledgeGap;
import com.arooraa.aura.insight.domain.FeedbackRating;
import com.arooraa.aura.insight.domain.GapStatus;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * The read side: the smallest set of numbers that would actually change what somebody does.
 *
 * <p>Deliberately not a BI product. There is no time-series, no segmentation, no cohort and no
 * drill-down, because the questions this is meant to answer are few and blunt: what are people
 * asking that we cannot answer, is anything failing, is voice being used, and does the project
 * funnel reach the end. Anything more is a reporting tool nobody asked for, built on data we were
 * careful to keep small.
 */
@Service
public class InsightQueryService {

    /** The window everything is measured over. One number, so two figures are always comparable. */
    private static final Duration WINDOW = Duration.ofDays(30);

    private final AuraEventRepository events;
    private final AuraKnowledgeGapRepository gaps;
    private final AuraFeedbackRepository feedback;
    private final InsightProperties properties;

    public InsightQueryService(AuraEventRepository events, AuraKnowledgeGapRepository gaps,
                                AuraFeedbackRepository feedback, InsightProperties properties) {
        this.events = events;
        this.gaps = gaps;
        this.feedback = feedback;
        this.properties = properties;
    }

    public record TurnBreakdown(String mode, String evidenceLevel, long count, Long averageLatencyMs) {
    }

    public record FailureCount(String event, String detail, long count) {
    }

    public record VoiceUsage(long transcribed, long transcriptionFailures, long spoken,
                              long synthesisFailures) {
    }

    /** The project funnel, in the order it happens, so a drop-off is visible by reading down. */
    public record HandoffFunnel(long discoveryStarted, long briefSummarised, long offered, long refused,
                                 long created) {
    }

    public record FeedbackCounts(long helpful, long notHelpful) {
    }

    public record Insights(Instant since, long conversations, List<TurnBreakdown> turns,
                            List<FailureCount> failures, VoiceUsage voice, HandoffFunnel handoff,
                            FeedbackCounts feedback, long openGaps, List<AuraKnowledgeGap> topGaps) {
    }

    @Transactional(readOnly = true)
    public Insights snapshot() {
        Instant since = Instant.now().minus(WINDOW);

        return new Insights(
                since,
                events.countByEventTypeAndOccurredAtAfter(AuraEventType.CONVERSATION_STARTED, since),
                events.answeredTurnBreakdown(since).stream()
                        .map(row -> new TurnBreakdown(
                                (String) row[0],
                                (String) row[1],
                                (Long) row[2],
                                row[3] == null ? null : ((Number) row[3]).longValue()))
                        .toList(),
                events.failureBreakdown(since).stream()
                        .map(row -> new FailureCount(
                                String.valueOf(row[0]), (String) row[1], (Long) row[2]))
                        .toList(),
                new VoiceUsage(
                        count(AuraEventType.VOICE_TRANSCRIBED, since),
                        count(AuraEventType.VOICE_TRANSCRIPTION_FAILED, since),
                        count(AuraEventType.VOICE_SPOKEN, since),
                        count(AuraEventType.VOICE_SYNTHESIS_FAILED, since)),
                new HandoffFunnel(
                        count(AuraEventType.PROJECT_DISCOVERY_STARTED, since),
                        count(AuraEventType.PROJECT_BRIEF_SUMMARISED, since),
                        count(AuraEventType.PROJECT_HANDOFF_OFFERED, since),
                        count(AuraEventType.PROJECT_HANDOFF_REFUSED, since),
                        count(AuraEventType.PROJECT_HANDOFF_CREATED, since)),
                new FeedbackCounts(
                        feedback.countByRating(FeedbackRating.HELPFUL),
                        feedback.countByRating(FeedbackRating.NOT_HELPFUL)),
                gaps.countByStatus(GapStatus.OPEN),
                // Most-asked first: the order somebody filling gaps would want to work in.
                gaps.findByStatusOrderByOccurrencesDesc(
                        GapStatus.OPEN, Limit.of(properties.maxGapsReturned())));
    }

    private long count(AuraEventType type, Instant since) {
        return events.countByEventTypeAndOccurredAtAfter(type, since);
    }
}
