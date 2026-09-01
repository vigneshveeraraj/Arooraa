package com.arooraa.aura.conversation.repository;

import com.arooraa.aura.conversation.domain.AuraMessage;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuraMessageRepository extends JpaRepository<AuraMessage, UUID> {

    List<AuraMessage> findByConversationIdOrderBySequenceAsc(UUID conversationId);

    /**
     * The newest turns first, capped — the query behind bounded session memory. Fetching the tail
     * rather than the whole transcript keeps a long conversation from silently growing the prompt
     * (and its cost) without limit; the caller re-orders chronologically.
     */
    List<AuraMessage> findByConversationIdOrderBySequenceDesc(UUID conversationId, Limit limit);

    long countByConversationId(UUID conversationId);
}
