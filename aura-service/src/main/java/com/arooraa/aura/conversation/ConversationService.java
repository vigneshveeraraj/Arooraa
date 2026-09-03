package com.arooraa.aura.conversation;

import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.profile.AssistantProfileDefinition;
import com.arooraa.aura.conversation.profile.AssistantProfileResolver;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.insight.AuraInsightRecorder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Conversation lifecycle: opening one, and finding one again. Kept apart from
 * {@link ConversationOrchestrator}, which is about a single turn — mixing the two would put session
 * management inside the request pipeline for no reason.
 *
 * <p>A conversation is pinned to the profile and channel it was opened under, and neither can be
 * changed afterwards. A client that could re-declare its profile per message could ask for a
 * broader one; here the routing context is decided once, by the server.
 *
 * <p>There is deliberately no {@code find} here any more. Handing a loaded conversation back out of
 * a read-only transaction, for someone else's write transaction to save again, is precisely what
 * produced the A3.2 stale-version defect — so looking a conversation up now happens only inside the
 * transaction that is about to use it (see {@link ConversationOrchestrator#respond}).
 */
@Service
public class ConversationService {

    private final AuraConversationRepository conversationRepository;
    private final AssistantProfileResolver profileResolver;
    private final AuraInsightRecorder insightRecorder;

    public ConversationService(AuraConversationRepository conversationRepository,
                                AssistantProfileResolver profileResolver,
                                AuraInsightRecorder insightRecorder) {
        this.conversationRepository = conversationRepository;
        this.profileResolver = profileResolver;
        this.insightRecorder = insightRecorder;
    }

    @Transactional
    public AuraConversation open(String requestedProfileCode) {
        AssistantProfileDefinition profile = requestedProfileCode == null || requestedProfileCode.isBlank()
                ? profileResolver.defaultProfile()
                : profileResolver.resolve(requestedProfileCode)
                        .orElseThrow(() -> new UnknownAssistantProfileException(requestedProfileCode));
        AuraConversation conversation = conversationRepository.save(
                new AuraConversation(profile.profile().code(), profile.channel().code()));
        // Counted so the funnel has a denominator: everything else here is a fraction of "somebody
        // opened a conversation", and without it those numbers mean nothing.
        insightRecorder.conversationStarted(conversation.getId(), profile.channel().code());
        return conversation;
    }
}
