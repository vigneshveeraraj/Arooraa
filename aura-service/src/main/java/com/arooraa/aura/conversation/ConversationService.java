package com.arooraa.aura.conversation;

import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.profile.AssistantProfileDefinition;
import com.arooraa.aura.conversation.profile.AssistantProfileResolver;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Conversation lifecycle: opening one, and finding one again. Kept apart from
 * {@link ConversationOrchestrator}, which is about a single turn — mixing the two would put session
 * management inside the request pipeline for no reason.
 *
 * <p>A conversation is pinned to the profile and channel it was opened under, and neither can be
 * changed afterwards. A client that could re-declare its profile per message could ask for a
 * broader one; here the routing context is decided once, by the server.
 */
@Service
public class ConversationService {

    private final AuraConversationRepository conversationRepository;
    private final AssistantProfileResolver profileResolver;

    public ConversationService(AuraConversationRepository conversationRepository,
                                AssistantProfileResolver profileResolver) {
        this.conversationRepository = conversationRepository;
        this.profileResolver = profileResolver;
    }

    @Transactional
    public AuraConversation open(String requestedProfileCode) {
        AssistantProfileDefinition profile = requestedProfileCode == null || requestedProfileCode.isBlank()
                ? profileResolver.defaultProfile()
                : profileResolver.resolve(requestedProfileCode)
                        .orElseThrow(() -> new UnknownAssistantProfileException(requestedProfileCode));
        return conversationRepository.save(
                new AuraConversation(profile.profile().code(), profile.channel().code()));
    }

    @Transactional(readOnly = true)
    public Optional<AuraConversation> find(UUID publicId) {
        return conversationRepository.findByPublicId(publicId);
    }
}
