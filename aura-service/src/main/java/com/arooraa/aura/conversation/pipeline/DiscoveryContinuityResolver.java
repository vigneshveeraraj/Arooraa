package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Pipeline stage 3.6 (A6). Keeps a project conversation being a project conversation.
 *
 * <p>{@link ScopeClassifier} reads one message at a time, which is right for almost everything and
 * wrong for exactly this. A discovery conversation looks like discovery on the turn that contains
 * the idea — "I have an app idea" — and then stops looking like anything in particular:
 *
 * <pre>
 *   "I have an app idea. It helps parents manage school schedules."  → PROJECT_DISCOVERY
 *   "Right now they use WhatsApp groups and a paper diary."          → GENERAL_CONSULTING
 *   "Parents on their phones, the school office on a laptop."        → GENERAL_CONSULTING
 * </pre>
 *
 * <p>Those last two are answers to Aura's own questions, and they are the substance of the
 * discussion. Classified as the catch-all, they lose the discovery guidance entirely — so from the
 * second turn onward Aura stops asking one useful question at a time and starts consulting
 * generally, which is precisely the "rigid questionnaire or nothing" failure A6 exists to avoid.
 *
 * <h2>What this may and may not do</h2>
 * It only ever upgrades {@link ConversationMode#GENERAL_CONSULTING}, and only when the previous
 * assistant turn was already {@code PROJECT_DISCOVERY}. Every other verdict is left exactly as the
 * classifier made it, which is what keeps the rest of the pipeline true mid-discovery:
 *
 * <ul>
 *   <li>a confidentiality probe is still {@code INTERNAL_BOUNDARY} — that verdict is reached
 *       before this stage can apply and is never one of the two it touches;</li>
 *   <li>"what is MESA?" is still {@code GROUNDED_QA} and still retrieves, so a visitor can ask
 *       about a product mid-discussion without the answer being invented;</li>
 *   <li>a greeting is still {@code SOCIAL}, and a careers question still {@code CAREERS}.</li>
 * </ul>
 *
 * <p>It is deliberately not sticky in the other direction: once the classifier gives a specific
 * verdict, the conversation has moved on, and the next catch-all turn will not be pulled back into
 * discovery because the assistant turn before it was no longer discovery either.
 */
@Component
public class DiscoveryContinuityResolver {

    /**
     * How far back to look for the previous assistant turn. Two rows, because the immediately
     * preceding message is the visitor's current one only if it has already been saved — and the
     * orchestrator calls this before saving, so one row would usually be enough and two is the
     * cheap way not to depend on that ordering.
     */
    private static final int LOOKBACK = 4;

    private final AuraMessageRepository messageRepository;

    public DiscoveryContinuityResolver(AuraMessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public ScopeDecision resolve(ScopeDecision scope, UUID conversationId) {
        if (scope.mode() != ConversationMode.GENERAL_CONSULTING) {
            return scope;
        }
        return wasDiscussingAProject(conversationId)
                ? new ScopeDecision(ConversationMode.PROJECT_DISCOVERY, scope.confidentiality(),
                        scope.mentionsOrganisationSubject())
                : scope;
    }

    private boolean wasDiscussingAProject(UUID conversationId) {
        List<AuraMessage> recent = messageRepository.findByConversationIdOrderBySequenceDesc(
                conversationId, Limit.of(LOOKBACK));
        return recent.stream()
                .filter(message -> message.getMode() != null)
                .findFirst()
                .map(message -> message.getMode() == ConversationMode.PROJECT_DISCOVERY)
                .orElse(false);
    }
}
