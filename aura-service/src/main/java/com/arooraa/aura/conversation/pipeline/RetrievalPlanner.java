package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

/**
 * Pipeline stage 6. Decides whether this turn should search the knowledge base at all.
 *
 * <p>This is a safety control as much as an efficiency one. For
 * {@link ConversationMode#INTERNAL_BOUNDARY} the answer is always no: skipping retrieval means the
 * prompt for a confidentiality probe contains no corpus text whatsoever, so there is nothing for a
 * jailbreak to extract even in the worst case. (The corpus holds no internal facts either — this
 * is the second, independent layer.)
 *
 * <p>{@link ConversationMode#GENERAL_CONSULTING} and {@link ConversationMode#OUT_OF_SCOPE} skip it
 * for a different reason: neither should produce an AROORAA-specific claim, so retrieved AROORAA
 * evidence would only tempt the model into attaching the company's name to general advice.
 */
@Component
public class RetrievalPlanner {

    private static final Set<ConversationMode> RETRIEVING_MODES = EnumSet.of(
            ConversationMode.GROUNDED_QA,
            ConversationMode.PRODUCT_DISCOVERY,
            ConversationMode.PROJECT_DISCOVERY,
            ConversationMode.NAVIGATION,
            ConversationMode.CAREERS);

    public RetrievalDecision decide(ConversationMode mode) {
        if (RETRIEVING_MODES.contains(mode)) {
            return new RetrievalDecision(true, "MODE_REQUIRES_APPROVED_EVIDENCE");
        }
        return switch (mode) {
            case INTERNAL_BOUNDARY -> new RetrievalDecision(false, "CONFIDENTIALITY_BOUNDARY");
            case GENERAL_CONSULTING -> new RetrievalDecision(false, "GENERAL_KNOWLEDGE_SUFFICES");
            case OUT_OF_SCOPE -> new RetrievalDecision(false, "OUT_OF_SCOPE");
            default -> new RetrievalDecision(false, "NOT_APPLICABLE");
        };
    }
}
