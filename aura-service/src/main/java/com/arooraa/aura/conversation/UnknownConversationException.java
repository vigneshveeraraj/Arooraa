package com.arooraa.aura.conversation;

import java.util.UUID;

/**
 * The conversation a caller named does not exist. Thrown from inside the turn's own transaction,
 * because that is now the only place a conversation is ever looked up — see
 * {@link ConversationOrchestrator#respond} for why the lookup moved there.
 *
 * <p>Carries the public identifier only. The surrogate primary key never appears in an exception
 * any more than it appears in a response.
 */
public class UnknownConversationException extends RuntimeException {

    private final UUID conversationId;

    public UnknownConversationException(UUID conversationId) {
        super("Unknown conversation: " + conversationId);
        this.conversationId = conversationId;
    }

    public UUID conversationId() {
        return conversationId;
    }
}
