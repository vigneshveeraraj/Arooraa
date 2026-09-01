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
 *
 * <p>{@link ConversationMode#SOCIAL} skips it for a third reason again: there is no question in a
 * hello. Searching anyway does not find nothing — it finds the nearest vectors in the corpus and
 * dresses coincidence up as evidence, which is exactly what "Hi Aura" did before this mode existed.
 *
 * <p>{@link ConversationMode#PROJECT_DISCOVERY} is the one mode where the answer depends on the
 * turn rather than the mode (A3.3). "I have a software product idea" is someone starting to
 * describe their project — nothing to look up, and searching produced exactly the same
 * nearest-vector noise a greeting did. "I have a product idea, what services can AROORAA provide
 * to build it?" contains a real question about us and should be grounded. So the decision reads
 * {@link ScopeDecision#mentionsOrganisationSubject()} rather than turning retrieval off for the
 * whole mode.
 */
@Component
public class RetrievalPlanner {

    private static final Set<ConversationMode> RETRIEVING_MODES = EnumSet.of(
            ConversationMode.GROUNDED_QA,
            ConversationMode.PRODUCT_DISCOVERY,
            ConversationMode.NAVIGATION,
            ConversationMode.CAREERS);

    public RetrievalDecision decide(ScopeDecision scope) {
        ConversationMode mode = scope.mode();
        if (RETRIEVING_MODES.contains(mode)) {
            return new RetrievalDecision(true, "MODE_REQUIRES_APPROVED_EVIDENCE");
        }
        return switch (mode) {
            case INTERNAL_BOUNDARY -> new RetrievalDecision(false, "CONFIDENTIALITY_BOUNDARY");
            case GENERAL_CONSULTING -> new RetrievalDecision(false, "GENERAL_KNOWLEDGE_SUFFICES");
            case OUT_OF_SCOPE -> new RetrievalDecision(false, "OUT_OF_SCOPE");
            case SOCIAL -> new RetrievalDecision(false, "SOCIAL_SMALL_TALK");
            case PROJECT_DISCOVERY -> scope.mentionsOrganisationSubject()
                    ? new RetrievalDecision(true, "DISCOVERY_ASKS_ABOUT_US")
                    : new RetrievalDecision(false, "DISCOVERY_OPENER_HAS_NOTHING_TO_LOOK_UP");
            default -> new RetrievalDecision(false, "NOT_APPLICABLE");
        };
    }
}
