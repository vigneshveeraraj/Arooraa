package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.retrieval.EvidenceLevel;
import org.springframework.stereotype.Component;

/**
 * Pipeline stage 9. Turns the mode and the evidence gate's verdict into a single set of
 * permissions for this turn.
 *
 * <p>This is where A2.2's calibrated evidence levels finally do the job they were built for. The
 * mapping is the one frozen in {@code 95-aura-unknown-answer-policy.md}: STRONG may ground a
 * claim, WEAK must qualify or ask, NO_EVIDENCE may not make an AROORAA-specific claim at all.
 * Nothing here re-interprets the level or second-guesses the gate.
 */
@Component
public class GenerationPolicy {

    public GenerationDecision decide(ConversationMode mode, EvidenceLevel evidenceLevel, ConversationTone tone) {
        boolean humourAllowed = !tone.suppressesHumour() && mode != ConversationMode.INTERNAL_BOUNDARY;

        return switch (mode) {
            // A boundary turn is answered warmly and redirected, never grounded — and never with
            // sources, since citing documents while declining would itself hint at what exists.
            case INTERNAL_BOUNDARY -> new GenerationDecision(false, false, true, false, false);

            // General technology talk about the visitor's own system: full use of general
            // knowledge, zero AROORAA claims.
            case GENERAL_CONSULTING, OUT_OF_SCOPE -> new GenerationDecision(false, false, true, humourAllowed, false);

            default -> switch (evidenceLevel) {
                case STRONG_EVIDENCE -> new GenerationDecision(true, false, false, humourAllowed, true);
                case WEAK_EVIDENCE -> new GenerationDecision(true, true, false, humourAllowed, true);
                case NO_EVIDENCE -> new GenerationDecision(false, false, true, humourAllowed, false);
            };
        };
    }
}
