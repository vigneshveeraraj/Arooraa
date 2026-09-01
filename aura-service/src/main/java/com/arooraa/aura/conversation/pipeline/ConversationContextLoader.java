package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Pipeline stage 5. Loads bounded session memory: the last {@code aura.chat.max-history-messages}
 * turns, further trimmed to {@code aura.chat.max-history-chars}.
 *
 * <p>Two independent caps because they fail in different ways. The message count stops a long
 * conversation from growing the prompt forever; the character budget stops a handful of very long
 * turns from doing the same thing in three messages. Trimming drops the oldest turns first, so the
 * visitor's most recent context — the part they are most likely to be referring to — always
 * survives.
 */
@Component
public class ConversationContextLoader {

    private final AuraMessageRepository messageRepository;
    private final ChatProperties properties;

    public ConversationContextLoader(AuraMessageRepository messageRepository, ChatProperties properties) {
        this.messageRepository = messageRepository;
        this.properties = properties;
    }

    public ConversationContext load(UUID conversationId) {
        List<AuraMessage> newestFirst = messageRepository.findByConversationIdOrderBySequenceDesc(
                conversationId, Limit.of(properties.maxHistoryMessages()));
        if (newestFirst.isEmpty()) {
            return ConversationContext.empty();
        }

        List<ConversationContext.Turn> selected = new ArrayList<>();
        int budget = properties.maxHistoryChars();
        for (AuraMessage message : newestFirst) {
            int cost = message.getContent().length();
            if (cost > budget) {
                break;
            }
            budget -= cost;
            selected.add(new ConversationContext.Turn(message.getRole(), message.getContent()));
        }
        Collections.reverse(selected);
        return new ConversationContext(List.copyOf(selected));
    }
}
