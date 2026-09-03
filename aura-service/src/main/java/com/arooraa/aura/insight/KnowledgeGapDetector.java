package com.arooraa.aura.insight;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.pipeline.TextSignals;
import com.arooraa.aura.insight.config.InsightProperties;
import com.arooraa.aura.insight.domain.AuraKnowledgeGap;
import com.arooraa.aura.retrieval.EvidenceLevel;
import com.arooraa.aura.support.Sha256;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Notices when somebody asked us about AROORAA and we could not answer them.
 *
 * <h2>What counts as a gap</h2>
 * Exactly one situation: a question the pipeline routed to {@link ConversationMode#GROUNDED_QA} —
 * which is what it does when a message is about AROORAA and should be answered from approved
 * knowledge — that came back without strong enough evidence to answer from.
 *
 * <p>Everything else is deliberately not a gap, and the exclusions matter as much as the rule:
 *
 * <ul>
 *   <li>a greeting is not a gap. There is no document that would have helped;</li>
 *   <li>a question about the weather is not a gap. It is out of scope, and writing knowledge about
 *       it would be writing knowledge about the wrong thing;</li>
 *   <li>a confidentiality boundary is <em>emphatically</em> not a gap. Someone asking what database
 *       MESA uses got the right answer, and recording it as something to fill would turn this
 *       table into a list of suggestions to publish exactly what we have decided not to;</li>
 *   <li>a project discussion is not a gap. There is no fact we were missing.</li>
 * </ul>
 *
 * <p>Nothing recorded here becomes knowledge. There is no path from the gap table into ingestion;
 * a gap is a note for a person to act on, and deciding what Aura may say stays a human act.
 */
@Service
public class KnowledgeGapDetector {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeGapDetector.class);

    /**
     * How much of a question is kept. Long enough to be recognisable, short enough that a pasted
     * essay does not become a row nobody can read — and it is the normalised form, so what is kept
     * is the words rather than the formatting.
     */
    private static final int MAX_QUESTION_CHARS = 300;

    private final AuraKnowledgeGapRepository gaps;
    private final AuraInsightRecorder recorder;
    private final InsightProperties properties;

    public KnowledgeGapDetector(AuraKnowledgeGapRepository gaps, AuraInsightRecorder recorder,
                                 InsightProperties properties) {
        this.gaps = gaps;
        this.recorder = recorder;
        this.properties = properties;
    }

    /**
     * @param pageSubject the canonical subject from the route registry, or null — never a raw path
     * @return the gap, when one was recorded. Empty is the normal case
     */
    public Optional<AuraKnowledgeGap> observe(UUID conversationId, String message, ConversationMode mode,
                                               EvidenceLevel evidenceLevel, String assistantProfile,
                                               String pageSubject) {
        if (!properties.enabled() || !isGap(mode, evidenceLevel)) {
            return Optional.empty();
        }

        String question = normalise(message);
        if (question.isBlank()) {
            return Optional.empty();
        }
        String fingerprint = Sha256.hex(assistantProfile + "|" + question);

        try {
            AuraKnowledgeGap gap = gaps.findByFingerprint(fingerprint)
                    .map(existing -> {
                        existing.seenAgain(evidenceLevel.name());
                        return existing;
                    })
                    .orElseGet(() -> gaps.save(AuraKnowledgeGap.first(
                            fingerprint, question, assistantProfile, pageSubject, evidenceLevel.name())));

            recorder.knowledgeGapRecorded(conversationId, evidenceLevel.name(), pageSubject);
            return Optional.of(gap);
        } catch (RuntimeException e) {
            // Same rule as the recorder: a missing row is a slightly incomplete list, and an
            // exception here would roll back a turn the visitor was answered on.
            log.warn("Could not record a knowledge gap — the conversation is unaffected.");
            return Optional.empty();
        }
    }

    private boolean isGap(ConversationMode mode, EvidenceLevel evidenceLevel) {
        return mode == ConversationMode.GROUNDED_QA
                && (evidenceLevel == EvidenceLevel.NO_EVIDENCE || evidenceLevel == EvidenceLevel.WEAK_EVIDENCE);
    }

    /**
     * The normalised question — lowercased, accent-stripped, punctuation-flattened, single-spaced,
     * using the same {@link TextSignals#normalize} the classifiers use. That is what makes "What is
     * MESA?" and "what is mesa" one row rather than two, which is the entire point of aggregating.
     */
    private String normalise(String message) {
        String normalised = TextSignals.normalize(message).strip();
        return normalised.length() <= MAX_QUESTION_CHARS
                ? normalised
                : normalised.substring(0, MAX_QUESTION_CHARS);
    }
}
