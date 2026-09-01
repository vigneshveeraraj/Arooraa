package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.MessageRole;

import java.util.List;

/**
 * The bounded slice of a conversation replayed to the model — oldest first, already trimmed to fit
 * both the turn count and the character budget.
 *
 * <p>Bounded, and only bounded: this is short-term working memory for one session, never a profile
 * of a person. Nothing here is persisted beyond the conversation row it came from, nothing is
 * indexed, and nothing follows a visitor into their next conversation.
 */
public record ConversationContext(List<Turn> turns) {

    public record Turn(MessageRole role, String content) {
    }

    public static ConversationContext empty() {
        return new ConversationContext(List.of());
    }

    public boolean isEmpty() {
        return turns.isEmpty();
    }
}
