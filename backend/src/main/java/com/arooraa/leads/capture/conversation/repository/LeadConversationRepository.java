package com.arooraa.leads.capture.conversation.repository;

import com.arooraa.leads.capture.conversation.domain.ConversationChannel;
import com.arooraa.leads.capture.conversation.domain.LeadConversation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeadConversationRepository extends JpaRepository<LeadConversation, UUID> {

    /** Row-locked, so two messages from the same sender arriving together are handled one after the other. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from LeadConversation c where c.channel = :channel and c.participantHash = :participantHash")
    Optional<LeadConversation> findForUpdate(@Param("channel") ConversationChannel channel,
                                             @Param("participantHash") String participantHash);

    List<LeadConversation> findByLeadCaptureId(UUID leadCaptureId);
}
