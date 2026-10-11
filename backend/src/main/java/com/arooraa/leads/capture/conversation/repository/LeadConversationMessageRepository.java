package com.arooraa.leads.capture.conversation.repository;

import com.arooraa.leads.capture.conversation.domain.LeadConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeadConversationMessageRepository extends JpaRepository<LeadConversationMessage, UUID> {

    boolean existsByExternalMessageId(String externalMessageId);

    List<LeadConversationMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
}
