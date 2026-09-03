package com.arooraa.aura.insight;

import com.arooraa.aura.insight.config.InsightProperties;
import com.arooraa.aura.insight.domain.AuraEvent;
import com.arooraa.aura.insight.domain.AuraEventType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.UnaryOperator;

/**
 * Everything that writes to the analytics tables goes through here, and it has one absolute rule:
 * <b>it never lets analytics break a conversation</b>.
 *
 * <p>Every method swallows its own failures. A visitor asked Aura a question; if the row that was
 * going to say how well that went cannot be written, the right outcome is a slightly incomplete
 * chart and an answered question — never a failed turn. That is not defensiveness for its own
 * sake: this service is called from inside the conversation transaction, and an exception here
 * would roll back the turn it was measuring.
 *
 * <p>The second rule is about what may be passed in. Every parameter is an enum name, a bounded
 * code from our own vocabulary, a number, or a conversation id. Nothing a visitor typed and
 * nothing a model produced reaches this class, which is why {@code aura_events} has no free-text
 * column for it to reach.
 */
@Service
public class AuraInsightRecorder {

    private static final Logger log = LoggerFactory.getLogger(AuraInsightRecorder.class);

    private final AuraEventRepository events;
    private final InsightProperties properties;

    public AuraInsightRecorder(AuraEventRepository events, InsightProperties properties) {
        this.events = events;
        this.properties = properties;
    }

    /** One answered turn — the event most of the numbers are derived from. */
    public void messageAnswered(UUID conversationId, String mode, String evidenceLevel, String language,
                                 String channel, String pageSubject, long latencyMs) {
        record(AuraEventType.MESSAGE_ANSWERED, conversationId, event -> event
                .withRouting(mode, evidenceLevel, language, channel)
                .withPageSubject(pageSubject)
                .withLatency(latencyMs));
    }

    public void guardrailIntervened(UUID conversationId, String violationCode) {
        record(AuraEventType.GUARDRAIL_INTERVENED, conversationId, event -> event.withDetail(violationCode));
    }

    public void providerFailed(UUID conversationId, String failureCode) {
        record(AuraEventType.PROVIDER_FAILED, conversationId, event -> event.withDetail(failureCode));
    }

    public void voice(AuraEventType type, UUID conversationId, String detail) {
        record(type, conversationId, event -> event.withDetail(detail));
    }

    public void discovery(AuraEventType type, UUID conversationId) {
        record(type, conversationId, UnaryOperator.identity());
    }

    public void conversationStarted(UUID conversationId, String channel) {
        record(AuraEventType.CONVERSATION_STARTED, conversationId,
                event -> event.withRouting(null, null, null, channel));
    }

    public void knowledgeGapRecorded(UUID conversationId, String evidenceLevel, String pageSubject) {
        record(AuraEventType.KNOWLEDGE_GAP_RECORDED, conversationId, event -> event
                .withRouting(null, evidenceLevel, null, null)
                .withPageSubject(pageSubject));
    }

    public void feedbackGiven(UUID conversationId, String rating) {
        record(AuraEventType.FEEDBACK_GIVEN, conversationId, event -> event.withDetail(rating));
    }

    private void record(AuraEventType type, UUID conversationId, UnaryOperator<AuraEvent> decorate) {
        if (!properties.enabled()) {
            return;
        }
        try {
            events.save(decorate.apply(AuraEvent.of(type, conversationId)));
        } catch (RuntimeException e) {
            // Deliberately swallowed, and deliberately logged without the exception: a stack trace
            // here would be noise in the log of a turn that went perfectly well from the visitor's
            // side. If this starts failing it will fail constantly, and one line per turn is enough
            // to notice that.
            log.warn("Could not record an Aura event ({}) — the conversation is unaffected.", type);
        }
    }
}
